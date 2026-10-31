# Quiet Pan — Production Readiness Checklist

**Version:** 1.1 (dual-secret + drill-ready)  
**Date:** 2026-10-31

Use this checklist before promoting any environment to production. All items are mandatory unless explicitly marked optional.

## Secrets & Cryptography

- [ ] `JWT_SECRET` is ≥86 characters of high-entropy base64 (generated with `openssl rand -base64 64` or better)
- [ ] `JWT_SECRET` is unique to production (never shared with staging/dev)
- [ ] Argon2 parameters: `ARGON2_MEMORY_KIB ≥ 65536`, `ARGON2_ITERATIONS ≥ 3`, `ARGON2_PARALLELISM ≥ 1`
- [ ] `CRYPTO_PQC_HYBRID_ENABLED` decision recorded (currently false is acceptable; plan exists)
- [ ] Secrets rotation playbook reviewed and owners assigned (`docs/SECRETS_ROTATION.md`)
- [ ] Dual-secret support (`JWT_SECRET` + `JWT_SECRET_PREVIOUS`) is implemented in the application
- [ ] JWT rotation dry-run completed successfully in staging (see dry-run checklist in `docs/SECRETS_ROTATION.md`)

## Single Source of Truth

- [ ] Identity: Supabase Auth is the system of record
- [ ] Database: Supabase Postgres (pooler) used in production; local Postgres only for development
- [ ] No mixed self-hosted Postgres + Supabase service-role in the same environment

## Network & Transport

- [ ] `APP_BASE_URL` starts with `https://`
- [ ] `SESSION_COOKIE_SECURE=true`
- [ ] `SESSION_COOKIE_SAME_SITE` is `Strict` or `Lax` (not `None` unless required and properly configured)
- [ ] TLS termination correct; `APP_TLS_*` or platform TLS in place
- [ ] `HSTS_ENABLED=true`; preload only after domain is on the HSTS preload list
- [ ] `CORS_ALLOWED_ORIGINS` lists exact production origins (no wildcards)

## Payments & External Services

- [ ] `STRIPE_TEST_MODE=false`
- [ ] Live Stripe keys in use (`sk_live_...`, live webhook secret)
- [ ] Resend (or email provider) using production API key and verified domain
- [ ] Supabase project is production project (not the free-tier / development project)

## Development Flags (All Must Be False)

- [ ] `DEV_SEED_DATABASE=false`
- [ ] `DEV_FAKE_EMAILS=false`
- [ ] `DEV_FAKE_PAYMENTS=false`
- [ ] `DEV_PLAYGROUND_ENABLED=false`
- [ ] `DEV_REQUEST_LOGGING=false` (or accepted risk)
- [ ] `DEV_SQL_LOGGING=false`
- [ ] `DATABASE_MIGRATE_ON_START=false` (migrations run explicitly)

## Observability & Operations

- [ ] `SENTRY_DSN` configured (or equivalent error tracking)
- [ ] Health check endpoint live and monitored
- [ ] Metrics endpoint scraped (or alternative APM)
- [ ] Log aggregation in place
- [ ] Backup / point-in-time recovery verified for the production database
- [ ] On-call / incident response path defined

## Validation

- [ ] `./scripts/validate-env.sh .env.production` passes with zero errors
- [ ] Application starts and `validate_production_invariants` returns Ok
- [ ] Smoke tests: login, token refresh, payment webhook, email send, health check

## Sign-off

| Role              | Name | Date | Signature |
|-------------------|------|------|-----------|
| Engineering Lead  |      |      |           |
| Security          |      |      |           |
| Product / Owner   |      |      |           |

Only after all boxes are checked and sign-off is complete may the environment be considered production-ready.
