//! Quiet Pan — core library.
//!
//! Dual-secret JWT verification is implemented in [`auth::JwtService`].

pub mod auth;
pub mod config;

pub use auth::{AuthError, AuthResult, Claims, JwtService, TokenKind};
pub use config::{validate_production_invariants, Config};
