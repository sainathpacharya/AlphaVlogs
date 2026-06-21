# Updating Firebase Console for New Package / Bundle IDs

Your app now uses these identifiers:

| Platform   | Production        | Develop / Dev      |
|-----------|-------------------|--------------------|
| **Android** (package name) | `com.nsnr.aplhavlogs`     | `com.nsnr.aplhavlogs.dev` |
| **iOS** (bundle ID)        | `com.nsnr.aplhavlogs`     | `com.nsnr.aplhavlogs.dev` |

Firebase identifies apps by these IDs. After renaming, you must **register the new IDs** in the Firebase project and (optionally) refresh config files.

---

## 1. Open your Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Select project **alpha-vlogs-cf60a** (or your Alpha Vlogs project).
3. Click the **gear icon** next to “Project overview” → **Project settings**.

---

## 2. Android apps

In **Project settings** → **Your apps**, check the list of Android apps.

### If you see old package names (e.g. `com.jackmarvelsapp` / `com.snsr.alphavlogs`)

- You **cannot** change an existing app’s package name in Firebase.
- Add **new** Android apps for the new package names and then use the new config.

### Add new Android apps

1. In **Your apps**, click **Add app** (or “Add another app”) and choose **Android**.
2. **Register app (1/3):**
   - **Android package name:** `com.nsnr.aplhavlogs`
   - (Optional) App nickname: e.g. “Alpha Vlogs (Production)”
   - (Optional) Debug signing certificate SHA-1 if you use Auth, etc.
3. Click **Register app**.
4. **Download config (2/3):** Download `google-services.json` and **replace**  
   `android/app/google-services.json` in your repo.
5. Finish the wizard (3/3).

Repeat for the **dev** build:

1. **Add app** → **Android** again.
2. **Android package name:** `com.nsnr.aplhavlogs.dev`
3. App nickname: e.g. “Alpha Vlogs (Dev)”
4. Download the new `google-services.json`.

Your current `android/app/google-services.json` already has two `client` entries (production and dev). After adding both apps in Firebase, you can either:

- **Option A:** Use the **single** `google-services.json` that Firebase gives you when you have both Android apps in the same project. That file will contain both `com.nsnr.aplhavlogs` and `com.nsnr.aplhavlogs.dev` in the `client` array. Replace `android/app/google-services.json` with this file.
- **Option B:** If you added the two apps in separate steps, merge the two downloaded files so that the one in `android/app/` has both clients (copy the second `client` object into the `client` array of the first file).

---

## 3. iOS apps

In **Project settings** → **Your apps**, check the list of iOS apps.

### If you see old bundle IDs

- You **cannot** change an existing app’s bundle ID.
- Add **new** iOS apps for the new bundle IDs.

### Add new iOS apps

1. **Add app** → **iOS**.
2. **Register app (1/3):**
   - **iOS bundle ID:** `com.nsnr.aplhavlogs`
   - (Optional) App nickname: e.g. “Alpha Vlogs (Production)”
   - (Optional) App Store ID if you already have one.
3. Click **Register app**.
4. **Download config (2/3):** Download `GoogleService-Info.plist`.  
   - Replace **production** plist in your repo:  
     `ios/JackMarvelsApp/GoogleService-Info.plist`
5. Finish the wizard.

Repeat for the **dev** build:

1. **Add app** → **iOS** again.
2. **iOS bundle ID:** `com.nsnr.aplhavlogs.dev`
3. App nickname: e.g. “Alpha Vlogs (Dev)”
4. Download the second `GoogleService-Info.plist` and save it as:  
   `ios/JackMarvelsApp/GoogleService-Info-Develop.plist`  
   (overwrite the existing file).

---

## 4. Summary checklist

- [ ] Firebase project **alpha-vlogs-cf60a** opened in Console.
- [ ] Android app added with package `com.nsnr.aplhavlogs` and config downloaded.
- [ ] Android app added with package `com.nsnr.aplhavlogs.dev` and config merged into `android/app/google-services.json` (or single file with both clients).
- [ ] iOS app added with bundle ID `com.nsnr.aplhavlogs` → `GoogleService-Info.plist` replaced.
- [ ] iOS app added with bundle ID `com.nsnr.aplhavlogs.dev` → `GoogleService-Info-Develop.plist` replaced.
- [ ] Rebuild Android and iOS apps and test (e.g. Auth, Cloud Messaging, Analytics if you use them).

---

## 5. Optional: SHA-1 (Android)

If you use **Firebase Auth** (e.g. Google Sign-In), add your **SHA-1** (and SHA-256) for each build type:

1. **Project settings** → your **Android app** → **Add fingerprint**.
2. Add **Debug** and **Release** SHA-1 (and SHA-256) from your keystores.

Get SHA-1 from your machine:

```bash
# Debug (default)
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Release (path/alias from your android/app/keystore.properties)
keytool -list -v -keystore android/app/your-release.keystore -alias your-key-alias
```

---

## 6. Known configuration checks (Phase 0)

After aligning bundle IDs in Xcode and workflows, verify in **Project settings → Your apps**:

| Check | Expected |
|-------|----------|
| Android production package | `com.nsnr.aplhavlogs` → app ID `1:452248149004:android:fda0cc05fefccedbaf2229` |
| Android develop package | `com.nsnr.aplhavlogs.dev` → app ID `1:452248149004:android:2062c0a9b5826798af2229` |
| iOS production bundle ID | `com.nsnr.aplhavlogs` → app ID in `GoogleService-Info.plist` |
| iOS develop bundle ID | `com.nsnr.aplhavlogs.dev` → app ID in `GoogleService-Info-Develop.plist` |

**Important:** Production and develop iOS apps must be **separate** Firebase app registrations. Each plist’s `GOOGLE_APP_ID` must match its bundle ID’s Firebase app. If both plists share the same `GOOGLE_APP_ID`, re-download `GoogleService-Info-Develop.plist` from the develop iOS app in Firebase Console.

---

## 7. If something doesn’t work

- **“App not authorized” / invalid package:** The package or bundle ID in the app doesn’t match any app in Firebase. Re-check IDs in Project settings and in your `build.gradle` / Xcode.
- **Wrong or missing config:** Ensure you replaced **both** Android `google-services.json` and **both** iOS plists with the files from the **new** Firebase app registrations.
- **Old app still in project:** You can leave old package/bundle IDs in the same Firebase project; they just won’t be used by this codebase. You can delete them later from Project settings if you want to tidy up.

If you tell me which step you’re on (e.g. “I added Android production, what next?”), I can give the exact next clicks or file edits.
