//! Authentication and JWT error types.

use thiserror::Error;

#[derive(Debug, Error)]
pub enum AuthError {
    #[error("invalid or expired token")]
    InvalidToken,

    #[error("token missing required claim: {0}")]
    MissingClaim(&'static str),

    #[error("token algorithm not allowed")]
    AlgorithmNotAllowed,

    #[error("token issuer mismatch")]
    InvalidIssuer,

    #[error("token audience mismatch")]
    InvalidAudience,

    #[error("configuration error: {0}")]
    Config(&'static str),

    #[error("token encode/decode error: {0}")]
    Codec(String),
}

pub type AuthResult<T> = Result<T, AuthError>;
