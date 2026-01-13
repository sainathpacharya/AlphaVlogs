# Store Publishing Setup Guide

This guide will help you set up automatic publishing to Google Play Store and Apple App Store.

**Quick Reference:** See `STORE_CREDENTIALS_CHECKLIST.md` for a summary of exactly what credentials you need.

## 📱 Google Play Store Setup

**Important:** The workflow will publish to **YOUR** Google Play Store account - specifically, the account that the service account is linked to. You control which account by:

1. Creating the service account in **your** Google Cloud project
2. Linking it to **your** app in **your** Google Play Console account
3. The package name (`com.jackmarvelsapp`) must match your app in Play Console

### Step 1: Create a Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Play Android Developer API**:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google Play Android Developer API"
   - Click "Enable"

### Step 2: Create Service Account Key

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in the details:
   - **Name:** `github-actions-play-store`
   - **Description:** Service account for GitHub Actions
4. Click "Create and Continue"
5. Skip role assignment (click "Continue")
6. Click "Done"

### Step 3: Create JSON Key

1. Click on the created service account
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Select "JSON" format
5. Click "Create" - the JSON file will download automatically

### Step 4: Link Service Account to Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app (`com.jackmarvelsapp`)
3. Go to "Setup" → "API access"
4. Click "Link service account"
5. Enter the service account email (from Step 2)
6. Grant the following permissions:
   - ✅ **View app information and download bulk reports**
   - ✅ **Manage production releases**
   - ✅ **Manage testing track releases**
   - ✅ **Manage alpha and beta testing track releases**
7. Click "Invite user"

### Step 5: Add Secret to GitHub

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click "New repository secret"
4. Add the following secret:
   - **Name:** `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`
   - **Value:** Copy the entire contents of the JSON file downloaded in Step 3
5. Click "Add secret"

### Step 6: Verify Package Name

Ensure your package name matches:

- **Package Name:** `com.jackmarvelsapp`
- This is already configured in `android-publish.yml`

### ✅ Testing

1. Go to **Actions** tab in GitHub
2. Select "Android Build & Publish to Play Store"
3. Click "Run workflow"
4. Select a track (start with "internal" for testing)
5. Click "Run workflow"

The workflow will:

- Build the AAB
- Upload to the selected Play Store track
- You can verify in [Google Play Console](https://play.google.com/console)

---

## 🍎 Apple App Store Setup

### Step 1: Create App Store Connect API Key

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Navigate to **Users and Access** → **Keys** tab
3. Click the **+** button to create a new key
4. Fill in:
   - **Name:** `GitHub Actions CI/CD`
   - **Access:** **App Manager** (minimum required)
5. Click "Generate"
6. **Important:** Download the `.p8` key file immediately (you can only download it once!)
7. Note down:
   - **Key ID** (e.g., `ABC123DEF4`)
   - **Issuer ID** (shown at the top of the Keys page, e.g., `12345678-1234-1234-1234-123456789012`)

### Step 2: Export Code Signing Certificate

#### Option A: Using Xcode (Recommended)

1. Open Xcode
2. Go to **Xcode** → **Settings** → **Accounts**
3. Select your Apple ID
4. Click "Manage Certificates"
5. Click the **+** button → **Apple Distribution**
6. The certificate will be added to your Keychain

#### Option B: Using Keychain Access

1. Open **Keychain Access** on your Mac
2. Select "login" keychain and "My Certificates" category
3. Find your **Apple Distribution** certificate
4. Right-click → **Export**
5. Save as `.p12` file
6. Set a password when prompted

### Step 3: Create Provisioning Profile

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Go to **Profiles** → Click **+**
4. Select **App Store** distribution
5. Select your App ID (`com.jackmarvelsapp`)
6. Select your distribution certificate
7. Name it: `JackMarvelsApp App Store`
8. Download the profile

### Step 4: Convert Files to Base64

Run these commands on your Mac:

```bash
# Convert certificate to base64
base64 -i your-certificate.p12 | pbcopy

# Convert provisioning profile to base64
base64 -i your-profile.mobileprovision | pbcopy
```

### Step 5: Add Secrets to GitHub

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Add these secrets:

#### App Store Connect API Secrets:

- **Name:** `APPLE_ISSUER_ID`
  - **Value:** Your Issuer ID from Step 1 (e.g., `12345678-1234-1234-1234-123456789012`)

- **Name:** `APPLE_KEY_ID`
  - **Value:** Your Key ID from Step 1 (e.g., `ABC123DEF4`)

- **Name:** `APPLE_PRIVATE_KEY`
  - **Value:** The contents of your `.p8` file (the entire file, including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)

#### Code Signing Secrets:

- **Name:** `APPLE_CERTIFICATE_BASE64`
  - **Value:** The base64 string from Step 4 (certificate)

- **Name:** `APPLE_CERTIFICATE_PASSWORD`
  - **Value:** The password you set when exporting the certificate

- **Name:** `APPLE_PROVISIONING_PROFILE_BASE64`
  - **Value:** The base64 string from Step 4 (provisioning profile)

#### Optional Secrets:

- **Name:** `APPLE_TEAM_ID`
  - **Value:** Your Apple Team ID (found in Apple Developer Portal)

- **Name:** `APPLE_CODE_SIGN_IDENTITY`
  - **Value:** Usually `Apple Distribution` (default if not set)

- **Name:** `APPLE_EXPORT_METHOD`
  - **Value:** `app-store` (default, for App Store/TestFlight)

### Step 6: Verify App ID

Ensure your App ID matches:

- **Bundle ID:** `com.jackmarvelsapp`
- This should match your Xcode project settings

### ✅ Testing

1. Go to **Actions** tab in GitHub
2. Select "iOS Build & Publish to App Store"
3. Click "Run workflow"
4. Click "Run workflow"

The workflow will:

- Build the iOS archive
- Export IPA with code signing
- Upload to TestFlight
- You can verify in [App Store Connect](https://appstoreconnect.apple.com/)

---

## 🔒 Security Best Practices

1. **Never commit secrets to git** - Always use GitHub Secrets
2. **Limit API access** - Use minimum required permissions
3. **Rotate keys regularly** - Update secrets periodically
4. **Use separate accounts** - Consider using a dedicated CI/CD account
5. **Monitor access logs** - Check Play Console and App Store Connect for unusual activity

## 🐛 Troubleshooting

### Google Play Store

**Error: "Service account doesn't have access"**

- Ensure you've linked the service account in Play Console
- Verify permissions are granted correctly

**Error: "Package name mismatch"**

- Verify `PACKAGE_NAME` in workflow matches your app's package name
- Check `android/app/build.gradle` for `applicationId`

### Apple App Store

**Error: "Code signing failed"**

- Verify certificate and provisioning profile are valid
- Check that certificate password is correct
- Ensure provisioning profile matches your App ID

**Error: "Invalid API credentials"**

- Verify Issuer ID, Key ID, and Private Key are correct
- Ensure the API key has App Manager access
- Check that the `.p8` file content is complete (including headers)

**Error: "Build processing timeout"**

- Use `skip_waiting_for_build_processing: true` in workflow inputs
- Builds can take 10-30 minutes to process in TestFlight

## 📚 Additional Resources

- [Google Play Console API](https://developers.google.com/android-publisher)
- [App Store Connect API](https://developer.apple.com/app-store-connect/api/)
- [React Native Code Signing](https://reactnative.dev/docs/signed-apk-android)
- [Xcode Code Signing Guide](https://developer.apple.com/documentation/xcode/managing-your-team-s-signing-assets)

## ✅ Checklist

### Google Play Store

- [ ] Service account created
- [ ] Google Play Android Developer API enabled
- [ ] Service account linked in Play Console
- [ ] Permissions granted
- [ ] JSON key downloaded
- [ ] `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` secret added to GitHub
- [ ] Tested workflow run

### Apple App Store

- [ ] App Store Connect API key created
- [ ] Key ID and Issuer ID noted
- [ ] `.p8` file downloaded
- [ ] Distribution certificate exported
- [ ] Provisioning profile created and downloaded
- [ ] Files converted to base64
- [ ] All secrets added to GitHub
- [ ] Tested workflow run

---

**Need Help?** Check the workflow logs in GitHub Actions for detailed error messages.
