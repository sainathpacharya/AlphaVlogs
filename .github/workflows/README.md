# CI/CD Workflows

Platform-specific and environment-specific workflows for independent validation.

## Active workflows (use these)

| File | Trigger | Purpose |
| ---- | ------- | ------- |
| `ci.yml` | PR / push to `main`, `develop` | Lint, type-check, test (non-deploying) |
| `android-dev.yml` | push → `develop`, manual | Develop APK/AAB → Firebase App Distribution |
| `android-production.yml` | tag `v*.*.*`, manual | Signed AAB → Play **Internal Testing** |
| `ios-dev.yml` | push → `develop`, manual | Develop IPA → Firebase App Distribution |
| `ios-production.yml` | tag `v*.*.*`, manual | Signed IPA → **TestFlight** |

Full setup, secrets, validation, and rollback: **[docs/GITHUB_ACTIONS_SETUP.md](../../docs/GITHUB_ACTIONS_SETUP.md)**

## Identifiers

| | Dev | Production |
| --- | --- | --- |
| Android package | `com.nsnr.aplhavlogs.dev` | `com.nsnr.aplhavlogs` |
| iOS bundle ID | `com.nsnr.aplhavlogs.dev` | `com.nsnr.aplhavlogs` |

## Legacy workflows (deprecated)

Do not use for new releases:

- `build-develop.yml` — combined Android + iOS develop
- `build-production.yml` — combined Android + iOS production
- `android-publish.yml` — legacy Play publish
- `ios-publish.yml` — legacy TestFlight publish

These remain until the new workflows are validated in production, then can be removed.

## Quick validation

1. Configure secrets per `docs/GITHUB_ACTIONS_SETUP.md`
2. Run `android-dev.yml` on `develop` first (lowest risk)
3. Run `ios-dev.yml` on `develop`
4. Tag `v1.0.0` to exercise production workflows when ready
