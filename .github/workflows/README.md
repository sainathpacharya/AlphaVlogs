# CI/CD Workflows

Platform-specific and environment-specific workflows for independent validation.

## Active workflows (use these)

| File | Trigger | Purpose |
| ---- | ------- | ------- |
| `ci.yml` | PR / push to `main`, `develop` | Lint, type-check, test (non-deploying) |
| `dev-firebase-distribution.yml` | push → `develop`, manual | **Dev Firebase Distribution** — Android + iOS → Firebase |
| `android-production.yml` | tag `v*.*.*`, manual | Signed AAB → Play **Internal Testing** |
| `ios-production.yml` | tag `v*.*.*`, manual | Signed IPA → **TestFlight** |

Full setup, secrets, validation, and rollback: **[docs/GITHUB_ACTIONS_SETUP.md](../../docs/GITHUB_ACTIONS_SETUP.md)**

## Identifiers

| | Dev | Production |
| --- | --- | --- |
| Android package | `com.nsnr.aplhavlogs.dev` | `com.nsnr.aplhavlogs` |
| iOS bundle ID | `com.nsnr.aplhavlogs.dev` | `com.nsnr.aplhavlogs` |

## Quick validation

1. Configure secrets per `docs/GITHUB_ACTIONS_SETUP.md`
2. Run `dev-firebase-distribution.yml` on `develop` (builds Android and iOS in parallel)
3. Tag `v1.0.0` to exercise production workflows when ready
