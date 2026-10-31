//! Application configuration.
//!
//! Production invariants are enforced via `validate_production_invariants`.

use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct Config {
    pub app_name: String,
    pub app_env: String,
    pub app_base_url: String,
    pub app_host: String,
    pub app_port: u16,
    pub app_version: String,

    pub jwt_secret: String,
    /// Previous secret used only during dual-secret rotation windows.
    pub jwt_secret_previous: Option<String>,
    pub jwt_algorithm: String,
    pub jwt_issuer: String,
    pub jwt_audience: String,
    pub jwt_access_ttl_secs: u64,
    pub jwt_refresh_ttl_secs: u64,

    pub argon2_memory_kib: u32,
    pub argon2_iterations: u32,
    pub argon2_parallelism: u32,

    pub database_url: String,
    pub database_max_connections: u32,
    pub database_min_connections: u32,
    pub database_migrate_on_start: bool,

    pub redis_url: String,

    pub session_cookie_secure: bool,
    pub session_cookie_same_site: String,
    pub session_ttl_secs: u64,

    pub stripe_secret_key: String,
    pub stripe_webhook_secret: String,
    pub stripe_test_mode: bool,

    pub resend_api_key: String,

    pub supabase_url: String,
    pub supabase_anon_key: String,
    pub supabase_service_role_key: String,
    pub supabase_jwt_secret: String,

    pub crypto_jwt_algorithms: String,
    pub crypto_session_key_rotation_days: u32,
    pub crypto_jwt_secret_rotation_days: u32,
    pub crypto_pqc_hybrid_enabled: bool,

    pub audit_log_enabled: bool,
    pub audit_log_retention_days: u32,

    pub ff_maintenance_mode: bool,
    pub ff_registration_enabled: bool,
    pub ff_invite_only: bool,

    pub dev_seed_database: bool,
    pub dev_fake_emails: bool,
    pub dev_fake_payments: bool,
    pub dev_playground_enabled: bool,
    pub dev_request_logging: bool,
    pub dev_sql_logging: bool,

    pub sentry_dsn: Option<String>,
    pub otel_enabled: bool,
}

/// Production-only cross-field validation.
pub fn validate_production_invariants(cfg: &Config) -> Result<(), Vec<String>> {
    let mut errors = Vec::new();

    if cfg.app_env != "production" {
        return Ok(());
    }

    if !cfg.session_cookie_secure {
        errors.push("SESSION_COOKIE_SECURE must be true in production".into());
    }
    if !cfg.app_base_url.starts_with("https://") {
        errors.push("APP_BASE_URL must start with https:// in production".into());
    }
    if cfg.stripe_test_mode {
        errors.push("STRIPE_TEST_MODE must be false in production".into());
    }
    if cfg.database_migrate_on_start {
        errors.push("DATABASE_MIGRATE_ON_START must be false in production".into());
    }
    if cfg.dev_seed_database
        || cfg.dev_fake_emails
        || cfg.dev_fake_payments
        || cfg.dev_playground_enabled
        || cfg.dev_request_logging
        || cfg.dev_sql_logging
    {
        errors.push("All DEV_* flags must be false in production".into());
    }
    if cfg.argon2_memory_kib < 65536 {
        errors.push("ARGON2_MEMORY_KIB must be ≥65536 in production".into());
    }
    if cfg.jwt_secret.len() < 86 {
        errors.push("JWT_SECRET must be ≥86 characters in production".into());
    }

    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}
