# iOS Bundle Identifier

## Current Bundle Identifier

Your iOS app's bundle identifier is currently set to:

```
org.reactjs.native.example.JackMarvelsApp
```

This is the default React Native template bundle ID.

---

## Recommended Bundle Identifier

To match your Android package name, you should change it to:

```
com.jackmarvelsapp
```

This matches your Android app's package name (`com.jackmarvelsapp`) for consistency.

---

## How to Change Bundle Identifier

### Method 1: Using Xcode (Recommended)

1. Open `ios/JackMarvelsApp.xcworkspace` in Xcode
2. Select the **JackMarvelsApp** project in the left sidebar
3. Select the **JackMarvelsApp** target
4. Go to the **General** tab
5. Find **Bundle Identifier** field
6. Change from `org.reactjs.native.example.JackMarvelsApp` to `com.jackmarvelsapp`
7. Save the project

### Method 2: Edit project.pbxproj File

1. Open `ios/JackMarvelsApp.xcodeproj/project.pbxproj`
2. Find all occurrences of:
   ```
   PRODUCT_BUNDLE_IDENTIFIER = "org.reactjs.native.example.$(PRODUCT_NAME:rfc1034identifier)";
   ```
3. Replace with:
   ```
   PRODUCT_BUNDLE_IDENTIFIER = "com.jackmarvelsapp";
   ```
4. Save the file

**Note:** There are 4 occurrences (Debug, Release, and for both main app and test target)

### Method 3: Using sed (Command Line)

```bash
cd ios
sed -i '' 's/org.reactjs.native.example.$(PRODUCT_NAME:rfc1034identifier)/com.jackmarvelsapp/g' JackMarvelsApp.xcodeproj/project.pbxproj
```

---

## Verify Bundle Identifier

After changing, verify it:

### Using Xcode:

1. Open the project in Xcode
2. Check the Bundle Identifier in General tab

### Using Command Line:

```bash
cd ios
xcodebuild -showBuildSettings -workspace JackMarvelsApp.xcworkspace -scheme JackMarvelsApp | grep PRODUCT_BUNDLE_IDENTIFIER
```

---

## Important Notes

### 1. App Store Connect

- The bundle identifier must match your app in App Store Connect
- If you already have an app in App Store Connect, you need to create a new app with the new bundle ID, or change it in App Store Connect (if possible)

### 2. Provisioning Profiles

- You'll need to create new provisioning profiles with the new bundle identifier
- Update your provisioning profiles in Apple Developer Portal

### 3. Certificates

- Your distribution certificate can stay the same
- Only the provisioning profile needs to match the bundle ID

### 4. Consistency

- It's recommended to use the same identifier as Android (`com.jackmarvelsapp`) for easier management

---

## Current Configuration

Based on your project files:

- **Android Package Name:** `com.jackmarvelsapp`
- **iOS Bundle Identifier:** `org.reactjs.native.example.JackMarvelsApp` (should be changed to `com.jackmarvelsapp`)

---

## Quick Reference

**Current:** `org.reactjs.native.example.JackMarvelsApp`  
**Recommended:** `com.jackmarvelsapp`

**To use in:**

- App Store Connect app creation
- Provisioning profile creation
- Xcode project settings
- CI/CD workflows (already configured in `ios-publish.yml`)

---

## After Changing Bundle ID

1. ✅ Update provisioning profiles in Apple Developer Portal
2. ✅ Update App Store Connect app (or create new one)
3. ✅ Clean and rebuild: `cd ios && xcodebuild clean`
4. ✅ Test the build: `yarn ios`

---

**Need help?** The bundle identifier is already referenced in the CI/CD workflows, so once you change it in Xcode, the workflows will use the new value automatically.
