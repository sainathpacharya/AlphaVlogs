# GitHub Actions — Platform & Environment Workflows

Alpha Vlogs uses **three deploy workflows** plus CI. Dev Android and iOS share one workflow that runs both platforms in parallel after a single validate job.

| Workflow | File | Trigger | Deploy target |
| -------- | ---- | ------- | ------------- |
| Dev (Android + iOS) | `android-ios-firebase-distribution.yml` | `push` → `main` or `develop`, manual | Firebase App Distribution (both platforms) |
| Android Production | `android-production.yml` | tag `v*.*.*`, manual | Play Console **Internal Testing** |
| iOS Production | `ios-production.yml` | tag `v*.*.*`, manual | **TestFlight only** |

**Identifiers**

| Platform | Dev | Production |
| -------- | --- | ---------- |
| Android package | `com.nsnr.aplhavlogs.dev` | `com.nsnr.aplhavlogs` |
| iOS bundle ID | `com.nsnr.aplhavlogs.dev` | `com.nsnr.aplhavlogs` |

---

## 1. GitHub Environments (recommended)

Create four environments under **Settings → Environments**:

| Environment | Used by | Protection rules (recommended) |
| ----------- | ------- | ------------------------------ |
| `android-development` | `android-ios-firebase-distribution.yml` (Android job) | Optional: require reviewer for manual dispatch |
| `android-production` | `android-production.yml` | Required reviewers; restrict to `main` / tags |
| `ios-development` | `android-ios-firebase-distribution.yml` (iOS job) | Optional reviewer |
| `ios-production` | `ios-production.yml` | Required reviewers; restrict to tags |

Store environment-specific secrets in each environment when possible (e.g. production keystore only in `android-production`).

Repository-level secrets are also supported if you prefer a single secret store.

---

## 2. Secrets reference

### Shared (Firebase — dev workflows)

| Secret | Workflows | Description |
| ------ | --------- | ----------- |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | `android-ios-firebase-distribution` | Full JSON for a Firebase/Google service account with **Firebase App Distribution Admin** |

### Android Dev — `android-ios-firebase-distribution.yml` (Android job)

| Secret | Required | Notes |
| ------ | -------- | ----- |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Yes | Pipeline fails if missing |

Firebase App ID is read automatically from `android/app/google-services.json` for package `com.nsnr.aplhavlogs.dev`.

### Android Production — `android-production.yml`

| Secret | Required | Notes |
| ------ | -------- | ----- |
| `ANDROID_KEYSTORE_BASE64` | Yes | Base64-encoded release `.keystore` or `.jks` |
| `ANDROID_KEY_ALIAS` | Yes | e.g. `alpha-vlogs-release` |
| `ANDROID_STORE_PASSWORD` | Yes | Keystore password |
| `ANDROID_KEY_PASSWORD` | Yes | Key password |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Yes | Play Console API service account JSON |

**Generate keystore secret (one-time, local):**

```bash
# Create keystore (if you don't have one)
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore release.keystore \
  -alias alpha-vlogs-release \
  -keyalg RSA -keysize 2048 -validity 10000

# Encode for GitHub Secret
base64 -i release.keystore | pbcopy   # macOS — paste into ANDROID_KEYSTORE_BASE64
```

**Play Console service account:**

1. [Google Play Console](https://play.google.com/console) → **Setup → API access**
2. Link a Google Cloud project → create service account
3. Grant **Release to testing tracks** (Internal testing is sufficient)
4. Download JSON → paste entire contents into `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`
5. Ensure the app listing uses package **`com.nsnr.aplhavlogs`**

### iOS Dev — `android-ios-firebase-distribution.yml` (iOS job)

| Secret | Required | Notes |
| ------ | -------- | ----- |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Yes | Same as Android dev |
| `IOS_DEV_CERTIFICATE_BASE64` | Yes* | Apple **Development** certificate (`.p12`), base64 |
| `IOS_DEV_CERTIFICATE_PASSWORD` | Yes* | `.p12` export password |
| `IOS_DEV_PROVISIONING_PROFILE_BASE64` | Yes* | Development profile for `com.nsnr.aplhavlogs.dev`, base64 |
| `IOS_DEV_TEAM_ID` | Yes* | 10-character Apple Team ID |
| `KEYCHAIN_PASSWORD` | No | Defaults to `github-actions` |

\*Required to export an installable IPA for Firebase. These are **development** credentials — not production/App Store distribution certs.

Firebase App ID is read from `ios/JackMarvelsApp/GoogleService-Info-Develop.plist`.

**Encode iOS dev assets:**

```bash
base64 -i dev_certificate.p12 | pbcopy          # IOS_DEV_CERTIFICATE_BASE64
base64 -i AlphaVlogs_Dev.mobileprovision | pbcopy  # IOS_DEV_PROVISIONING_PROFILE_BASE64
```

### iOS Production — `ios-production.yml`

| Secret | Required | Notes |
| ------ | -------- | ----- |
| `APPLE_CERTIFICATE_BASE64` | Yes | **Apple Distribution** certificate (`.p12`), base64 |
| `APPLE_CERTIFICATE_PASSWORD` | Yes | `.p12` password |
| `APPLE_PROVISIONING_PROFILE_BASE64` | Yes | **App Store** profile for `com.nsnr.aplhavlogs` |
| `APPLE_TEAM_ID` | Yes | Apple Team ID |
| `APPLE_KEY_ID` | Yes | App Store Connect API key ID |
| `APPLE_ISSUER_ID` | Yes | App Store Connect issuer UUID |
| `APPLE_PRIVATE_KEY` | Yes | `.p8` private key contents |
| `APPLE_CODE_SIGN_IDENTITY` | No | Default: `Apple Distribution` |
| `APPLE_PROVISIONING_PROFILE_SPECIFIER` | No | Profile name; UUID auto-detected if omitted |
| `KEYCHAIN_PASSWORD` | No | Defaults to `github-actions` |

**App Store Connect API key:**

1. [App Store Connect](https://appstoreconnect.apple.com) → **Users and Access → Integrations → App Store Connect API**
2. Create key with **Developer** or **App Manager** role
3. Save Key ID, Issuer ID, and download `.p8` once
4. Paste `.p8` contents into `APPLE_PRIVATE_KEY`

Upload goes to **TestFlight only** — not a public App Store release.

---

## 3. Firebase setup (dev workflows)

Project: **`alpha-vlogs-cf60a`**

### Android

1. Firebase Console → Project settings → Your apps
2. Confirm Android app **`com.nsnr.aplhavlogs.dev`** exists
3. `android/app/google-services.json` must contain that package (already configured)
4. App Distribution → select dev app → **Testers & Groups** → create group **`testers`**

### iOS

1. Confirm iOS app **`com.nsnr.aplhavlogs.dev`** exists in Firebase
2. `ios/JackMarvelsApp/GoogleService-Info-Develop.plist` must match bundle ID
3. If production and develop plists share the same `GOOGLE_APP_ID`, re-download the develop plist from Firebase (see `docs/FIREBASE_CONSOLE_UPDATE.md`)
4. Create **`testers`** group for the iOS dev app in App Distribution

### Service account permissions

The service account needs:

- **Firebase App Distribution Admin** (or Editor on project `alpha-vlogs-cf60a`)

---

## 4. Manual setup checklist

### Before first Android Dev run

- [ ] `develop` branch exists
- [ ] `FIREBASE_SERVICE_ACCOUNT_JSON` secret configured
- [ ] Firebase **`testers`** group exists for `com.nsnr.aplhavlogs.dev`
- [ ] QA tester emails added to group

### Before first Android Production run

- [ ] Play Console app created with package **`com.nsnr.aplhavlogs`**
- [ ] All five Android production secrets configured
- [ ] Internal testing track enabled in Play Console
- [ ] Service account linked to the app with release permissions
- [ ] Create git tag `v1.0.0` (or provide `version_name` on manual dispatch)

### Before first iOS Dev run

- [ ] Apple Developer App ID **`com.nsnr.aplhavlogs.dev`** registered
- [ ] Development certificate + provisioning profile created and encoded
- [ ] `FIREBASE_SERVICE_ACCOUNT_JSON` + iOS dev signing secrets configured
- [ ] Firebase **`testers`** group exists for iOS dev app

### Before first iOS Production run

- [ ] Apple Developer App ID **`com.nsnr.aplhavlogs`** registered
- [ ] Distribution certificate + App Store provisioning profile
- [ ] App created in App Store Connect with bundle ID **`com.nsnr.aplhavlogs`**
- [ ] All seven Apple production secrets configured
- [ ] Create git tag `v1.0.0` for automated trigger

---

## 5. Validation steps

### Dev (Android + iOS)

1. Actions → **Android and iOS Firebase Distribution** → **Run workflow** → select the branch you want to build
2. Confirm lint, type-check, and tests pass in the **Validate** job
3. Download artifacts `android-dev-apk`, `android-dev-aab`, and `ios-dev-ipa`
4. Verify Android package: `aapt dump badging app-develop-release.apk | grep package`
5. Verify iOS bundle ID: `unzip -p JackMarvelsApp.ipa Payload/*.app/Info.plist | plutil -p - | grep CFBundleIdentifier`
6. Confirm both builds appear in [Firebase App Distribution](https://console.firebase.google.com/project/alpha-vlogs-cf60a/appdistribution)

### Android Production

1. Tag a commit: `git tag v1.0.0 && git push origin v1.0.0`
2. Or manual dispatch with `version_name: 1.0.0`
3. Confirm AAB artifact uploaded
4. Play Console → **Testing → Internal testing** → verify new release
5. Confirm track is **internal**, not production

### iOS Production

1. Push tag `v1.0.0` or manual dispatch
2. Confirm IPA artifact `ios-production-ipa`
3. App Store Connect → **TestFlight** → verify processing build
4. Confirm build is **not** submitted for App Store review automatically

---

## 6. Rollback plan

| Workflow | Rollback action |
| -------- | --------------- |
| Dev (Android + iOS) | Disable workflow; previous Firebase builds remain available; no store impact |
| Android Production | Play Console → Internal testing → **Halt rollout** or promote previous release; disable workflow |
| iOS Production | TestFlight → expire build; do not submit for review; disable workflow |

**Emergency stop:** Repository **Settings → Actions → Disable actions** or disable individual workflow files.

**Secret compromise:** Rotate affected secrets immediately (keystore cannot be rotated on Play — contact Google support if upload key compromised).

---

## 7. Risks

| Risk | Severity | Mitigation |
| ---- | -------- | ---------- |
| Missing secrets cause hard failures | Low (by design) | Complete setup checklist before first run |
| iOS dev requires development signing for IPA | Medium | Document `IOS_DEV_*` secrets; unsigned archives cannot reach Firebase |
| Play upload to wrong package if secret misconfigured | High | Package hardcoded to `com.nsnr.aplhavlogs`; verify Play Console listing |
| TestFlight upload without App Store publish | Low | Workflow uses `upload-testflight-build` only |
| Lint `--max-warnings=0` fails on warnings | Medium | Fix warnings or adjust threshold after baseline review |
| Duplicate Firebase iOS app IDs in plists | Medium | Re-download develop plist per `FIREBASE_CONSOLE_UPDATE.md` |
| Keystore loss | Critical | Backup keystore outside GitHub; store passwords in password manager |

---

## 8. Workflow behavior notes

- **No `continue-on-error`** — any lint, test, build, or deploy failure fails the pipeline
- **No Fastlane** — native Gradle / xcodebuild / Firebase CLI / store actions only
- **Android production** deploys to **internal** track only (not production track)
- **iOS production** uploads to **TestFlight** only (not App Store release)
- Firebase App IDs are resolved from repo config files, not hardcoded in workflows
