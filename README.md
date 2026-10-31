# Quiet Pan — Environment Configuration (v1.1)

Private computation platform. Dual-secret JWT, hardened env validation, production readiness.

## Single Source of Truth (Locked)

| Concern  | Development           | Staging / Production           |
|----------|-----------------------|--------------------------------|
| Identity | Supabase Auth         | **Supabase Auth**              |
| Database | Local Postgres        | **Supabase Postgres (pooler)** |
| Storage  | Local or Supabase     | Supabase Storage / S3          |

Do **not** mix self-hosted Postgres and Supabase service-role in the same environment.

## Quick Start

```bash
cp .env.example .env.local
openssl rand -base64 64   # JWT_SECRET
docker compose up -d postgres redis
./scripts/validate-env.sh
cargo test
cargo run
```

## Dual-Secret JWT

```rust
use quietpan::{JwtService, TokenKind};

let jwt = JwtService::from_config(&cfg)?;
let token = jwt.issue(&user_id, TokenKind::Access, Some(session_id))?;
let claims = jwt.verify(&token)?;
```

- **Issue:** always `JWT_SECRET` (current)
- **Verify:** current, then `JWT_SECRET_PREVIOUS` if set

See `docs/SECRETS_ROTATION.md` for the dry-run checklist.

## Hardened Controls (v1.1)

- JWT_SECRET ≥86 chars base64 (~64 bytes entropy)
- Dual-secret rotation window
- Argon2 memory 64 MiB
- Production invariants in `validate-env.sh` + `validate_production_invariants`
- Crypto agility surface (`CRYPTO_*`)

## Docs

| Path | Purpose |
|------|--------|
| `.env.example` | Full template |
| `docs/SECRETS_ROTATION.md` | Rotation playbook + dry-run |
| `docs/PRODUCTION_READINESS.md` | Go-live checklist |
| `scripts/validate-env.sh` | Pre-flight validation |
| `src/auth/jwt.rs` | Dual-secret JwtService |

**No secrets in repo. Ever.**
