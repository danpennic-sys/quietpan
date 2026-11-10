# Quiet Pan — Production Readiness Checklist

**Version:** 1.3 (evidence-based operational gate)  
**Date:** 2026-11-10  
**Status:** Required before production promotion

This checklist applies to the exact production candidate and environment being promoted. All controls are mandatory unless explicitly marked optional. A control is **PASS** only when its required evidence is attached or linked and reviewed. An exception does not change a control’s status to PASS; it may support an explicitly authorized **GO-with-exceptions** decision under Section 9.

## Production Gate Rules

- [ ] Candidate, environment, release/build ID, and planned promotion window are recorded.
- [ ] Every required control is marked PASS or has an approved, in-scope, unexpired exception with an evidenced compensating control.
- [ ] Evidence meets the minimums in Appendix A, is attributable to this exact candidate, and contains no secret material.
- [ ] No exception is expired, out of scope, missing an approver, or missing a compensating control.
- [ ] Rollback/recovery readiness and operational monitoring meet their control requirements.
- [ ] The final decision is recorded as GO, GO-with-exceptions, or HOLD and signed by the required approvers.

## 1. Secrets & Cryptography

| Check | Owner | Evidence reference | Status |
|-------|-------|--------------------|--------|
| [ ] `JWT_SECRET` is at least 86 characters of high-entropy base64 (generated with `openssl rand -base64 64` or better) | Engineering |  |  |
| [ ] `JWT_SECRET` is unique to production and never shared with staging/dev | Security |  |  |
| [ ] Argon2 parameters meet minimums: `ARGON2_MEMORY_KIB >= 65536`, `ARGON2_ITERATIONS >= 3`, `ARGON2_PARALLELISM >= 1` | Engineering |  |  |
| [ ] `CRYPTO_PQC_HYBRID_ENABLED` decision is recorded; if false, a plan or rationale exists and is approved | Security |  |  |
| [ ] Secrets rotation playbook reviewed and owners assigned (`docs/SECRETS_ROTATION.md`) | Security |  |  |
| [ ] Dual-secret support (`JWT_SECRET` + `JWT_SECRET_PREVIOUS`) is implemented in the application | Engineering |  |  |
| [ ] JWT rotation dry-run completed successfully in staging (see dry-run checklist in `docs/SECRETS_ROTATION.md`) | Security / Engineering |  |  |
| [ ] No plaintext secrets are present in the repository, build artifacts, or CI logs; release access is scoped to the release identity | Security / DevOps |  |  |

## 2. Single Source of Truth

| Check | Owner | Evidence reference | Status |
|-------|-------|--------------------|--------|
| [ ] Identity: Supabase Auth is the system of record | Product / Engineering |  |  |
| [ ] Database: Supabase Postgres (pooler) is used in production; local Postgres is only for development | Engineering |  |  |
| [ ] No mixed self-hosted Postgres + Supabase service-role usage exists in the same environment | Engineering / Security |  |  |

## 3. Network & Transport

| Check | Owner | Evidence reference | Status |
|-------|-------|--------------------|--------|
| [ ] `APP_BASE_URL` starts with `https://` | Engineering |  |  |
| [ ] `SESSION_COOKIE_SECURE=true` | Engineering |  |  |
| [ ] `SESSION_COOKIE_SAME_SITE` is `Strict` or `Lax` (not `None` unless required and properly configured) | Security |  |  |
| [ ] TLS termination is correct; `APP_TLS_*` or platform TLS is in place | DevOps / Security |  |  |
| [ ] `HSTS_ENABLED=true`; preload is only enabled after domain is on the HSTS preload list | Security / DevOps |  |  |
| [ ] `CORS_ALLOWED_ORIGINS` contains only exact production origins (no wildcards) | Security |  |  |

## 4. Payments & External Services

| Check | Owner | Evidence reference | Status |
|-------|-------|--------------------|--------|
| [ ] `STRIPE_TEST_MODE=false` | Engineering |  |  |
| [ ] Live Stripe keys are in use (`sk_live_...` and valid live webhook secret) | Engineering |  |  |
| [ ] Resend or the configured email provider uses a production API key and verified domain | Engineering |  |  |
| [ ] Supabase project is the production project, not the free-tier / development project | Engineering |  |  |

## 5. Development Flags (All Must Be False)

| Check | Owner | Evidence reference | Status |
|-------|-------|--------------------|--------|
| [ ] `DEV_SEED_DATABASE=false` | Engineering |  |  |
| [ ] `DEV_FAKE_EMAILS=false` | Engineering |  |  |
| [ ] `DEV_FAKE_PAYMENTS=false` | Engineering |  |  |
| [ ] `DEV_PLAYGROUND_ENABLED=false` | Engineering |  |  |
| [ ] `DEV_REQUEST_LOGGING=false` (or an approved exception is recorded) | Engineering / Security |  |  |
| [ ] `DEV_SQL_LOGGING=false` | Engineering |  |  |
| [ ] `DATABASE_MIGRATE_ON_START=false` (migrations run explicitly) | Engineering |  |  |

## 6. Observability & Operations

| Check | Owner | Evidence reference | Status |
|-------|-------|--------------------|--------|
| [ ] `SENTRY_DSN` is configured or an equivalent error-tracking system is in place | Engineering |  |  |
| [ ] Health check endpoint is live and monitored | DevOps / Engineering |  |  |
| [ ] Metrics endpoint is scraped or an equivalent APM is active | DevOps |  |  |
| [ ] Log aggregation is in place | DevOps |  |  |
| [ ] Backup / point-in-time recovery has been verified for the production database | DevOps / Engineering |  |  |
| [ ] On-call / incident-response path is defined and tested | Engineering / Product |  |  |

## 7. Validation & Release Checks

| Check | Owner | Evidence reference | Status |
|-------|-------|--------------------|--------|
| [ ] `./scripts/validate-env.sh .env.production` passes with zero errors | Engineering |  |  |
| [ ] Application starts successfully and `validate_production_invariants` returns `Ok` | Engineering |  |  |
| [ ] Smoke tests pass: login, token refresh, payment webhook, email send, health check | Engineering |  |  |
| [ ] Required unit, integration, and end-to-end tests pass for the release candidate | QA / Engineering |  |  |
| [ ] Deployment plan shows no unexplained or unapproved changes and all targets are healthy | DevOps |  |  |
| [ ] Production deployment artifact is pinned to the approved commit and environment | Engineering / DevOps |  |  |

## 8. Exception Handling

Exceptions are not silent overrides and do not convert a failed or unverified control to PASS. Create a separate record for each unmet control. Each record must identify:

- exact control, candidate/build ID, production environment, and scope of the exception;
- reason, residual risk, and evidenced compensating control;
- accountable release owner and named approver authorized to accept the residual risk;
- approval date and explicit expiry date/time (including timezone), plus the closure plan;
- evidence that the compensating control is active for this candidate.

An exception is valid only when approved before promotion, limited to its documented scope, and unexpired. It cannot be reused for another candidate or environment without renewed review and approval. Expired, out-of-scope, unapproved, or unsupported exceptions require **HOLD**. An exception does not waive legal, contractual, or organizational requirements.

| Control / gap | Candidate + scope | Residual risk | Compensating control + evidence | Release owner | Approver | Approved at | Expires at | Status |
|---------------|------------------|--------------|--------------------------------|---------------|----------|-------------|------------|--------|
|  |  |  |  |  |  |  |  |  |

## 9. Final Decision & Sign-off

Record exactly one decision:

- **GO** — all required controls PASS; evidence is reviewed; no exceptions are used.
- **GO-with-exceptions** — every required control is PASS or covered by an approved, in-scope, unexpired exception with an evidenced compensating control; no HOLD condition applies.
- **HOLD** — any required control is neither PASS nor covered by a valid exception, evidence is insufficient, an exception is invalid/expired, or required approval is missing.

**Candidate / build ID:**  
**Production environment:**  
**Decision:** GO / GO-with-exceptions / HOLD  
**Evidence package location:**  
**Decision timestamp (include timezone):**  

| Required role | Name | Decision / scope approved | Date/time | Signature / approval reference |
|---------------|------|---------------------------|-----------|--------------------------------|
| Release Owner |  |  |  |  |
| DevOps / Infrastructure |  |  |  |  |
| Security approver (for security exceptions) |  |  |  |  |
| Authorized risk approver |  |  |  |  |

**Authorization statement:** All required controls are PASS or have an approved, in-scope, unexpired exception with an evidenced compensating control. Evidence is attached or linked to this candidate. The recorded decision is GO, GO-with-exceptions, or HOLD. Production promotion is authorized only for GO or GO-with-exceptions and only within the documented candidate, environment, and exception scope. A HOLD decision prohibits promotion.

## Appendix A — Minimum Evidence Examples

Evidence must be attributable to the exact candidate and production environment, timestamped where applicable, accessible to the reviewer, and retained with the release record. Redact sensitive values; never attach secret values, bearer tokens, or secret fragments. An equivalent tool is acceptable when it produces the same verifiable information.

| Control area | Minimum acceptable evidence | Owner | Block condition |
|---------------|-----------------------------|-------|-----------------|
| Build / artifact integrity | Deployment manifest or release record with the SHA-256 digest matching the candidate artifact, plus `cosign verify` or equivalent signature-verification output for that exact artifact; include commit/build ID. | DevOps | Digest mismatch, missing required signature, unverifiable artifact, or evidence for a different candidate. |
| Secret / credential hygiene | Secret-manager record or appropriately redacted screenshot showing secret version/identifier, last-rotation date, and access policy scoped to the release identity; repository and CI secret-scan results for the candidate. Never include secret values. | Security / DevOps | Plaintext secret found, access not appropriately scoped, evidence absent, or rotation exceeds the organization’s approved policy window. |
| Test coverage & results | Named, retained test reports (for example, `unit-report-<date>.xml` and `e2e-report-<date>.html`) with pass/fail summary, coverage result against the agreed threshold, and link to the exact build ID. | QA / Engineering | Critical-path failure, report/build mismatch, missing report, or coverage below the agreed threshold without a valid exception. |
| Deployment readiness | Captured output from the applicable deployment tool (for example, `kubectl rollout status`, `helm diff`, or equivalent) showing the candidate, no unexplained pending changes, successful rollout, and healthy targets; include command exit status. | DevOps | Non-zero command exit, unexplained pending changes, degraded/unhealthy targets, or candidate mismatch. |
| Rollback / recovery | Versioned incident/rollback runbook link plus evidence of the last successful drill, restore test, or canary-abort test applicable to this service class, with date, outcome, and candidate/service reference. | SRE / DevOps | Missing runbook, failed drill, or drill older than the organization’s approved policy interval. |
| Observability | Dashboard link and alert-rule export/config reference showing the release candidate’s critical-path metrics, alert thresholds, and paging/escalation path; include a successful alert test or equivalent validation record. | SRE | Critical-path metric or paging path missing, or alert not tested. |
| Exception handling | Signed exception record identifying the exact control, candidate, environment/scope, residual risk, compensating control and its evidence, accountable owner, authorized approver, approval timestamp, expiry timestamp, and closure plan. | Release Owner + authorized approver | Exception missing required fields or approval, out of scope, expired, or without an active evidenced compensating control. |
| Configuration & security controls | Redacted effective-configuration export or runtime validation output for the named production candidate, together with relevant TLS/CORS/cookie/security test results. No credentials or secret values. | Engineering / Security | Required setting is unverified or fails, evidence is not candidate-specific, or sensitive material is exposed. |
| Data services & external providers | Redacted project/account identifiers and provider configuration/status evidence confirming production endpoints, live/test mode as required, and successful non-destructive connectivity or integration checks. | Engineering | Wrong project/account, test mode where live is required, failed integration check, or exposed credential. |
| Backups & incident response | Database backup/PITR status and a dated restore-validation result; versioned on-call/incident runbook and escalation test or confirmation. | DevOps / Engineering | Backup/restore cannot be demonstrated or responders/escalation path are not established. |

If an organization-specific policy threshold or interval (such as rotation cadence, coverage target, or drill recency) is not defined, record and approve it before relying on this checklist; do not infer a threshold during the release review.
