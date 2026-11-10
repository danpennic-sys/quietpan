# Quiet Pan — Production Readiness Checklist

**Version:** 1.2 (evidence-based operational gate)  
**Date:** 2026-11-10  
**Status:** Required before production promotion

This checklist applies only to the production environment. All items are mandatory unless explicitly marked optional. Any unmet required item must be documented as an exception with an owner, compensating control, and expiry date.

## Production Gate Rules

- [ ] This checklist is being reviewed against the exact production deployment being promoted.
- [ ] All required checks below are complete and verified with evidence.
- [ ] No unresolved critical exceptions remain open.
- [ ] Rollback plan is documented and tested.
- [ ] Production authorization is granted by the required approvers below.

## 1. Secrets & Cryptography

| Check | Owner | Evidence | Status |
|-------|-------|----------|--------|
| [ ] `JWT_SECRET` is at least 86 characters of high-entropy base64 (generated with `openssl rand -base64 64` or better) | Engineering | Vault record / generated output / config snapshot |  |
| [ ] `JWT_SECRET` is unique to production and never shared with staging/dev | Security | Secret manager evidence / environment mapping |  |
| [ ] Argon2 parameters meet minimums: `ARGON2_MEMORY_KIB >= 65536`, `ARGON2_ITERATIONS >= 3`, `ARGON2_PARALLELISM >= 1` | Engineering | Runtime config + service startup logs |  |
| [ ] `CRYPTO_PQC_HYBRID_ENABLED` decision is recorded; if false, a plan or rationale exists and is approved | Security | Architecture decision record / issue link |  |
| [ ] Secrets rotation playbook reviewed and owners assigned (`docs/SECRETS_ROTATION.md`) | Security | Approved runbook + owner list |  |
| [ ] Dual-secret support (`JWT_SECRET` + `JWT_SECRET_PREVIOUS`) is implemented in the application | Engineering | Code review / deployment manifest / runtime verification |  |
| [ ] JWT rotation dry-run completed successfully in staging (see dry-run checklist in `docs/SECRETS_ROTATION.md`) | Security / Engineering | Dry-run evidence package + sign-off |  |

## 2. Single Source of Truth

| Check | Owner | Evidence | Status |
|-------|-------|----------|--------|
| [ ] Identity: Supabase Auth is the system of record | Product / Engineering | Config review / auth integration evidence |  |
| [ ] Database: Supabase Postgres (pooler) is used in production; local Postgres is only for development | Engineering | Connection string / deployment config |  |
| [ ] No mixed self-hosted Postgres + Supabase service-role usage exists in the same environment | Engineering / Security | Deployment architecture review |  |

## 3. Network & Transport

| Check | Owner | Evidence | Status |
|-------|-------|----------|--------|
| [ ] `APP_BASE_URL` starts with `https://` | Engineering | Config snapshot / app startup logs |  |
| [ ] `SESSION_COOKIE_SECURE=true` | Engineering | Runtime config proof |  |
| [ ] `SESSION_COOKIE_SAME_SITE` is `Strict` or `Lax` (not `None` unless required and properly configured) | Security | Config review / browser behavior validation |  |
| [ ] TLS termination is correct; `APP_TLS_*` or platform TLS is in place | DevOps / Security | TLS config + certificate proof |  |
| [ ] `HSTS_ENABLED=true`; preload is only enabled after domain is on the HSTS preload list | Security / DevOps | HSTS configuration + preload status |  |
| [ ] `CORS_ALLOWED_ORIGINS` contains only exact production origins (no wildcards) | Security | Config snapshot / browser test |  |

## 4. Payments & External Services

| Check | Owner | Evidence | Status |
|-------|-------|----------|--------|
| [ ] `STRIPE_TEST_MODE=false` | Engineering | Config snapshot |  |
| [ ] Live Stripe keys are in use (`sk_live_...` and valid live webhook secret) | Engineering | Stripe dashboard / key metadata |  |
| [ ] Resend or the configured email provider uses a production API key and verified domain | Engineering | Provider dashboard / verified domain proof |  |
| [ ] Supabase project is the production project, not the free-tier / development project | Engineering | Supabase project metadata |  |

## 5. Development Flags (All Must Be False)

| Check | Owner | Evidence | Status |
|-------|-------|----------|--------|
| [ ] `DEV_SEED_DATABASE=false` | Engineering | Config snapshot |  |
| [ ] `DEV_FAKE_EMAILS=false` | Engineering | Config snapshot |  |
| [ ] `DEV_FAKE_PAYMENTS=false` | Engineering | Config snapshot |  |
| [ ] `DEV_PLAYGROUND_ENABLED=false` | Engineering | Config snapshot |  |
| [ ] `DEV_REQUEST_LOGGING=false` (or accepted risk) | Engineering / Security | Config snapshot + risk exception |  |
| [ ] `DEV_SQL_LOGGING=false` | Engineering | Config snapshot |  |
| [ ] `DATABASE_MIGRATE_ON_START=false` (migrations run explicitly) | Engineering | Deployment logs / migration run record |  |

## 6. Observability & Operations

| Check | Owner | Evidence | Status |
|-------|-------|----------|--------|
| [ ] `SENTRY_DSN` is configured or an equivalent error-tracking system is in place | Engineering | DSN config / dashboard validation |  |
| [ ] Health check endpoint is live and monitored | DevOps / Engineering | Health check result + alert rule |  |
| [ ] Metrics endpoint is scraped or an equivalent APM is active | DevOps | APM configuration / dashboard proof |  |
| [ ] Log aggregation is in place | DevOps | Log sink configuration / sample logs |  |
| [ ] Backup / point-in-time recovery has been verified for the production database | DevOps / Engineering | Backup report / restore validation evidence |  |
| [ ] On-call / incident-response path is defined and tested | Engineering / Product | Incident runbook / escalation chain |  |

## 7. Validation & Release Checks

| Check | Owner | Evidence | Status |
|-------|-------|----------|--------|
| [ ] `./scripts/validate-env.sh .env.production` passes with zero errors | Engineering | Command output / CI artifact |  |
| [ ] Application starts successfully and `validate_production_invariants` returns `Ok` | Engineering | Start logs / test output |  |
| [ ] Smoke tests pass: login, token refresh, payment webhook, email send, health check | Engineering | Test report / deployment evidence |  |
| [ ] Rollback procedure has been reviewed and tested | Engineering / DevOps | Rollback log / restore drill |  |
| [ ] Production deployment artifact is pinned to the approved commit and environment | Engineering | Deployment record / commit hash |  |

## 8. Exception Handling (Required When Any Item Is Not Met)

| Item | Risk | Compensating Control | Owner | Expiry Date | Status |
|------|------|---------------------|-------|------------|--------|
| [ ] No unresolved exceptions |  |  |  |  |  |

If a required item is not met, the team must document:

- the exact gap;
- why the risk is acceptable or how it is compensated;
- who owns the residual risk;
- when the exception expires and how it will be closed.

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Engineering Lead |  |  |  |
| Security |  |  |  |
| DevOps / Infrastructure |  |  |  |
| Product / Owner |  |  |  |

Only after all boxes are checked, all required evidence is attached, and sign-off is complete may the environment be considered production-ready.

## Authorization Statement

Production authorization is granted only when:

- all required checks pass;
- no unresolved critical exceptions remain;
- evidence has been reviewed;
- required sign-off has been completed.

If any statement above is false, production readiness is not established.
