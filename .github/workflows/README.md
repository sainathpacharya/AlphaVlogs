# CI/CD Workflows

Platform-specific and environment-specific workflows for independent validation.

## Active workflows (use these)

| File | Trigger | Purpose |
| ---- | ------- | ------- |
| `ci.yml` | PR / push to `main`, `develop` | Lint, type-check, test (non-deploying) |
| `android-ios-firebase-distribution.yml` | manual only | **Android and iOS Firebase Distribution** |
| `android-ios-production.yml` | tag `v*.*.*`, manual | Signed AAB → Play **Internal Testing** + IPA → **TestFlight** (choose platform on manual) |

Full setup, secrets, validation, and rollback: **[docs/GITHUB_ACTIONS_SETUP.md](../../docs/GITHUB_ACTIONS_SETUP.md)**

## Identifiers

| | Dev | Production |
| --- | --- | --- |
| Android package | `com.nsnr.alphavlogs.dev` | `com.nsnr.alphavlogs` |
| iOS bundle ID | `com.nsnr.alphavlogs.dev` | `com.nsnr.alphavlogsindia` |

## Quick validation

1. Configure secrets per `docs/GITHUB_ACTIONS_SETUP.md`
2. Run **Android and iOS Firebase Distribution** → pick the branch in the **Run workflow** dropdown (builds that branch)
3. Tag `v1.0.0` (or run **Android and iOS Production** manually) when ready for store tracks
