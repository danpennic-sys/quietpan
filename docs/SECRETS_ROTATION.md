# Quiet Pan — Secrets Rotation Playbook

**Version:** 1.0  
**Date:** 2026-11-01  
**Status:** Draft — requires owner review before use  
**Applies to:** Dual-secret JWT (`JWT_SECRET` / `JWT_SECRET_PREVIOUS`)

This playbook describes the rotation procedure supported by the existing `JwtService` implementation. It does not authorize production use. Execution requires a non-production environment, recorded evidence, and explicit sign-off.

## Contract (from code)

- **Issue:** always uses `JWT_SECRET` (current).
- **Verify:** tries `JWT_SECRET`, then `JWT_SECRET_PREVIOUS` if set and non-empty.
- `JWT_SECRET_PREVIOUS` must differ from `JWT_SECRET`.
- Rotation window is active while `JWT_SECRET_PREVIOUS` is present.
- Algorithm path is HS256 only for the dual-secret implementation.

See `src/auth/jwt.rs`.

## Preconditions

- [ ] Non-production environment (staging or isolated test).
- [ ] Current `JWT_SECRET` meets length requirement (≥86 characters).
- [ ] `docs/PRODUCTION_READINESS.md` checklist reviewed.
- [ ] Backup of current configuration taken.
- [ ] Evidence capture method ready (logs, screenshots, or command output archive).

## Rotation Procedure

### Step 1 — Generate replacement secret

```bash
openssl rand -base64 64
```

Record the new value securely. Do not commit it.

### Step 2 — Introduce replacement (start rotation window)

1. Set `JWT_SECRET_PREVIOUS` = current `JWT_SECRET`.
2. Set `JWT_SECRET` = new value.
3. Restart or reload the service so `JwtService::from_config` picks up both.
4. Confirm `is_rotation_window_active()` would return true (previous is set and differs).

**Expected:** New tokens are issued under the new secret. Tokens issued under the old secret still verify.

### Step 3 — Verify legacy acceptance

- Present a token that was issued before the change.
- Confirm verification succeeds (falls through to previous secret).
- Record the verification result and timestamp.

### Step 4 — Verify new issuance

- Issue a fresh access token.
- Confirm it verifies successfully against the current secret.
- Confirm it would fail if only the previous secret were present (optional negative check).

### Step 5 — Retirement

1. After the agreed overlap window (all outstanding tokens expired or re-issued):
   - Unset `JWT_SECRET_PREVIOUS` (or set to empty).
2. Restart or reload.
3. Confirm tokens issued under the old secret now fail verification.
4. Confirm tokens issued under the new secret continue to verify.

**Expected:** Rotation window closed. Only the current secret is accepted.

### Step 6 — Post-cutover confirmation

- [ ] New tokens issue and verify.
- [ ] Old tokens reject.
- [ ] No `JWT_SECRET_PREVIOUS` remains in the running configuration.
- [ ] Service health checks pass.
- [ ] Evidence package archived with Run ID and Commit SHA.

## Dry-run Checklist

- [ ] Replacement secret generated offline.
- [ ] Previous secret set equal to old current.
- [ ] New secret installed as current.
- [ ] Legacy token accepted during window.
- [ ] New token issued and accepted.
- [ ] Previous secret removed.
- [ ] Legacy token rejected after retirement.
- [ ] Evidence collected (commands, logs, timestamps, commit SHA).

## Evidence Requirements (for V-04)

| Field              | Required |
|--------------------|----------|
| Verification ID    | Yes      |
| Run ID             | Yes      |
| Commit SHA         | Yes      |
| Evidence Package   | Yes      |
| Reviewer           | Yes      |
| Date               | Yes      |
| Result             | Pass / Fail / Inconclusive |

## Rollback

If verification fails during the window:

1. Restore `JWT_SECRET` to the prior value.
2. Clear `JWT_SECRET_PREVIOUS`.
3. Restart.
4. Confirm pre-rotation behavior.
5. Record the failure and do not proceed to retirement.

## Notes

- This playbook covers only the dual-secret JWT path implemented in code.
- Argon2 parameter changes, Supabase key rotation, and database credential rotation are out of scope for this document.
- Production execution is prohibited until V-04 evidence is reviewed and the production gate is explicitly authorized.
- No secrets belong in the repository.

## Approval

| Role             | Name | Date | Signature |
|------------------|------|------|-----------|
| Engineering Lead |      |      |           |
| Security         |      |      |           |
| Owner            |      |      |           |

Until signed, this remains a draft playbook. Execution does not by itself close V-04.
