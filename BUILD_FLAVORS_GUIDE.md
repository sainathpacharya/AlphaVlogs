# Build Flavors Guide

This guide explains the develop and production build flavors configured for both Android and iOS.

## 📱 Overview

The project now supports two build flavors/configurations:

1. **Develop** - For development and testing
2. **Production** - For production and app store releases

## 🤖 Android Flavors

### Configuration

**Location:** `android/app/build.gradle`

### Develop Flavor
- **Package Name:** `com.jackmarvelsapp.dev`
- **App Name:** "JackMarvels Dev"
- **Version Suffix:** `-dev`
- **Signing:** Debug keystore
- **Use Case:** Internal testing, development builds

### Production Flavor
- **Package Name:** `com.jackmarvelsapp`
- **App Name:** "JackMarvelsApp"
- **Version Suffix:** None
- **Signing:** Release keystore (configure production keystore)
- **Use Case:** Production releases, Play Store

### Build Commands

```bash
# Build Develop APK
cd android
./gradlew assembleDevelopRelease

# Build Production APK
./gradlew assembleProductionRelease

# Build Develop AAB
./gradlew bundleDevelopRelease

# Build Production AAB
./gradlew bundleProductionRelease
```

### Local Testing

```bash
# Run develop flavor
yarn android --variant=developRelease

# Run production flavor
yarn android --variant=productionRelease
```

## 🍎 iOS Configurations

### Configuration

**Location:** Xcode project settings

### Develop Configuration
- **Bundle ID:** `com.jackmarvelsapp.dev`
- **Use Case:** Internal testing, development builds

### Production Configuration
- **Bundle ID:** `com.jackmarvelsapp`
- **Use Case:** Production releases, App Store

### Build Commands

```bash
# Build Develop Archive
cd ios
xcodebuild clean archive \
  -workspace JackMarvelsApp.xcworkspace \
  -scheme JackMarvelsApp \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath build/JackMarvelsApp-develop.xcarchive \
  PRODUCT_BUNDLE_IDENTIFIER=com.jackmarvelsapp.dev

# Build Production Archive
xcodebuild clean archive \
  -workspace JackMarvelsApp.xcworkspace \
  -scheme JackMarvelsApp \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath build/JackMarvelsApp-production.xcarchive \
  PRODUCT_BUNDLE_IDENTIFIER=com.jackmarvelsapp
```

## 🚀 CI/CD Workflows

### Automatic Flavor Selection

The workflows automatically select the flavor based on the branch:

- **`develop` branch** → Develop flavor
- **`main` branch** → Production flavor

### Manual Selection

You can also manually select the flavor when triggering workflows:

1. Go to **Actions** tab
2. Select the workflow
3. Click **Run workflow**
4. Choose flavor/configuration from dropdown

### Available Workflows

#### Android
- **`android-build-flavors.yml`** - Builds both develop and production flavors
  - Trigger: Push to `develop` or `main`, or manual
  - Output: APK or AAB based on selection

#### iOS
- **`ios-build-flavors.yml`** - Builds both develop and production configurations
  - Trigger: Push to `develop` or `main`, or manual
  - Output: iOS Archive (.xcarchive)

## 📋 Workflow Behavior

### Branch-Based Auto-Selection

| Branch | Android Flavor | iOS Configuration | Package/Bundle ID |
|--------|---------------|-------------------|-------------------|
| `develop` | `develop` | `develop` | `com.jackmarvelsapp.dev` |
| `main` | `production` | `production` | `com.jackmarvelsapp` |

### Manual Override

When using `workflow_dispatch`, you can override the automatic selection by choosing a flavor in the workflow inputs.

## 🔧 Configuration Details

### Android Package Names

- **Develop:** `com.jackmarvelsapp.dev`
- **Production:** `com.jackmarvelsapp`

### iOS Bundle Identifiers

- **Develop:** `com.jackmarvelsapp.dev`
- **Production:** `com.jackmarvelsapp`

### App Names

- **Develop:** "JackMarvels Dev" (Android only, iOS uses same name)
- **Production:** "JackMarvelsApp"

## 📦 Artifact Names

### Android
- Develop APK: `android-apk-develop`
- Production APK: `android-apk-production`
- Develop AAB: `android-aab-develop`
- Production AAB: `android-aab-production`

### iOS
- Develop Archive: `ios-archive-develop`
- Production Archive: `ios-archive-production`

## ✅ Benefits

1. **Separate Testing:** Develop builds can be installed alongside release builds
2. **Different Configurations:** Each flavor can have different API endpoints, feature flags, etc.
3. **Clear Separation:** Easy to distinguish between dev and production builds
4. **Automated Selection:** CI/CD automatically selects the right flavor based on branch

## 🔄 Switching Between Flavors Locally

### Android

```bash
# List all available variants
cd android
./gradlew tasks --all | grep assemble

# Build specific variant
./gradlew assembleDevelopRelease
./gradlew assembleProductionRelease
```

### iOS

Open Xcode and:
1. Select scheme: **JackMarvelsApp**
2. Edit scheme → Run → Build Configuration
3. Choose: **Debug** (for develop) or **Release** (for release)
4. Or use command line with `-configuration` flag

## 📝 Notes

- **Develop builds** use debug signing (not for distribution)
- **Production builds** should use production signing (configure in `build.gradle`)
- Both flavors can be installed simultaneously on the same device (different package names)
- Update API endpoints or feature flags per flavor if needed

## 🐛 Troubleshooting

### Android: "Variant not found"
- Ensure you're using the correct variant name: `developRelease` or `productionRelease`
- Check that flavors are properly configured in `build.gradle`

### iOS: "Bundle identifier conflict"
- Ensure you've created separate App IDs in Apple Developer Portal:
  - `com.jackmarvelsapp.dev`
  - `com.jackmarvelsapp`
- Create separate provisioning profiles for each

### CI/CD: Wrong flavor selected
- Check the branch name (develop vs main)
- Use manual workflow dispatch to override

---

**Need help?** Check the workflow logs in GitHub Actions for detailed build information.

