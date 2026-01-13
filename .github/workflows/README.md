# CI/CD Workflows

This directory contains GitHub Actions workflows for automated testing, building, and deployment.

## Quick Start

1. **Push to repository** - Workflows run automatically on push/PR
2. **Check Actions tab** - View workflow runs and results
3. **Download artifacts** - Get built APKs/AABs from workflow runs

## Workflow Files

| File                  | Trigger     | Purpose                                       |
| --------------------- | ----------- | --------------------------------------------- |
| `ci.yml`              | PR/Push     | Lint, type-check, test                        |
| `android-build.yml`   | Main branch | Build Android APK/AAB                         |
| `ios-build.yml`       | Main branch | Build iOS archive                             |
| `android-publish.yml` | Manual/Tags | Build + Publish to Play Store (manual upload) |
| `ios-publish.yml`     | Manual/Tags | Build + Publish to App Store (manual upload)  |
| `full-pipeline.yml`   | Main branch | Complete CI + CD pipeline                     |

## Required Setup

### Minimal Setup (Works Out of the Box)

- ✅ No secrets required for basic CI/CD
- ✅ Works with public repositories
- ✅ Uses debug signing for Android

### Production Setup (Optional)

**Current Workflows:** Only BUILD apps, do NOT automatically publish to stores.

**To Enable Automatic Publishing:**

Add GitHub Secrets for:

- **Android Play Store:**
  - `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` - Service account JSON
  - `GOOGLE_PLAY_PACKAGE_NAME` - App package name
  - `GOOGLE_PLAY_TRACK` - Release track (internal/alpha/beta/production)

- **iOS App Store:**
  - `APPLE_ISSUER_ID` - App Store Connect API Issuer ID
  - `APPLE_KEY_ID` - App Store Connect API Key ID
  - `APPLE_PRIVATE_KEY` - App Store Connect API Private Key

Then uncomment the publishing steps in `android-publish.yml` or `ios-publish.yml`.

**⚠️ Security:** Only add store credentials if you understand the security implications.

- Codecov token (optional)

## 🎯 Which Store Account?

### Google Play Store

- Publishes to **YOUR** Google Play Console account
- The service account you create determines which account/app
- Package name: `com.jackmarvelsapp` (must match your app in Play Console)
- You control this by linking the service account to your specific app

### Apple App Store

- Publishes to **YOUR** App Store Connect account
- The API key you create determines which account
- Bundle ID: `com.jackmarvelsapp` (must match your app in App Store Connect)
- You control this by using your own App Store Connect API credentials

**You are in full control** - the workflows use YOUR credentials to publish to YOUR accounts.
