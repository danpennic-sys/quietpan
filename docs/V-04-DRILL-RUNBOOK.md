# V-04 Operational Drill Runbook v1.2.3

**Disposition:** Frozen candidate. v1.2.3 adds Section 6A (Supporting Operational Tooling). No change to acceptance controls, retirement policy, or verdict rules.  
**Date:** 2026-11-01  
**Status:** Procedure and acceptance criteria defined. Operational execution not demonstrated.

This runbook defines the non-production V-04 key rotation drill. Successful execution closes only the operational validation requirement for the rotation drill. It does not authorize production deployment or close other gates.

## Change Summary from v1.2.2

- Section 6A added: approved supporting tools, usage constraints, and evidence classification.
- Tools are explicitly barred from satisfying any acceptance control by themselves.

## Prior Change Summaries

See v1.2.2 for simulation/template bar, attestation cross-check, and extra-field rules.  
See v1.2.1 for JWKS removal.  
See v1.2 for C4 dual check, raw-JWT removal, overlap definition, and formal verdict.

## 1–5. (Unchanged from v1.2.2)

Drill scope, security model (signing-key selection vs verification-key eligibility), Retirement Policy Option A, overlap window definition, and acceptance controls C1–C6 remain exactly as specified in v1.2.2.

## 6. Required Evidence Package

(Unchanged structure from v1.2.2. JWKS prohibited. Four phase attestations required.)

## 6.1 Key Attestation (Mandatory)

(Unchanged schema and phase matrix from v1.2.2.)

## 6A. Supporting Operational Tooling

The following utilities are approved operator-assistance tools. They improve repeatability and reduce manual assembly. Use of these utilities does **not** constitute successful execution of the drill and does **not** satisfy any acceptance control by itself.

### 6A.1 Approved Supporting Tools

| Script | Purpose | Output |
|--------|---------|--------|
| `v04-preflight.sh` | Verify prerequisites before drill execution | Pre-flight status report |
| `v04-collect-evidence.sh` | Create evidence package skeleton and collect attestations | Initialized evidence package structure |
| `v04-token-metadata.sh` | Record token provenance without storing bearer tokens | `token-records.json` |
| `v04-rollback-timer.sh` | Measure rollback duration | `rollback-duration.txt` |

### 6A.2 Tool Usage Constraints

These tools MAY automate evidence collection, metadata generation, timing measurements, and audit-artifact standardization. They MAY reduce operator error.

These tools SHALL NOT be treated as evidence that:

- rotation occurred;
- deployment succeeded;
- overlap validation occurred;
- retirement enforcement was verified;
- rollback restored trust state;
- any acceptance control passed;
- V-04 completed successfully.

Acceptance controls C1–C6 remain independently assessed.

### 6A.3 Pre-Flight Validation Tool

Script: `v04-preflight.sh`  
Purpose: Validate minimum drill prerequisites before execution.  
Minimum checks: required CLI tools, writable evidence directory, operator permissions, required environment markers.  
Outcome: PASS (prerequisites met) or FAIL (missing prerequisite).  
A successful pre-flight authorizes drill execution to begin but does not contribute toward a V-04 PASS determination.

### 6A.4 Evidence Collection Tool

Script: `v04-collect-evidence.sh`  
Purpose: Create the evidence package skeleton and collect administrative attestation data.  

Example:
```bash
CHECKED_FILE=/path/to/non-secret-revision.txt \
DEPLOY_REV=rev-123 \
bash v04-collect-evidence.sh \
  ./evidence/v04-drill-$(date -u +%Y%m%dT%H%M%SZ)
```

The script shall not rotate secrets, modify trust relationships, perform validation tests, or assign PASS/FAIL status.

### 6A.5 Token Provenance Tool

Script: `v04-token-metadata.sh`  
Purpose: Document token provenance while preventing retention of bearer tokens.  
Output: `token-records.json` (metadata and validation outcomes only).  
Raw JWTs shall not be retained. This supports C1, C2, and C4 but does not satisfy them independently.

### 6A.6 Rollback Timing Tool

Script: `v04-rollback-timer.sh`  
Purpose: Record rollback duration for C5 evaluation.  

Example:
```bash
bash v04-rollback-timer.sh start
# perform rollback
bash v04-rollback-timer.sh stop ./evidence/.../rollback-duration.txt
```

A duration ≤ 300 seconds is necessary but not sufficient. C5 passes only if configuration, trust state, and validation behavior are also restored and evidence is collected. The timer measures only duration.

### 6A.7 Recommended Operator Workflow

```bash
bash v04-preflight.sh
CHECKED_FILE=/path/to/non-secret-revision.txt DEPLOY_REV=rev-123 \
  bash v04-collect-evidence.sh ./evidence/v04-drill-$(date -u +%Y%m%dT%H%M%SZ)
# Execute operational drill (rotation, overlap, retirement, logs)
bash v04-token-metadata.sh ./evidence/.../token-records.json
bash v04-rollback-timer.sh start
# perform rollback
bash v04-rollback-timer.sh stop ./evidence/.../rollback-duration.txt
# Secret scan, acceptance checklist, sign-offs, final verdict
```

### 6A.8 Evidence Classification

Artifacts produced solely by these utilities shall be classified as **Supporting Operational Evidence**, not **Control Validation Evidence**, unless paired with independently verified operational results produced during drill execution.

## 7–10. (Unchanged from v1.2.2)

Key-transition-record requirements, verdict determination (PASS / FAIL / INCONCLUSIVE), go/no-go matrix, and authorization effect remain exactly as specified in v1.2.2.

## Frozen Status

| Item | Status |
|------|--------|
| Procedure | Defined |
| Acceptance Criteria | Defined |
| Supporting Tooling | Classified (Section 6A) |
| Evidence Package | Defined |
| Verdict Logic | Defined |
| Freeze Readiness | Ready |

**Current V-04 Status:** INCONCLUSIVE (no operational execution demonstrated).  
**Production Authorization Dependency:** OPEN.  
**Production Authorization:** NOT ESTABLISHED.
