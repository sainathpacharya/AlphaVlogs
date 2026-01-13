# Store Publishing Credentials Checklist

This document lists exactly what you need to provide to enable automatic publishing to Google Play Store and Apple App Store.

## 📱 Google Play Store - Required Information

### What You Need to Provide:

1. **Service Account JSON Key**
   - File: A JSON file downloaded from Google Cloud Console
   - Contains: Service account credentials
   - How to get it: Follow steps in `STORE_PUBLISHING_SETUP.md` (Google Play section)
   - GitHub Secret Name: `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`
   - **Value:** Copy the entire contents of the JSON file

### Optional (Already Configured):

- ✅ **Package Name:** `com.jackmarvelsapp` (already set in workflow)
- ✅ **Release Track:** Can be selected when running workflow (internal/alpha/beta/production)

### What You Need to Do:

1. ✅ Have a Google Play Console account
2. ✅ Have an app created in Play Console with package name `com.jackmarvelsapp`
3. ✅ Create a Google Cloud project
4. ✅ Create a service account in that project
5. ✅ Enable Google Play Android Developer API
6. ✅ Link service account to your app in Play Console
7. ✅ Download the JSON key file
8. ✅ Add the JSON content as GitHub Secret

---

## 🍎 Apple App Store - Required Information

### What You Need to Provide:

#### 1. App Store Connect API Credentials (3 items):

**a) Issuer ID**

- Type: String (UUID format)
- Example: `12345678-1234-1234-1234-123456789012`
- Where to find: App Store Connect → Users and Access → Keys → Top of page
- GitHub Secret Name: `APPLE_ISSUER_ID`

**b) Key ID**

- Type: String
- Example: `ABC123DEF4`
- Where to find: After creating API key in App Store Connect
- GitHub Secret Name: `APPLE_KEY_ID`

**c) Private Key (.p8 file content)**

- Type: Text file content
- Format: Includes `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Where to find: Downloaded when creating API key (download only once!)
- GitHub Secret Name: `APPLE_PRIVATE_KEY`
- **Value:** Copy the entire file content (including headers)

#### 2. Code Signing Credentials (3 items):

**a) Distribution Certificate (Base64 encoded)**

- Type: Base64 string
- Original file: `.p12` certificate file
- How to get: Export from Keychain Access or Xcode
- GitHub Secret Name: `APPLE_CERTIFICATE_BASE64`
- **How to convert:** `base64 -i certificate.p12 | pbcopy` (on Mac)

**b) Certificate Password**

- Type: String (password you set when exporting certificate)
- GitHub Secret Name: `APPLE_CERTIFICATE_PASSWORD`

**c) Provisioning Profile (Base64 encoded)**

- Type: Base64 string
- Original file: `.mobileprovision` file
- How to get: Download from Apple Developer Portal
- GitHub Secret Name: `APPLE_PROVISIONING_PROFILE_BASE64`
- **How to convert:** `base64 -i profile.mobileprovision | pbcopy` (on Mac)

### Optional (Can be auto-detected):

- **Team ID:** Your Apple Developer Team ID
  - GitHub Secret Name: `APPLE_TEAM_ID` (optional, can be extracted from certificate)
- **Code Sign Identity:** Usually `Apple Distribution`
  - GitHub Secret Name: `APPLE_CODE_SIGN_IDENTITY` (optional, defaults to `Apple Distribution`)

- **Export Method:** Usually `app-store`
  - GitHub Secret Name: `APPLE_EXPORT_METHOD` (optional, defaults to `app-store`)

### What You Need to Have:

1. ✅ Apple Developer Account ($99/year)
2. ✅ App created in App Store Connect with bundle ID `com.jackmarvelsapp`
3. ✅ Distribution certificate (Apple Distribution)
4. ✅ App Store provisioning profile
5. ✅ App Store Connect API access enabled

---

## 📋 Quick Checklist

### Google Play Store:

- [ ] Google Play Console account
- [ ] App created with package `com.jackmarvelsapp`
- [ ] Google Cloud project
- [ ] Service account created
- [ ] Google Play Android Developer API enabled
- [ ] Service account linked to app in Play Console
- [ ] JSON key file downloaded
- [ ] `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` secret added to GitHub

### Apple App Store:

- [ ] Apple Developer account
- [ ] App created in App Store Connect with bundle ID `com.jackmarvelsapp`
- [ ] App Store Connect API key created
- [ ] Issuer ID noted
- [ ] Key ID noted
- [ ] `.p8` file downloaded
- [ ] Distribution certificate exported
- [ ] Certificate converted to base64
- [ ] Provisioning profile downloaded
- [ ] Provisioning profile converted to base64
- [ ] All 6 secrets added to GitHub:
  - [ ] `APPLE_ISSUER_ID`
  - [ ] `APPLE_KEY_ID`
  - [ ] `APPLE_PRIVATE_KEY`
  - [ ] `APPLE_CERTIFICATE_BASE64`
  - [ ] `APPLE_CERTIFICATE_PASSWORD`
  - [ ] `APPLE_PROVISIONING_PROFILE_BASE64`

---

## 🔐 How to Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter the secret name (exactly as listed above)
5. Paste the value
6. Click **Add secret**

**Important:**

- Secret names are case-sensitive
- For JSON files, copy the ENTIRE file content
- For base64, copy the ENTIRE base64 string (it's very long)
- Never commit secrets to your code!

---

## 📝 Summary: What I Need From You

### For Google Play Store:

**Just 1 thing:**

- The JSON service account key file content → Add as `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`

### For Apple App Store:

**6 things:**

1. Issuer ID → `APPLE_ISSUER_ID`
2. Key ID → `APPLE_KEY_ID`
3. Private Key (.p8 content) → `APPLE_PRIVATE_KEY`
4. Certificate (base64) → `APPLE_CERTIFICATE_BASE64`
5. Certificate Password → `APPLE_CERTIFICATE_PASSWORD`
6. Provisioning Profile (base64) → `APPLE_PROVISIONING_PROFILE_BASE64`

---

## 🚀 Once You Have Everything

1. Follow the detailed steps in `STORE_PUBLISHING_SETUP.md`
2. Add all secrets to GitHub
3. Test by running the workflow manually
4. Check the workflow logs if there are any issues

The workflows are already configured - they just need your credentials!

---

## ❓ Don't Have These Yet?

**Google Play Store:**

- You need a Google Play Developer account ($25 one-time fee)
- Create an app in Play Console
- Follow `STORE_PUBLISHING_SETUP.md` for step-by-step instructions

**Apple App Store:**

- You need an Apple Developer account ($99/year)
- Create an app in App Store Connect
- Follow `STORE_PUBLISHING_SETUP.md` for step-by-step instructions

---

## 🔗 Quick Links

- [Google Play Console](https://play.google.com/console)
- [Google Cloud Console](https://console.cloud.google.com/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Apple Developer Portal](https://developer.apple.com/account/)
- [Detailed Setup Guide](./STORE_PUBLISHING_SETUP.md)
