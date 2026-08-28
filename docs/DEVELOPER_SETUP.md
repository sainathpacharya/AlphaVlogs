# AlphaVlogs — Developer Setup Guide

This guide is the **single source of truth** for cloning, configuring, building, and running AlphaVlogs on a new machine. Follow it end-to-end before asking the original author for missing files.

**Branch for handoff:** `developer-handoff` (or latest `main` after merge)

---

## Quick start (≈15 minutes)

```bash
# 1. Clone
git clone https://github.com/sainathpacharya/AlphaVlogs.git
cd AlphaVlogs
git checkout developer-handoff   # or main

# 2. Node 20+ and Yarn
node -v    # must be >= 20
yarn install                   # runs bundle install + pod install via postinstall

# 3. Android: set SDK path (auto-created by Android Studio)
#    File: android/local.properties  (gitignored — see section below)

# 4. iOS: open Xcode once to accept licenses / select signing team
open ios/JackMarvelsApp.xcworkspace

# 5. Start Metro
yarn start

# 6. Run (separate terminals)
yarn android    # developDebug → com.nsnr.alphavlogs.dev
yarn ios        # JackMarvelsApp scheme
```

**Default behavior:** the app talks to **production API** `https://api.alphavlogs.com`. No local config file is required for that.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| **Node.js** | >= 20 | Required by `package.json` engines |
| **Yarn** | 1.x | Primary package manager (`yarn install`) |
| **Ruby** | >= 2.6.10 | For CocoaPods via `Gemfile` |
| **Bundler** | latest | `gem install bundler` if missing |
| **CocoaPods** | >= 1.13 | Installed via `bundle install` in postinstall |
| **JDK** | 17 | Android Gradle Plugin requirement |
| **Android Studio** | latest | SDK Platform **36**, Build-Tools **36**, NDK **27.1.12297006** |
| **Xcode** | 15+ | iOS deployment target **15.1** |
| **Watchman** | optional | Recommended on macOS for Metro |

### Android SDK (via Android Studio)

Install via **SDK Manager**:

- Android SDK Platform 36
- Android SDK Build-Tools 36.0.0
- NDK 27.1.12297006
- Android SDK Command-line Tools

Create `android/local.properties` (gitignored):

```properties
sdk.dir=/Users/YOUR_USER/Library/Android/sdk
```

Android Studio usually creates this automatically.

### iOS optional local override

If Xcode cannot find Node, create `ios/.xcode.env.local` (gitignored):

```bash
export NODE_BINARY=$(command -v node)
```

Committed default: `ios/.xcode.env`.

---

## Configuration matrix

Everything a new developer needs to know about config files.

| File | Committed? | Required to run? | Purpose |
|------|------------|------------------|---------|
| `src/config/api-config.ts` | Yes | Yes (built-in) | Production API URL, feature flags |
| `src/config/api-config.local.example.ts` | Yes | No | Template for LAN/local backend |
| `src/config/api-config.local.ts` | **No** (gitignored) | No | Optional local API overrides |
| `android/app/google-services.json` | Yes | Yes (Android) | Firebase Android config |
| `ios/JackMarvelsApp/GoogleService-Info.plist` | Yes | Yes (iOS prod) | Firebase iOS production |
| `ios/JackMarvelsApp/GoogleService-Info-Develop.plist` | Yes | CI dev builds | Firebase iOS dev bundle |
| `firebase.json` | Yes | Yes | RN Firebase plugin settings |
| `android/app/debug.keystore` | Yes | Yes (dev builds) | Standard debug signing |
| `android/app/keystore.properties.example` | Yes | No | Template for release signing |
| `android/app/keystore.properties` | **No** (gitignored) | No* | Release keystore credentials |
| `android/app/release.keystore` | **No** (gitignored) | No* | Production Android signing |
| `ios/JackMarvelsApp/JackMarvelsApp.entitlements` | Yes | Yes | iOS entitlements (currently empty) |
| `react-native.config.js` | Yes | Yes | Disables Razorpay on iOS |
| `android/local.properties` | **No** (gitignored) | Yes (Android) | Android SDK path |
| `ios/.xcode.env.local` | **No** (gitignored) | No | Optional Node path for Xcode |

\*Without release keystore, **developDebug** still works (uses debug keystore). Production release falls back to debug keystore locally.

### No root `.env` file

This app **does not read** a root `.env` or `process.env` for runtime config. Ignore outdated references to `API_URL` in older docs. Use `api-config.local.ts` instead.

---

## API configuration

### Production (default — no setup)

Out of the box, dev builds use:

- **Base URL:** `https://api.alphavlogs.com`
- **OTP endpoint:** `POST /api/students/send-otp`

Ensure DNS for `api.alphavlogs.com` resolves to the live server (`52.91.11.201`). If OTP fails with `Aborted` / HTTP 0 / 408, DNS may still point at a dead IP — contact the backend/infra team.

### Local / LAN backend (optional)

1. Copy the example file:

   ```bash
   cp src/config/api-config.local.example.ts src/config/api-config.local.ts
   ```

2. Edit `src/config/api-config.local.ts`:

   ```typescript
   export const API_CONFIG_LOCAL = {
     USE_PRODUCTION_API: false,
     DEV: {
       LAN_HOST: '192.168.x.x',  // your machine's LAN IP
       USE_LOCAL_BACKEND: false,
       PORT: 8080,
     },
   };
   ```

3. **Rebuild** the app (`yarn android` / `yarn ios`) — Metro reload is not enough.

### Mock mode (offline UI)

In `src/config/api-config.ts`, set `MODE: 'mock'` (dev only). Uses static JSON under `src/data/`.

---

## Firebase

Firebase configs are **committed** (standard for React Native). Project: **`alpha-vlogs-cf60a`**.

| Platform | Package / Bundle ID | Config file |
|----------|---------------------|-------------|
| Android dev | `com.nsnr.alphavlogs.dev` | `android/app/google-services.json` |
| Android prod | `com.nsnr.alphavlogs` | same file (multi-client) |
| iOS prod | `com.nsnr.alphavlogsindia` | `ios/JackMarvelsApp/GoogleService-Info.plist` |
| iOS dev | `com.nsnr.alphavlogs.dev` | `GoogleService-Info-Develop.plist` (CI) |

**Analytics & Crashlytics:** collection is gated by user consent (`analytics-consent-service.ts`). Auto-collection is disabled in `firebase.json`.

**If you change bundle IDs:** re-download configs from [Firebase Console](https://console.firebase.google.com/) — see `docs/FIREBASE_CONSOLE_UPDATE.md`.

**Android SHA-1 for Firebase Auth (if needed):** see `GET_SHA1_KEY.md`.

---

## Android build variants

| Flavor | Build type | Package | Signing | Use |
|--------|------------|---------|---------|-----|
| develop | debug | `com.nsnr.alphavlogs.dev` | debug | **Default `yarn android`** |
| develop | release | `com.nsnr.alphavlogs.dev` | debug | Firebase dev distribution |
| production | release | `com.nsnr.alphavlogs` | release* | Play Store |

Commands:

```bash
yarn android                              # developDebug
yarn build:android:develop-release        # developRelease APK
yarn build:android:production-release     # productionRelease APK (needs keystore for real signing)
```

### Release signing (production builds only)

Only needed for Play Store or signed production APKs:

```bash
# 1. Generate keystore (once)
keytool -genkeypair -v -storetype PKCS12 \
  -keystore android/app/release.keystore \
  -alias alpha-vlogs-release \
  -keyalg RSA -keysize 2048 -validity 10000

# 2. Copy and fill credentials
cp android/app/keystore.properties.example android/app/keystore.properties
```

**Never commit** `keystore.properties` or `release.keystore`. Obtain production keystore from the team lead or CI secrets owner.

---

## iOS setup

1. Open `ios/JackMarvelsApp.xcworkspace` (not `.xcodeproj`).
2. Select target **JackMarvelsApp** → **Signing & Capabilities**.
3. Set **Team** to your Apple Developer team (committed `DEVELOPMENT_TEAM` is `U746P25CM3` — replace with yours if needed).
4. Bundle ID (production): `com.nsnr.alphavlogsindia`.

```bash
yarn ios
# or Xcode → Run (⌘R) on a simulator
```

**Razorpay is disabled on iOS** (`react-native.config.js`). Subscriptions use **Apple IAP** (`react-native-iap`).

**IAP product ID:** `com.nsnr.alphavlogsindia.annual.premium` (must exist in App Store Connect for real purchases).

---

## Payments & third-party services

| Service | Platform | Client config | Server config |
|---------|----------|---------------|---------------|
| **Razorpay** | Android only | None — `key_id` from backend | Backend Razorpay secret |
| **Apple IAP** | iOS only | Product ID in `src/constants/index.ts` | Backend receipt verification |
| **YouTube** | Both | None — proxied via backend `/youtube/*` | Backend YouTube API key |
| **SSL pinning** | Release | `src/config/ssl-pinning.ts` (currently **disabled**) | TLS cert on API server |

No Stripe/Paytm SDK in the app (types/labels only).

---

## Scripts reference

| Command | Description |
|---------|-------------|
| `yarn install` | Dependencies + Bundler + CocoaPods |
| `yarn start` | Metro with client logs |
| `yarn android` | Run developDebug on device/emulator |
| `yarn ios` | Run on iOS simulator |
| `yarn type-check` | TypeScript |
| `yarn test:ci` | Jest (CI mode) |
| `yarn lint` | ESLint |
| `yarn build:android:develop-release` | Dev release APK |
| `yarn build:android:production-release` | Production release APK |
| `yarn logs:android` | Filtered adb logcat |

---

## Clean setup verification

Run these after a fresh clone to confirm nothing is missing:

```bash
# From repo root
yarn install
yarn type-check
yarn test:ci

# Android (requires SDK + emulator or device)
cd android && ./gradlew assembleDevelopDebug && cd ..

# iOS (macOS only, requires Xcode)
cd ios && xcodebuild -workspace JackMarvelsApp.xcworkspace \
  -scheme JackMarvelsApp -configuration Debug \
  -destination 'generic/platform=iOS Simulator' \
  -quiet build && cd ..
```

Expected: all commands exit 0. Android APK at  
`android/app/build/outputs/apk/develop/debug/app-develop-debug.apk`.

---

## Troubleshooting

### OTP / login: `Aborted`, HTTP 0, status 408

DNS for `api.alphavlogs.com` may point to a dead IP. Verify:

```bash
dig +short api.alphavlogs.com A
curl -X POST "https://api.alphavlogs.com/api/students/send-otp" \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210"}'
```

Or use a LAN backend via `api-config.local.ts`.

### Metro / cache issues

```bash
yarn start:reset
# or
yarn metro:reset
```

### Pod install failures

```bash
cd ios
bundle install
bundle exec pod install --repo-update
```

### Android Gradle / Node not found

```bash
export NODE_BINARY=$(command -v node)
cd android && ./gradlew assembleDevelopDebug -PnodeExecutable="$NODE_BINARY"
```

### iOS signing errors

Use your own Development Team in Xcode, or match team `U746P25CM3` if you have access.

---

## CI/CD & release secrets

Local development does **not** need these. Required only for GitHub Actions deploy pipelines:

| Secret | Used for |
|--------|----------|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase App Distribution |
| `ANDROID_KEYSTORE_BASE64` + passwords | Signed production APK/AAB |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Play Store upload |
| `IOS_DEV_*` / `APPLE_*` | iOS signing & TestFlight |

Full list: `docs/GITHUB_ACTIONS_SETUP.md`  
Publishing: `docs/PLAY_STORE_AND_APP_STORE_PUBLISHING.md`

---

## App identifiers summary

| | Development | Production |
|---|-------------|------------|
| **Android package** | `com.nsnr.alphavlogs.dev` | `com.nsnr.alphavlogs` |
| **iOS bundle** | `com.nsnr.alphavlogs.dev` (CI) | `com.nsnr.alphavlogsindia` |
| **Display name (dev flavor)** | Alpha Vlogs Dev | Alpha Vlogs |
| **API** | `https://api.alphavlogs.com` | same |

---

## What you should NOT need from the original author

If this guide is up to date, you should **not** need to ask for:

- Firebase `google-services.json` / `GoogleService-Info.plist` (in repo)
- Production API URL (hardcoded default)
- Debug keystore (in repo)
- Razorpay / payment client secrets (server-side only)
- Node/Yarn dependency versions (`yarn.lock` committed)

You **may** need from the team lead (release only):

- Production Android keystore + `keystore.properties` values
- Apple Developer / App Store Connect access for production iOS signing
- CI/CD secrets for automated deploys

---

## Related documentation

- [README.md](../README.md) — project overview
- [docs/GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) — CI secrets
- [docs/PLAY_STORE_AND_APP_STORE_PUBLISHING.md](./PLAY_STORE_AND_APP_STORE_PUBLISHING.md)
- [docs/FIREBASE_CONSOLE_UPDATE.md](./FIREBASE_CONSOLE_UPDATE.md)
- [docs/SSL_PINNING.md](./SSL_PINNING.md)
- [GET_SHA1_KEY.md](../GET_SHA1_KEY.md)
- [src/data/README.md](../src/data/README.md) — mock data mode
