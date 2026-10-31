//! Authentication module — dual-secret JWT and related helpers.

pub mod error;
pub mod jwt;

pub use error::{AuthError, AuthResult};
pub use jwt::{Claims, JwtService, TokenKind};
