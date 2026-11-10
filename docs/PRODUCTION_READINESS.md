# Quiet Pan — Production Readiness Checklist

**Version:** 1.4 (enforceable production gate)  
**Policy snapshot:** 2026-11-09  
**Document date:** 2026-11-10  
**Status:** Enforceable; required before production promotion

## 1. Purpose and Prohibition

A candidate may not be promoted to production unless every applicable control is **PASS** or is covered by an approved exception that satisfies this policy. The gate outcome is strictly one of:

- **GO**
- **GO-with-exceptions**
- **HOLD**

No other states are recognized. This gate prevents checkbox theater, undefined evidence standards, silent exception drift, and ambiguous authorization.

This checklist applies to the exact production candidate and environment being promoted. Record the candidate/build identifier, artifact hash or equivalent, production environment, and planned promotion window.

## 2. Evidence Rules (Binding)

- Evidence must be linked or attached and attributable to the exact candidate (build identifier, artifact hash, or equivalent).
- A reviewer must be able to verify the control from the linked evidence in under one minute.
- Evidence that is missing, expired, or not attributable to the exact candidate results in **HOLD**.
- “Good enough,” verbal confirmation, or evidence from a prior candidate is not acceptable.
- Evidence must not contain secrets, bearer tokens, or secret fragments. Redact sensitive values while preserving enough information to verify the control.
- Appendix A defines minimum acceptable evidence. It is the acceptance standard, not optional guidance. Evidence must also satisfy the one-minute verifiability and exact-candidate rules above.

## 3. Exception Rules (Binding)

Every exception requires:

- a named **Release Owner** and a separate named **Approver**;
- the exact control, candidate, environment, and scope covered;
- recorded residual risk and a compensating control, with evidence that the control is active;
- an approval timestamp and explicit expiry date/time, including timezone;
- a closure plan.

An exception is valid only when approved before promotion, within its documented scope, and unexpired. An exception that lacks dual ownership, is past expiry, lacks a compensating control, or lacks required evidence is treated as a failed control and results in **HOLD**. Exceptions do not waive legal, contractual, or organizational requirements and cannot be carried to another candidate without renewed approval.

| Control / gap | Candidate + environment + scope | Residual risk | Compensating control + evidence | Release Owner | Approver | Approved at | Expires at (timezone) | Closure plan |
|---------------|---------------------------------|--------------|--------------------------------|---------------|----------|-------------|-----------------------|--------------|
|  |  |  |  |  |  |  |  |  |

## 4. Production Readiness Controls

For each row, check PASS only after the control is verified using linked or attached evidence that meets Sections 2 and Appendix A. If the check is not met, use the exception process in Section 3; do not mark it PASS.

### 4.1 Secrets & Cryptography

| Control | Owner | Evidence reference | Status (PASS / exception / HOLD) |
|---------|-------|--------------------|-----------------------------------|
| `JWT_SECRET` is at least 86 characters of high-entropy base64 (generated with `openssl rand -base64 64` or better). Never attach the secret itself. | Engineering |  |  |
| `JWT_SECRET` is unique to production and never shared with staging/dev. | Security |  |  |
| Argon2 parameters meet minimums: `ARGON2_MEMORY_KIB >= 65536`, `ARGON2_ITERATIONS >= 3`, `ARGON2_PARALLELISM >= 1`. | Engineering |  |  |
| `CRYPTO_PQC_HYBRID_ENABLED` decision is recorded; if false, an approved plan or rationale exists. | Security |  |  |
| Secrets rotation playbook reviewed and owners assigned (`docs/SECRETS_ROTATION.md`). | Security |  |  |
| Dual-secret support (`JWT_SECRET` + `JWT_SECRET_PREVIOUS`) is implemented in the application. | Engineering |  |  |
| JWT rotation dry-run completed successfully in staging (see `docs/SECRETS_ROTATION.md`). | Security / Engineering |  |  |
| No plaintext secrets are present in the repository, build artifacts, or CI logs; release access is scoped to the release identity. | Security / DevOps |  |  |

### 4.2 Single Source of Truth

| Control | Owner | Evidence reference | Status (PASS / exception / HOLD) |
|---------|-------|--------------------|-----------------------------------|
| Identity: Supabase Auth is the system of record. | Product / Engineering |  |  |
| Database: Supabase Postgres (pooler) is used in production; local Postgres is only for development. | Engineering |  |  |
| No mixed self-hosted Postgres + Supabase service-role usage exists in the same environment. | Engineering / Security |  |  |

### 4.3 Network & Transport

| Control | Owner | Evidence reference | Status (PASS / exception / HOLD) |
|---------|-------|--------------------|-----------------------------------|
| `APP_BASE_URL` starts with `https://`. | Engineering |  |  |
| `SESSION_COOKIE_SECURE=true`. | Engineering |  |  |
| `SESSION_COOKIE_SAME_SITE` is `Strict` or `Lax` (not `None` unless required and properly configured). | Security |  |  |
| TLS termination is correct; `APP_TLS_*` or platform TLS is in place. | DevOps / Security |  |  |
| `HSTS_ENABLED=true`; preload is only enabled after the domain is on the HSTS preload list. | Security / DevOps |  |  |
| `CORS_ALLOWED_ORIGINS` contains only exact production origins (no wildcards). | Security |  |  |

### 4.4 Payments & External Services

| Control | Owner | Evidence reference | Status (PASS / exception / HOLD) |
|---------|-------|--------------------|-----------------------------------|
| `STRIPE_TEST_MODE=false`. | Engineering |  |  |
| Live Stripe keys are in use (`sk_live_...` and valid live webhook secret). Do not include key values in evidence. | Engineering |  |  |
| Resend or the configured email provider uses a production API key and verified domain. | Engineering |  |  |
| Supabase project is the production project, not the free-tier / development project. | Engineering |  |  |

### 4.5 Development Flags (All Must Be False)

| Control | Owner | Evidence reference | Status (PASS / exception / HOLD) |
|---------|-------|--------------------|-----------------------------------|
| `DEV_SEED_DATABASE=false`. | Engineering |  |  |
| `DEV_FAKE_EMAILS=false`. | Engineering |  |  |
| `DEV_FAKE_PAYMENTS=false`. | Engineering |  |  |
| `DEV_PLAYGROUND_ENABLED=false`. | Engineering |  |  |
| `DEV_REQUEST_LOGGING=false` (or covered by an approved exception). | Engineering / Security |  |  |
| `DEV_SQL_LOGGING=false`. | Engineering |  |  |
| `DATABASE_MIGRATE_ON_START=false` (migrations run explicitly). | Engineering |  |  |

### 4.6 Observability & Operations

| Control | Owner | Evidence reference | Status (PASS / exception / HOLD) |
|---------|-------|--------------------|-----------------------------------|
| `SENTRY_DSN` is configured or an equivalent error-tracking system is in place. | Engineering |  |  |
| Health check endpoint is live and monitored. | DevOps / Engineering |  |  |
| Metrics endpoint is scraped or an equivalent APM is active. | DevOps / SRE |  |  |
| Log aggregation is in place. | DevOps |  |  |
| Backup / point-in-time recovery is verified for the production database, including a restore validation. | DevOps / Engineering |  |  |
| On-call / incident-response path is defined and tested. | Engineering / Product |  |  |

### 4.7 Validation & Release Checks

| Control | Owner | Evidence reference | Status (PASS / exception / HOLD) |
|---------|-------|--------------------|-----------------------------------|
| `./scripts/validate-env.sh .env.production` passes with zero errors. | Engineering |  |  |
| Application starts successfully and `validate_production_invariants` returns `Ok`. | Engineering |  |  |
| Smoke tests pass: login, token refresh, payment webhook, email send, health check. | Engineering |  |  |
| Required unit, integration, and end-to-end tests pass for the release candidate; agreed coverage threshold is met. | QA / Engineering |  |  |
| Deployment plan has no unexplained or unapproved pending changes and all targets are healthy. | DevOps |  |  |
| Production deployment artifact is pinned to the approved commit and environment; artifact integrity is verified. | Engineering / DevOps |  |  |
| Rollback/recovery procedure is documented and a successful, in-policy drill or equivalent is evidenced. | SRE / DevOps |  |  |

## 5. Final Decision Structure

Record exactly one outcome:

- **GO:** All applicable controls PASS. Evidence is attached or linked and attributable to the exact candidate. No open exceptions.
- **GO-with-exceptions:** All applicable controls are PASS or covered by valid, in-scope, unexpired exceptions that meet the dual-ownership and compensating-control requirements. Evidence is attached or linked and attributable to the exact candidate.
- **HOLD:** Any required control is unmet, evidence is missing, expired, insufficient, or non-attributable, or an exception fails any policy rule.

## 6. Sign-off

Authorization is recorded by the Release Owner, DevOps, and the designated Approver, with date/time. Security must also approve any security exception. Retain the completed record with the candidate evidence pack. A signature does not override a HOLD condition.

| Required role | Name | Decision / exception scope | Date/time (timezone) | Signature / approval reference |
|---------------|------|----------------------------|---------------------|--------------------------------|
| Release Owner |  |  |  |  |
| DevOps / Infrastructure |  |  |  |  |
| Designated Approver |  |  |  |  |
| Security approver (if security exception applies) |  |  |  |  |

**Candidate / build ID:**  
**Artifact hash:**  
**Production environment:**  
**Evidence pack location:**  
**Gate outcome (GO / GO-with-exceptions / HOLD):**  
**Decision date/time (timezone):**  

### Authorization Statement (use verbatim)

> “All required controls are PASS or have an approved, in-scope, unexpired exception with compensating control and dual named ownership. Evidence is attached or linked and attributable to this exact candidate. Authorization: GO / GO-with-exceptions / HOLD. Signed by: [Release Owner], [DevOps], [Approver]. Date/time: ________.”

A **HOLD** decision prohibits production promotion. Only **GO** or **GO-with-exceptions** authorizes promotion, and only for the documented candidate, environment, and exception scope.

## Appendix A — Minimum-Evidence Appendix (Enforced)

The minimum evidence examples below define the acceptance standard. Evidence must satisfy the binding rules in Section 2; equivalent tools are acceptable only if they provide the same directly verifiable information. If an applicable organization policy sets rotation cadence, coverage threshold, or drill recency, use that policy and identify it in the evidence. Do not invent a threshold during release review.

| Control area | Minimum acceptable evidence | Owner | Block condition |
|---------------|-----------------------------|-------|-----------------|
| Build / artifact integrity | Deployment manifest or release record with SHA-256 digest matching the exact candidate artifact, plus signature-verification output (for example, `cosign verify` or equivalent) for that artifact. Include commit/build ID. | DevOps | Hash mismatch, missing required signature, unverifiable artifact, or evidence for another candidate. |
| Secret / credential hygiene | Redacted secret-manager/vault record showing secret version/identifier, last-rotation date, and access scoped to the release identity; include repository and CI secret-scan results for the candidate. Never include secret values or fragments. | Security / DevOps | Any plaintext secret; access not appropriately scoped; missing evidence; or rotation outside the established policy window. |
| Test coverage & results | Named, retained test report(s) with pass/fail summary and link to the exact build ID (for example, `unit-report-<date>.xml` and `e2e-report-<date>.html`); include coverage result and the applicable threshold. | QA / Engineering | Critical-path failure, missing report, build mismatch, or coverage shortfall without a valid exception. |
| Deployment readiness | Captured output from the required deployment command/tool (for example, `kubectl rollout status`, `helm diff`, or equivalent) showing the candidate, zero unexplained pending changes, healthy targets, and command exit status. | DevOps | Non-zero exit, pending changes, degraded targets, or candidate mismatch. |
| Rollback / recovery | Versioned incident/rollback runbook link plus evidence of the last successful drill, restore test, or canary-abort test for this service class, with date, result, and service/candidate reference. | SRE / DevOps | Missing runbook, failed drill, or drill outside the established policy interval. |
| Observability | Dashboard link plus alert-rule export/config for the candidate’s critical path, showing thresholds and paging/escalation path; include successful alert-test evidence. | SRE | Missing or untested critical-path alert, or absent paging path. |
| Exception handling | Signed exception record identifying the exact control, candidate, environment/scope, residual risk, compensating control and its evidence, named Release Owner, separate named Approver, approval timestamp, expiry timestamp, and closure plan. | Release Owner + Approver | Open exception past expiry, out of scope, missing either owner/approver, missing compensating control/evidence, or incomplete record. |
| Configuration & security controls | Redacted effective-configuration export or runtime validation output for the exact candidate, plus relevant TLS/CORS/cookie/security test results. No credentials or secret values. | Engineering / Security | Required setting is unverified or fails, evidence is not candidate-specific, or sensitive material is exposed. |
| Data services & external providers | Redacted production project/account identifiers and provider status/configuration evidence, plus successful non-destructive connectivity or integration checks. | Engineering | Wrong project/account, test mode where live is required, failed integration check, or exposed credential. |
| Backups & incident response | Database backup/PITR status and dated restore-validation result; versioned on-call/incident runbook and escalation test or confirmation. | DevOps / Engineering | Backup/restore cannot be demonstrated or responders/escalation path are not established. |

Evidence that cannot be reviewed in under one minute, is not attributable to the exact candidate, or is missing/expired results in **HOLD**.
