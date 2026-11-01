# V-04 Operational Drill Runbook v1.2.2

**Disposition:** Frozen candidate. v1.2.2 is a consistency patch on v1.2.1. No change to the security model, retirement policy, or acceptance controls.  
**Date:** 2026-11-01  
**Status:** Procedure and acceptance criteria defined. Operational execution not demonstrated.

This runbook defines the non-production V-04 key rotation drill. Successful execution closes only the operational validation requirement for the rotation drill. It does not authorize production deployment or close other gates.

## Change Summary from v1.2.1

- Simulation / template packages are explicitly barred from producing a PASS verdict.
- Attestations must be cross-checked against the key-transition-record timelines; mismatch is a C6 failure.
- Attestation JSON must contain only the permitted fields; extra fields are a C1 or C6 failure.
- Supporting generator scripts are tooling only and do not constitute evidence.

## Change Summary from v1.2

- JWKS artifacts removed and prohibited.
- Key state recorded only as non-secret attestation.

## Change Summary from v1.1

- C4 validates both signing authority removal and verification rejection.
- Raw JWT artifacts removed.
- Overlap termination tied to deployment + verifier confirmation.
- `key-transition-record.md` mandatory.
- Confidentiality uses organization-approved secret detection.
- Rollback requires trust-state and validation-behavior restoration.
- Verdict computation formalized.

## 1. Drill Scope & Objectives

Execute a non-production V-04 key rotation drill to validate:

- Signing-key selection
- Verification-key eligibility
- Six acceptance controls (C1–C6)
- Retirement Policy Option A (Immediate Invalidation)
- Rollback capability
- Audit evidence generation

### Success Criteria

| Control | Description | Pass Condition |
|---------|-------------|----------------|
| C1 | Confidentiality | No secret material present in archived evidence |
| C2 | Key Identification | All operations attributable to stable key identifiers (`kid`) |
| C3 | Overlap Window | Legacy and replacement verification keys both validate during transition |
| C4 | Retirement Enforcement | Retired key cannot sign new tokens and legacy-signed tokens fail verification after retirement |
| C5 | Rollback Capability | Rollback restores prior trust state and validation behavior within five minutes |
| C6 | Audit Integrity | Evidence package complete, attributable, hash-linked and retained |

All controls must PASS. A simulation or template package cannot satisfy this requirement.

## 2. Security Model Validated

### Function A: Signing-Key Selection

| Phase | Expected Signing Key |
|-------|----------------------|
| Before Rotation | key-v1 |
| Transition | key-v2 |
| Post-Retirement | key-v2 |

### Function B: Verification-Key Eligibility

| Phase | Legacy Token (key-v1) | Replacement Token (key-v2) |
|-------|-----------------------|----------------------------|
| Before Rotation | Accept | N/A |
| Transition | Accept | Accept |
| Post-Retirement | Reject | Accept |

Authentication success alone is insufficient. Independently attributable test tokens must be used.

## 3. Retirement Policy — Option A (Immediate Invalidation)

Retirement occurs when:

- legacy key is removed from verification eligibility;
- deployment is completed;
- verifier behavior confirming removal is observed.

### Retirement Acceptance Tests

| Test | Expected |
|------|----------|
| Sign with retired key | Fail |
| Validate retired-key token | Fail |
| Validate replacement-key token | Pass |
| Issue replacement-key token | Pass |

All four outcomes are required.

## 4. Overlap Window Definition

- **Begins** when the replacement verification key becomes active.
- **Ends** when retirement deployment successfully removes legacy verification eligibility and validator behavior confirms the removal.
- Overlap-end timestamp shall be recorded.

## 5. Acceptance Controls

### C1 Confidentiality

Evidence packages shall not contain secret values, private keys, secret exports, credential fragments, JWKS documents, or JWK parameters.  
Validation: organization-approved secret-detection process executed against the complete evidence package prior to archival.  
Evidence: scanner report + reviewer sign-off.

A SHA-256 of a secret-bearing file is not a substitute for omitting the secret. Hashing an env file, a secret export, a JWKS, or a private-key file is a C1 failure.  
Extra fields in an attestation that could carry secret material are a C1 failure.

### C2 Key Identification

Every key reference uses `kid=<stable identifier>`. Issuance tests, validation tests, deployment actions, and audit records must be attributable to a specific key. Attestations record the `kid` and the env var name only.

### C3 Overlap Window

During the overlap period both key-v1 and key-v2 tokens must be accepted. `attestation-overlap.json` must show `JWT_SECRET` set for `key-v2` and `JWT_SECRET_PREVIOUS` set for `key-v1`.

### C4 Retirement Enforcement

| Test | Expected |
|------|----------|
| New signing using key-v1 | Fail |
| Validation of key-v1 token | Fail |
| Validation of key-v2 token | Pass |
| New signing using key-v2 | Pass |

`attestation-post.json` must show `JWT_SECRET` set for `key-v2` and `JWT_SECRET_PREVIOUS` unset.

### C5 Rollback Capability

Successful only if:

1. Original configuration restored.
2. Original trust state restored.
3. Validation behavior restored.
4. Evidence collected.
5. Duration ≤ 300 seconds.

Failure of any condition results in C5 failure.

`attestation-rollback.json` must show `JWT_SECRET` set for `key-v1` and `JWT_SECRET_PREVIOUS` unset.

### C6 Audit Integrity

Evidence package must be timestamped, attributable, hash-linked, archived read-only, and reproducible.  
Evidence: manifest, hash-chain output, archival record.

The four attestations must be consistent with the timelines and matrix in `key-transition-record.md`. Any mismatch is a C6 failure.  
A package labeled simulation, template, or not-executed cannot be assessed as PASS.

## 6. Required Evidence Package

```text
/evidence/v04-drill-<timestamp>/
├── drill-manifest.yaml
├── drill-start.txt
├── drill-end.txt
├── attestation-pre.json
├── attestation-overlap.json
├── attestation-post.json
├── attestation-rollback.json
├── deploy-timestamp.txt
├── overlap-start.txt
├── overlap-end.txt
├── rollback-timestamp.txt
├── rollback-duration.txt
├── key-transition-record.md
├── token-records.json
├── validation-results.json
├── signing-attempts/
│   ├── key-v1-sign-attempt.log
│   └── key-v2-sign-attempt.log
├── verification-logs/
│   ├── key-v1-verify.log
│   └── key-v2-verify.log
├── manifest.json
├── hash-chain.log
├── acceptance-checklist.csv
├── drill-lead-signoff.txt
├── compliance-signoff.txt
└── drill-report.md
```

JWKS files are not required and are not permitted.

## 6.1 Key Attestation (Mandatory)

Each attestation is one JSON object. It records presence, not secrets. No fields other than those listed are permitted.

```json
{
  "phase": "pre-rotation",
  "deploy_revision": "<deployment revision>",
  "checked_file": "<path of the non-secret file that was hashed>",
  "checked_file_sha256": "<64 lowercase hex digits>",
  "keys": [
    {"kid": "key-v1", "env_var": "JWT_SECRET", "set": true},
    {"env_var": "JWT_SECRET_PREVIOUS", "set": false}
  ]
}
```

| Field | Rule |
|-------|------|
| `phase` | `pre-rotation`, `overlap`, `post-retirement`, or `rollback`, matching the filename |
| `deploy_revision` | Non-empty revision of the deployment that was checked. Not a secret. |
| `checked_file` | Path of a non-secret deploy artifact. Must not be an env file, secret export, JWKS, or private-key file. |
| `checked_file_sha256` | SHA-256 of that file, 64 lowercase hex digits. Not a hash of key material. |
| `keys[].env_var` | `JWT_SECRET` or `JWT_SECRET_PREVIOUS` only. The name, never the value. |
| `keys[].set` | `true` if present, `false` if unset. |
| `keys[].kid` | Required when `set` is `true`. Forbidden when `set` is `false`. |

| File | `JWT_SECRET` | `JWT_SECRET_PREVIOUS` |
|------|--------------|------------------------|
| `attestation-pre.json` | set, `kid=key-v1` | unset |
| `attestation-overlap.json` | set, `kid=key-v2` | set, `kid=key-v1` |
| `attestation-post.json` | set, `kid=key-v2` | unset |
| `attestation-rollback.json` | set, `kid=key-v1` | unset |

A missing attestation, a secret-bearing checked file, a JWKS document, a key byte, or an extra field in any attestation is an evidence failure (C1 or C6).

## 7. Key Transition Record (Mandatory)

`key-transition-record.md` minimum contents:

- Legacy Key Identifier
- Replacement Key Identifier
- Signing Timeline (before / during / after)
- Verification Timeline (before / during / after)
- Transition Start Timestamp
- Retirement Timestamp
- Overlap Start Timestamp
- Overlap End Timestamp
- Validation Matrix
- Assessor Findings

### Validation Matrix

| Scenario | Expected | Actual |
|----------|----------|--------|
| Legacy token pre-rotation | PASS | |
| Legacy token during overlap | PASS | |
| Replacement token during overlap | PASS | |
| Legacy token post-retirement | FAIL | |
| Replacement token post-retirement | PASS | |

The Actual column must be populated from operational results. “SIMULATED” or blank is not a PASS.

## 8. Verdict Determination

### PASS

All of C1–C6 are PASS, and the package is from an operational non-production drill (not a simulation or template).

### FAIL

Any acceptance control FAILS.

### INCONCLUSIVE

Drill not completed, evidence incomplete, validation missing, timestamps missing, audit artifacts missing, package is a simulation/template, or assessment cannot determine PASS or FAIL.

## 9. Go/No-Go Decision Matrix

| Condition | Action |
|-----------|--------|
| All controls PASS | Proceed to production rotation planning |
| Any control FAIL | Immediate rollback and investigation |
| Rollback exceeds five minutes | Escalate |
| Evidence incomplete | HOLD |
| Verdict INCONCLUSIVE | HOLD |

## 10. Authorization Effect

Successful completion of V-04:

- closes the operational validation requirement for the rotation drill only;
- provides operational evidence for rotation capability.

It does **not**:

- authorize production deployment;
- override unresolved gates;
- close V-01, V-02, V-03, or V-05;
- establish production authorization independently.

## Frozen Status

| Item | Status |
|------|--------|
| Procedure | Defined |
| Acceptance Criteria | Defined |
| Security Clarifications | Incorporated |
| Evidence Package | Defined |
| Verdict Logic | Defined |
| Freeze Readiness | Ready |

**Current V-04 Status:** INCONCLUSIVE (no operational execution demonstrated).  
**Production Authorization Dependency:** OPEN.  
**Production Authorization:** NOT ESTABLISHED.
