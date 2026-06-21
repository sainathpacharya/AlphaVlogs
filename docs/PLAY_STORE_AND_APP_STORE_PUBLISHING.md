# Publishing Guide: Google Play Store & Apple App Store

This guide covers publishing **Alpha Vlogs** (JackMarvelsApp) to the stores, starting with a "Coming Soon" release and best-practice setup for future production builds. **Alpha Vlogs’ main motto:** upload activities (talent events, performances, etc.) **by students or by their parents**, for students from KG to 10th class.

**Current setup (already in your project):**

- **Package name (Android):** `com.nsnr.aplhavlogs` (production), `com.nsnr.aplhavlogs.dev` (develop)
- **Bundle ID (iOS):** `com.nsnr.aplhavlogs` (production), `com.nsnr.aplhavlogs.dev` (develop)
- **App name:** Alpha Vlogs
- **Target audience:** Students from **KG (Kindergarten) to 10th class**
- **Main motto:** **Upload their activities—by students or by their parents.** (Talent events, performances, and more.)
- **Product flavors:** `develop` (debug) and `production` (release)
- **Signing:** Release builds use `android/app/keystore.properties` + your release keystore (see below)

---

## Part 1: Google Play Store

### 1. Step-by-step: Create a new app in Google Play Console

1. **Sign up / sign in**
   - Go to [Google Play Console](https://play.google.com/console).
   - Use a Google account. You need a **developer account** (one-time $25 registration fee).

2. **Create the app**
   - Click **Create app**.
   - **App name:** Alpha Vlogs
   - **Default language:** English (United States)
   - **App or game:** App
   - **Free or paid:** Choose (e.g. Free).
   - Accept declarations and create.

3. **Set up the app**
   - In the left menu: **Policy** → **App content** – complete required declarations (e.g. Privacy policy, Ads if any, Data safety, etc.).
   - **Setup** → **App signing**: Choose **Let Google Play manage your app signing key** (recommended). You will upload an **upload key** (your release keystore); Play will use its own key for distribution.
   - **Release** → **Production** (or **Testing** → **Internal testing** first): You’ll upload the first AAB here after building.

4. **Checklist – Play Console**
   - [ ] Developer account created ($25)
   - [ ] App created with name "Alpha Vlogs"
   - [ ] App signing: “Google manages key” (upload key = your release keystore)
   - [ ] Privacy policy URL set (required)
   - [ ] Data safety form completed
   - [ ] Store listing draft saved (see Store listing assets below)
   - [ ] Expert Approved: "Include my app" selected (recommended for Alpha Vlogs)

**Expert Approved programme (Store presence step):** When asked to join, choose **"Include my app in the Expert Approved programme"**. Alpha Vlogs targets students (KG–10th) and parents; the programme gives an Expert Approved badge and eligibility for the Kids tab. Experts review for quality and age appropriateness—a good fit for your app.

#### Data safety form (App content → Data safety)

Use these answers for Alpha Vlogs when filling the Data safety section:

| Question | Answer | Why |
|----------|--------|-----|
| **Does your app collect or share any of the required user data types?** | **Yes** | The app collects mobile number (login/OTP), name, email, address, school/grade (registration), profile data, and video/activity uploads. |
| **Is all of the user data collected by your app encrypted in transit?** | **Yes** | API calls use HTTPS (e.g. `https://api.alphavlogs.com`). Ensure your backend always uses TLS in production. |
| **Which methods of account creation does your app support?** | **Username and other authentication** | Accounts are created with **phone number** (username) and **OTP** (one-time password = “other authentication”). Do *not* select “Username and password” unless you add password login later. Select “OAuth” only if you add Google/Apple sign-in. |

After saving, you will need to declare **which data types** you collect (e.g. name, email, phone number, user-generated content like videos/photos) and for what purpose (e.g. app functionality, account management). Complete those follow-up screens as prompted.

#### Account and data deletion (Data safety / App content)

| Item | What to do |
|------|------------|
| **"Other"** | Leave **unchecked** unless another option applies. |
| **"My app does not allow users to create an account"** | Leave **unchecked**. Alpha Vlogs has user accounts (login/register with OTP). |
| **Delete account URL** | Required. Use a **public URL** to a page that: (1) refers to **Alpha Vlogs** (or your developer name as on the store listing), (2) **clearly lists the steps** users must follow to request account and data deletion, and (3) states **what data is deleted or kept** and any retention period. Example: `https://yoursite.com/alpha-vlogs-delete-account` or a section on your privacy policy page. See `docs/DELETE_ACCOUNT_PAGE_TEMPLATE.md` for copy you can host. |
| **Do you provide a way for users to request that some or all of their data be deleted without deleting their account?** | Choose **No** unless you offer in-app or email-based partial data deletion. You can change to **Yes** later if you add that feature. |

You must create and publish the deletion page (e.g. on your website) before submitting; the URL must be live when you save.

---

### 2. Prepare the React Native Android build (AAB for release)

**Use AAB (Android App Bundle)** for Play Store. Your project already has production flavor and release signing.

#### 2.1 One-time: Release signing key and `keystore.properties`

Create the keystore **once** and keep it safe (losing it blocks future updates for this package name).

```bash
cd /Users/nagasainathpalle/Desktop/Personal/JackMarvelsApp/android/app

# Generate release keystore (valid 10000 days ~27 years)
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore release.keystore \
  -alias alpha-vlogs-release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

You’ll be prompted for:

- Keystore password (choose a strong one; store in password manager)
- Key password (can be same as keystore)
- Name, org, city, state, country (e.g. your or company details)

Create `keystore.properties` (already in `.gitignore` – never commit it):

```bash
# From android/app/
cat > keystore.properties << 'EOF'
storeFile=release.keystore
storePassword=YOUR_KEYSTORE_PASSWORD
keyAlias=alpha-vlogs-release
keyPassword=YOUR_KEY_PASSWORD
EOF
```

Replace `YOUR_KEYSTORE_PASSWORD` and `YOUR_KEY_PASSWORD`.  
Path: `android/app/keystore.properties`.  
A template lives at `android/app/keystore.properties.example` (no real passwords).

**Backup (critical):**

- Copy `release.keystore` and store in a secure, backed-up location (e.g. encrypted backup).
- Store passwords in a password manager.
- Do not commit `keystore.properties` or `release.keystore` to git.

#### 2.2 Build production release AAB

From project root:

```bash
# Option A: Default version (versionCode=1, versionName=1.0)
cd android && ./gradlew bundleProductionRelease && cd ..

# Option B: Explicit version (recommended for “Coming Soon” and later)
cd android && ./gradlew bundleProductionRelease -PversionCode=1 -PversionName=1.0.0 && cd ..
```

Output AAB:

```
android/app/build/outputs/bundle/productionRelease/app-production-release.aab
```

Use this file to upload to Play Console.

#### 2.3 (Optional) Build APK for local/testing

```bash
cd android && ./gradlew assembleProductionRelease -PversionCode=1 -PversionName=1.0.0 && cd ..
# Output: android/app/build/outputs/apk/production/release/app-production-release.apk
```

---

### 3. Generate and manage the signing key (summary)

| Item                 | What to do                                                                                                                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Create key**       | `keytool -genkeypair ...` as above; keep `release.keystore` and passwords safe.                                                                                                                       |
| **Play App Signing** | In Play Console → Setup → App signing, choose “Google Play App Signing”. First upload can use your upload key (this keystore); Play may ask you to enroll and then use your AAB signed with this key. |
| **Upload key**       | The key in `release.keystore` is your **upload key**. Play will sign the final APKs with its own key.                                                                                                 |
| **Backup**           | Backup `release.keystore` and passwords; consider encrypted cloud + password manager.                                                                                                                 |
| **CI/CD**            | In CI, inject secrets (e.g. base64 keystore + `keystore.properties`) from a secret store; never commit them.                                                                                          |

---

### 4. Upload “Coming Soon” version (Internal → Production path)

1. **Internal testing (recommended first)**
   - Play Console → **Testing** → **Internal testing** → **Create new release**.
   - Upload `app-production-release.aab`.
   - Add release name (e.g. “1.0.0 – Coming Soon”) and optional release notes.
   - Save and **Review release** → **Start rollout**.
   - Add internal testers (email list). They get the link to opt in and install.

2. **Promote to production**
   - When ready: **Release** → **Production** → **Create new release**.
   - Upload the same (or a new) AAB. Use a **new versionCode** for each new upload (e.g. 1 for first release).
   - Complete store listing (see below) and any remaining policy items.
   - **Send for review** (or **Start rollout to production**). Review can take from hours to a few days.

**Checklist – First upload**

- [ ] AAB built with `bundleProductionRelease`, versionCode/versionName set
- [ ] Internal testing release created and tested
- [ ] Production release created; store listing and policy requirements complete
- [ ] Production rollout started

---

### 5. Store listing assets (required for Play)

| Asset                 | Requirement                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------- |
| **App icon**          | 512×512 px PNG, 32-bit, no transparency. You have icons in `android/app/src/main/res/mipmap-*`. |
| **Feature graphic**   | 1024×500 px, JPG or PNG. Shown at top of store listing.                                         |
| **Short description** | Max 80 characters.                                                                              |
| **Full description**  | Max 4000 characters.                                                                            |
| **Screenshots**       | At least 2 (phone). Min length 320px, max 3840px. 7" and 10" tablet optional.                   |
| **Privacy policy**    | URL (required).                                                                                 |
| **App category**      | e.g. Education or Entertainment.                                                                |
| **Content rating**    | Complete questionnaire in Play Console.                                                         |
| **Target audience**   | Age groups. **Alpha Vlogs is for students from KG to 10th class** (approx. 4–16 years). Select 6–8, 9–12, 13–15, 16–17 (and 18+ if parents/teachers use the app). |

For “Coming Soon” you can use:

- One simple “Coming Soon” screen + logo/feature graphic.
- Short description (max 80 chars), e.g.: “Upload activities by students or parents—KG to 10th. Coming soon.”
- Full description example: "Alpha Vlogs is for students from KG to 10th class. **The main motto: upload their activities—whether by students or by their parents.** Share talent event videos, performances, and more. Coming soon."

---

### 6. Versioning strategy for future updates

- **versionCode (Android):** Integer. **Must increase** for every Play Store upload (e.g. 1, 2, 3 …). Use in `build.gradle` via `-PversionCode=...`.
- **versionName (Android):** User-visible (e.g. 1.0.0, 1.1.0). Set via `-PversionName=...`.

Suggested flow:

1. **Single source of truth:** e.g. `package.json` version or git tags (e.g. `v1.0.0`).
2. **Local/CI build:**
   ```bash
   # Example: version from package.json
   VERSION=$(node -p "require('./package.json').version")
   CODE=$(git rev-list --count HEAD)   # or use a build number from CI
   cd android && ./gradlew bundleProductionRelease -PversionName=$VERSION -PversionCode=$CODE
   ```
3. **Convention:** Use semantic versions for `versionName` (e.g. 1.0.0, 1.1.0). Use a monotonically increasing integer for `versionCode` (e.g. from CI or from a small script that reads last tag + commit count).

Your `android/app/build.gradle` already supports `-PversionCode` and `-PversionName`; use them on every release build.

---

### 7. Common mistakes to avoid (first release)

- **Using debug keystore for production:** Ensure `keystore.properties` exists and points to your release keystore; otherwise the build may fall back to debug (see `build.gradle`). Never upload debug-signed AAB to production.
- **Losing the release keystore:** Backup `release.keystore` and passwords; without them you cannot update the app.
- **Reusing or decreasing versionCode:** Each new AAB must have a strictly higher `versionCode` than the one currently in the track.
- **Wrong applicationId:** Store listing and AAB must match. Production uses `com.nsnr.aplhavlogs` (no `.dev`).
- **Missing store listing:** Production won’t go live until required assets and policy sections are complete.
- **Skipping internal testing:** Test install and opening the app (e.g. Coming Soon screen) on internal testing before production.
- **Not enabling Google Play App Signing:** Let Google manage the app signing key; you only manage the upload key.

---

## Part 2: Apple App Store (high-level)

Do this **after** (or in parallel with) Play Store, when you’re ready for iOS.

### 1. Apple Developer Program

- Enroll at [developer.apple.com](https://developer.apple.com) ($99/year).
- Create an **App ID** (Bundle ID): `com.nsnr.aplhavlogs` (already used in your Xcode project).

### 2. App Store Connect

- Create the app in [App Store Connect](https://appstoreconnect.apple.com): name “Alpha Vlogs”, Bundle ID `com.nsnr.aplhavlogs`, SKU (e.g. `alpha-vlogs-ios`).
- Fill in **Pricing**, **Privacy**, **App Privacy** (nutrition labels), **Age rating**, **App category**.

### 3. Certificates and provisioning

- **Signing:** Use **Automatically manage signing** in Xcode with your Apple Developer team, or create Distribution certificate + App Store provisioning profile manually.
- **Capabilities:** Match what your app uses (e.g. Push Notifications, Keychain, etc.) in the App ID and in Xcode.

### 4. Build and archive in Xcode

- Select **Any iOS Device** (or a connected device), scheme **JackMarvelsApp**, configuration **Release**.
- **Product** → **Archive**.
- In Organizer: **Distribute App** → **App Store Connect** → **Upload**. Ensure version (**MARKETING_VERSION**) and build number (**CURRENT_PROJECT_VERSION**) are set in the Xcode project (e.g. 1.0.0 and 1).

### 5. Store listing and submission

- In App Store Connect: **App Store** tab – screenshots (6.7", 6.5", 5.5" etc. as required), description, keywords, icon, Privacy Policy URL, etc.
- Create a **version** (e.g. 1.0.0), attach the uploaded build, fill “What’s New”, then **Submit for Review**.

### 6. Versioning (iOS)

- **CFBundleShortVersionString** = Marketing version (e.g. 1.0.0). Shown to users.
- **CFBundleVersion** = Build number. Must increase for each build you upload (e.g. 1, 2, 3).
- Set both in Xcode: target → **General** → **Version** and **Build**, or in `project.pbxproj` (`MARKETING_VERSION`, `CURRENT_PROJECT_VERSION`).

### 7. Checklist – App Store

- [ ] Apple Developer account and App ID `com.nsnr.aplhavlogs`
- [ ] App created in App Store Connect
- [ ] Distribution certificate and App Store provisioning profile
- [ ] Archive built with Release configuration, uploaded to App Store Connect
- [ ] Screenshots, description, privacy policy, age rating, and other metadata complete
- [ ] Version and build number set and incremented for each upload
- [ ] Submitted for review

---

## Quick reference – Your project

| Item                         | Value                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------- |
| Android package (production) | `com.nsnr.aplhavlogs`                                                           |
| Android package (develop)    | `com.nsnr.aplhavlogs.dev`                                                       |
| iOS Bundle ID                | `com.nsnr.aplhavlogs` (dev: `com.nsnr.aplhavlogs.dev`)                          |
| App name                     | Alpha Vlogs                                                                     |
| Target audience / motto      | Students KG–10th; **upload activities by students or by their parents**         |
| Production AAB task          | `./gradlew bundleProductionRelease`                                             |
| AAB output                   | `android/app/build/outputs/bundle/productionRelease/app-production-release.aab` |
| Version flags                | `-PversionCode=1 -PversionName=1.0.0`                                           |
| Keystore config              | `android/app/keystore.properties` (create from `keystore.properties.example`)   |

Use this doc as the single place for store publishing steps; update version numbers and paths as your project evolves.
