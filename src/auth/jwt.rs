//! Dual-secret JWT encode / verify for Quiet Pan (HS256).
//!
//! Contract (see docs/SECRETS_ROTATION.md):
//!   - Issue tokens with:     JWT_SECRET (current)
//!   - Verify tokens against: JWT_SECRET, then JWT_SECRET_PREVIOUS (if set)

use std::time::{SystemTime, UNIX_EPOCH};

use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use hmac::{Hmac, Mac};
use serde::{Deserialize, Serialize};
use sha2::Sha256;

use super::error::{AuthError, AuthResult};
use crate::config::Config;

type HmacSha256 = Hmac<Sha256>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub iss: String,
    pub aud: String,
    pub exp: i64,
    pub iat: i64,
    pub jti: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sid: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TokenKind {
    Access,
    Refresh,
}

#[derive(Clone)]
pub struct JwtService {
    current_secret: String,
    previous_secret: Option<String>,
    issuer: String,
    audience: String,
    access_ttl_secs: i64,
    refresh_ttl_secs: i64,
}

impl JwtService {
    pub fn from_config(cfg: &Config) -> AuthResult<Self> {
        if cfg.jwt_algorithm != "HS256" {
            return Err(AuthError::Config(
                "dual-secret path supports HS256 only; use key-file path for RS*/ES*",
            ));
        }

        let previous = cfg
            .jwt_secret_previous
            .as_ref()
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty());

        if let Some(ref prev) = previous {
            if prev == &cfg.jwt_secret {
                return Err(AuthError::Config(
                    "JWT_SECRET_PREVIOUS must differ from JWT_SECRET",
                ));
            }
        }

        Ok(Self {
            current_secret: cfg.jwt_secret.clone(),
            previous_secret: previous,
            issuer: cfg.jwt_issuer.clone(),
            audience: cfg.jwt_audience.clone(),
            access_ttl_secs: cfg.jwt_access_ttl_secs as i64,
            refresh_ttl_secs: cfg.jwt_refresh_ttl_secs as i64,
        })
    }

    pub fn issue(
        &self,
        subject: impl Into<String>,
        kind: TokenKind,
        session_id: Option<String>,
    ) -> AuthResult<String> {
        let now = now_secs();
        let ttl = match kind {
            TokenKind::Access => self.access_ttl_secs,
            TokenKind::Refresh => self.refresh_ttl_secs,
        };

        let claims = Claims {
            sub: subject.into(),
            iss: self.issuer.clone(),
            aud: self.audience.clone(),
            iat: now,
            exp: now + ttl,
            jti: new_jti(),
            sid: session_id,
        };

        encode_hs256(&claims, &self.current_secret)
    }

    pub fn verify(&self, token: &str) -> AuthResult<Claims> {
        match decode_hs256(token, &self.current_secret) {
            Ok(claims) => return self.validate_claims(claims),
            Err(AuthError::InvalidToken) => {}
            Err(e) => return Err(e),
        }

        if let Some(ref prev) = self.previous_secret {
            if let Ok(claims) = decode_hs256(token, prev) {
                return self.validate_claims(claims);
            }
        }

        Err(AuthError::InvalidToken)
    }

    pub fn is_rotation_window_active(&self) -> bool {
        self.previous_secret.is_some()
    }

    fn validate_claims(&self, claims: Claims) -> AuthResult<Claims> {
        let now = now_secs();
        if claims.exp + 30 < now {
            return Err(AuthError::InvalidToken);
        }
        if claims.iss != self.issuer {
            return Err(AuthError::InvalidIssuer);
        }
        if claims.aud != self.audience {
            return Err(AuthError::InvalidAudience);
        }
        if claims.sub.is_empty() {
            return Err(AuthError::MissingClaim("sub"));
        }
        Ok(claims)
    }
}

fn now_secs() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0)
}

fn new_jti() -> String {
    let t = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    format!("{:x}-{:x}", t, t.wrapping_mul(0x9e37_79b9_7f4a_7c15))
}

fn encode_hs256(claims: &Claims, secret: &str) -> AuthResult<String> {
    let header = serde_json::json!({"alg":"HS256","typ":"JWT"});
    let header_b64 = URL_SAFE_NO_PAD.encode(header.to_string().as_bytes());
    let payload = serde_json::to_vec(claims).map_err(|e| AuthError::Codec(e.to_string()))?;
    let payload_b64 = URL_SAFE_NO_PAD.encode(&payload);
    let signing_input = format!("{}.{}", header_b64, payload_b64);
    let sig = hmac_sign(secret.as_bytes(), signing_input.as_bytes())?;
    let sig_b64 = URL_SAFE_NO_PAD.encode(&sig);
    Ok(format!("{}.{}", signing_input, sig_b64))
}

fn decode_hs256(token: &str, secret: &str) -> AuthResult<Claims> {
    let parts: Vec<&str> = token.split('.').collect();
    if parts.len() != 3 {
        return Err(AuthError::InvalidToken);
    }
    let signing_input = format!("{}.{}", parts[0], parts[1]);
    let expected = hmac_sign(secret.as_bytes(), signing_input.as_bytes())?;
    let provided = URL_SAFE_NO_PAD
        .decode(parts[2])
        .map_err(|_| AuthError::InvalidToken)?;

    if !constant_time_eq(&expected, &provided) {
        return Err(AuthError::InvalidToken);
    }

    let header_bytes = URL_SAFE_NO_PAD
        .decode(parts[0])
        .map_err(|_| AuthError::InvalidToken)?;
    let header: serde_json::Value =
        serde_json::from_slice(&header_bytes).map_err(|_| AuthError::InvalidToken)?;
    if header.get("alg").and_then(|v| v.as_str()) != Some("HS256") {
        return Err(AuthError::AlgorithmNotAllowed);
    }

    let payload_bytes = URL_SAFE_NO_PAD
        .decode(parts[1])
        .map_err(|_| AuthError::InvalidToken)?;
    let claims: Claims =
        serde_json::from_slice(&payload_bytes).map_err(|_| AuthError::InvalidToken)?;
    Ok(claims)
}

fn hmac_sign(key: &[u8], msg: &[u8]) -> AuthResult<Vec<u8>> {
    let mut mac =
        HmacSha256::new_from_slice(key).map_err(|e| AuthError::Codec(e.to_string()))?;
    mac.update(msg);
    Ok(mac.finalize().into_bytes().to_vec())
}

fn constant_time_eq(a: &[u8], b: &[u8]) -> bool {
    if a.len() != b.len() {
        return false;
    }
    let mut diff = 0u8;
    for (x, y) in a.iter().zip(b.iter()) {
        diff |= x ^ y;
    }
    diff == 0
}
