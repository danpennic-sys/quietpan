# Quiet Pan — Secrets Rotation Playbook

**Version:** 1.1  
**Date:** 2026-11-01  
**Status:** Draft — requires owner review before freeze  
**Applies to:** Dual-secret JWT (`JWT_SECRET` / `JWT_SECRET_PREVIOUS`)

This playbook describes the rotation procedure supported by the existing `JwtService` implementation. It incorporates the V-04 security clarification distinguishing signing-key selection from verification-key eligibility. It does not authorize production use.

## Contract (from code)

- **Issue (signing-key selection):** always uses `JWT_SECRET` (current / replacement once installed).
- **Verify (verification-key eligibility):** tries `JWT_SECRET`, then `JWT_SECRET_PREVIOUS` if set and non-empty.
- `JWT_SECRET_PREVIOUS` must differ from `JWT_SECRET`.
- Rotation window is active while `JWT_SECRET_PREVIOUS` is present.
- Algorithm path is HS256 only for the dual-secret implementation.
- Retirement model: **Option A — Immediate Invalidation**. Clearing `JWT_SECRET_PREVIOUS` removes legacy verification eligibility immediately. Legacy-signed tokens fail validation after retirement.

See `src/auth/jwt.rs`.

## V-04 Security Clarification

The drill must independently verify both functions:

### A. Signing-Key Selection

Which key is used for newly issued tokens.

| Phase | New tokens signed by |
|-------|----------------------|
| Pre-transition | Legacy key |
| Transition window | Replacement key |
| Post-retirement | Replacement key |

### B. Verification-Key Eligibility

Which keys are authorized for token validation.

| Phase | Legacy-key token | Replacement-key token |
|-------|------------------|-----------------------|
| Pre-transition | Accept | Not applicable |
| Transition window | Accept | Accept |
| Post-retirement | Reject | Accept |

Authentication success alone is insufficient. Test tokens must have known, recorded signing-key provenance.

## Acceptance Controls (mandatory)

| Control | Requirement |
|---------|-------------|
| Secret Confidentiality | Evidence packages shall not contain secret material. |
| Key Identification | Every test token shall be attributable to a signing-key version or identifier. |
| Overlap Window | Both authorized verification keys shall validate during the transition period. |
| Retirement Enforcement | Legacy verification eligibility shall be removed (Option A). |
| Rollback Procedure | Documented and authorized recovery path shall exist and be testable. |
| Audit Integrity | Evidence shall be timestamped, attributable, and retained. |

## Retirement Policy

**Selected model: Option A — Immediate Invalidation**

At retirement:
- Legacy key removed from verification set (`JWT_SECRET_PREVIOUS` unset).
- Legacy-signed tokens immediately fail validation.

Acceptance test: Post-retirement legacy-token validation = Reject.

Option B (grace-period expiration) is not used by the current implementation. The playbook, code, and assessment criteria use Option A exclusively. No mixed interpretation is permitted.

## Preconditions

- [ ] Non-production environment (staging or isolated test).
- [ ] Current `JWT_SECRET` meets length requirement (≥86 characters).
- [ ] `docs/PRODUCTION_READINESS.md` checklist reviewed.
- [ ] Backup of current configuration taken.
- [ ] Evidence capture method ready.
- [ ] Key identifiers assigned (legacy and replacement) without recording secret values.

## Rotation Procedure

### Step 1 — Generate replacement secret

```bash
openssl rand -base64 64
```

Record the new value securely outside the evidence package. Assign a key identifier (e.g., `key-v2`). Do not commit the secret.

### Step 2 — Introduce replacement (start rotation window)

1. Set `JWT_SECRET_PREVIOUS` = current `JWT_SECRET` (legacy identifier recorded).
2. Set `JWT_SECRET` = new value (replacement identifier recorded).
3. Restart or reload so `JwtService::from_config` picks up both.
4. Confirm rotation window active.

**Signing-key selection:** New tokens are signed by the replacement key.  
**Verification-key eligibility:** Both legacy and replacement tokens must verify.

### Step 3 — Verify legacy acceptance (verification eligibility)

- Present a token known to have been signed by the legacy key.
- Confirm verification succeeds.
- Record token identifier, signing-key identifier, timestamp, and result.

### Step 4 — Verify new issuance (signing-key selection)

- Issue a fresh token.
- Confirm it is signed by the replacement key (known provenance).
- Confirm verification succeeds against the current secret.
- Record token identifier, signing-key identifier, timestamp, and result.

### Step 5 — Retirement (Option A)

1. After the agreed overlap window:
   - Unset `JWT_SECRET_PREVIOUS`.
2. Restart or reload.
3. Confirm legacy-signed token now fails verification.
4. Confirm replacement-signed token continues to verify.

**Expected:** Legacy verification eligibility removed immediately. Only the replacement key remains authorized.

### Step 6 — Post-cutover confirmation

- [ ] New tokens signed by replacement key and verify.
- [ ] Legacy-signed tokens reject.
- [ ] No `JWT_SECRET_PREVIOUS` remains in running configuration.
- [ ] Service health checks pass.
- [ ] Evidence package complete (see structure below).

## Evidence Package Structure

```text
evidence/
├── verification-id.txt
├── run-id.txt
├── commit-sha.txt
├── environment.txt
├── rotation-plan.md
├── deployment-logs/
├── auth-logs/
├── validation-results/
├── configuration-diff/
├── key-transition-record.md
├── rollback-record.md
└── assessor-summary.md
```

### key-transition-record.md minimum contents

- Legacy key identifier
- Replacement key identifier
- Active signing-key timeline
- Active verification-key timeline
- Transition start timestamp
- Retirement timestamp
- Token test matrix (with known provenance)
- Actual observed results
- Assessor conclusions

### Configuration evidence shall record

- Key identifiers / version IDs
- Configuration revision identifiers
- Deployment timestamps
- Approval references
- Environment identifier
- Commit SHA
- Run ID

### Configuration evidence shall not contain

- Secret values
- Secret fragments
- Secret exports
- Raw key material

## Dry-run Checklist

- [ ] Replacement secret generated offline; identifier assigned.
- [ ] Previous secret set; legacy identifier recorded.
- [ ] New secret installed as current; replacement identifier recorded.
- [ ] Legacy-key token accepted during window (verification eligibility).
- [ ] Replacement-key token issued and accepted (signing-key selection).
- [ ] Previous secret removed (Option A retirement).
- [ ] Legacy-key token rejected after retirement.
- [ ] Evidence package assembled; no secret material included.
- [ ] Rollback path tested or confirmed available.

## Rollback

If verification fails during the window:

1. Restore `JWT_SECRET` to the prior value.
2. Clear `JWT_SECRET_PREVIOUS`.
3. Restart.
4. Confirm pre-rotation signing and verification behavior.
5. Record the failure in `rollback-record.md` and do not proceed to retirement.

## Notes

- This playbook covers only the dual-secret JWT path implemented in code.
- Argon2 parameter changes, Supabase key rotation, and database credential rotation are out of scope.
- Production execution is prohibited until V-04 evidence is reviewed and the production gate is explicitly authorized.
- Local simulation evidence is supporting implementation evidence only; it does not close V-04.
- No secrets belong in the repository or in the evidence package.

## Approval

| Role             | Name | Date | Signature |
|------------------|------|------|-----------|
| Engineering Lead |      |      |           |
| Security         |      |      |           |
| Owner            |      |      |           |

Until signed and an operational drill with a complete evidence package is reviewed, V-04 remains Inconclusive and production authorization remains blocked.
