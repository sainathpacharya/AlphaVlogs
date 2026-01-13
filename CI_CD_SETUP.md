# CI/CD Pipeline Setup Guide

This document explains the CI/CD pipeline setup for the JackMarvelsApp React Native application.

## 📋 Overview

The CI/CD pipeline is configured using **GitHub Actions** and includes:

1. **Continuous Integration (CI)** - Runs on every PR and push
   - Linting (ESLint)
   - Type checking (TypeScript)
   - Unit tests with coverage (Jest)
   - Coverage threshold validation (85% minimum)

2. **Continuous Deployment (CD)** - Runs on main branch
   - Android APK/AAB builds
   - iOS Archive builds
   - Artifact storage

**⚠️ Important:** The current workflows **BUILD** the apps but do **NOT** automatically publish to App Store or Play Store. They create downloadable artifacts that you can manually upload, or you can add publishing steps (see below).

## 🗂️ Workflow Files

### 1. `.github/workflows/ci.yml`

**Purpose:** Runs on every PR and push to main/develop branches

- Lint and type check
- Run tests with coverage
- Upload coverage reports
- Validate coverage threshold (85%)

### 2. `.github/workflows/android-build.yml`

**Purpose:** Builds Android release artifacts

- Builds APK or AAB based on input
- Runs on main branch pushes or manual trigger
- Uploads artifacts for 30 days

### 3. `.github/workflows/ios-build.yml`

**Purpose:** Builds iOS release artifacts

- Builds iOS archive (.xcarchive)
- Runs on main branch pushes or manual trigger
- Uploads artifacts for 30 days

### 4. `.github/workflows/full-pipeline.yml`

**Purpose:** Complete pipeline that runs CI then builds both platforms

- Runs CI first, then builds if CI passes
- Only builds on main branch

## 🚀 Setup Requirements

### 1. GitHub Repository Setup

Ensure your repository is on GitHub and workflows are enabled:

```bash
# Check if .github/workflows directory exists
ls -la .github/workflows/
```

**Note:** The workflows will work immediately after pushing to GitHub. No additional configuration is required for basic CI/CD.

### 2. Required GitHub Secrets (Optional - For Production)

**Note:** All workflows work without secrets for development/testing builds. Secrets are only needed for production code signing and deployment.

For advanced features like code signing or deployment, you may need:

#### Android Code Signing (for production releases)

- `ANDROID_KEYSTORE_BASE64` - Base64 encoded keystore file
- `ANDROID_KEYSTORE_PASSWORD` - Keystore password
- `ANDROID_KEY_ALIAS` - Key alias
- `ANDROID_KEY_PASSWORD` - Key password

#### iOS Code Signing (for App Store releases)

- `APPLE_CERTIFICATE_BASE64` - Base64 encoded certificate
- `APPLE_CERTIFICATE_PASSWORD` - Certificate password
- `APPLE_PROVISIONING_PROFILE_BASE64` - Base64 encoded provisioning profile
- `APPLE_TEAM_ID` - Apple Team ID

#### Codecov (for coverage reporting)

- `CODECOV_TOKEN` - Codecov token (optional, public repos work without it)

#### Google Play Store Publishing (Optional)

- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` - Service account JSON key file content
- `GOOGLE_PLAY_PACKAGE_NAME` - Your app's package name (e.g., `com.jackmarvelsapp`)
- `GOOGLE_PLAY_TRACK` - Release track (internal, alpha, beta, production)

#### Apple App Store Publishing (Optional)

- `APPLE_APP_ID` - Your app's App Store Connect App ID
- `APPLE_ISSUER_ID` - App Store Connect API Issuer ID
- `APPLE_KEY_ID` - App Store Connect API Key ID
- `APPLE_PRIVATE_KEY` - App Store Connect API Private Key (base64 encoded)
- `APPLE_APPLE_ID` - Your Apple ID email (for App Store Connect)

### 3. Environment Variables

The pipeline uses the following environment variables (set in GitHub Actions or repository secrets):

- `NODE_VERSION` - Node.js version (default: 18)
- `JAVA_VERSION` - Java version for Android (default: 17)

## 📊 Coverage Requirements

The pipeline enforces a **minimum 85% test coverage** threshold. This is configured in:

- `jest.config.js` - Coverage thresholds
- `.github/workflows/ci.yml` - Coverage validation step

If coverage drops below 85%, the CI will fail with a warning.

## 🔧 Customization

### Modify Build Types

Edit `.github/workflows/android-build.yml` to change build configurations:

```yaml
- name: Build APK
  run: |
    cd android
    ./gradlew assembleRelease --no-daemon
```

### Add Store Publishing Steps

**Current Status:** The workflows only BUILD apps, they don't publish them automatically.

To add automatic publishing to stores, you have two options:

#### Option 1: Manual Upload (Current Setup)

- Download artifacts from GitHub Actions
- Manually upload to Play Store Console / App Store Connect
- ✅ More control, safer for production
- ✅ No store credentials needed in CI/CD

#### Option 2: Automatic Publishing (Requires Store Credentials)

**For Google Play Store:**

```yaml
- name: Deploy to Google Play
  uses: r0adkll/upload-google-play@v1
  with:
    serviceAccountJsonPlainText: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON }}
    packageName: ${{ secrets.GOOGLE_PLAY_PACKAGE_NAME }}
    releaseFiles: android/app/build/outputs/bundle/release/app-release.aab
    track: ${{ secrets.GOOGLE_PLAY_TRACK || 'internal' }}
```

**For Apple App Store:**

```yaml
- name: Deploy to App Store
  uses: apple-actions/upload-testflight-build@v1
  with:
    app-path: ios/build/JackMarvelsApp.ipa
    issuer-id: ${{ secrets.APPLE_ISSUER_ID }}
    api-key-id: ${{ secrets.APPLE_KEY_ID }}
    api-private-key: ${{ secrets.APPLE_PRIVATE_KEY }}
```

**⚠️ Security Note:** Store publishing requires sensitive credentials. Only add these if you understand the security implications and have proper secret management in place.

### Modify Test Commands

Update test commands in `package.json`:

```json
{
  "scripts": {
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

## 🧪 Testing the Pipeline

### Test CI Workflow

1. Create a feature branch:

   ```bash
   git checkout -b test/ci-pipeline
   ```

2. Make a small change and commit:

   ```bash
   git add .
   git commit -m "test: verify CI pipeline"
   ```

3. Push and create a PR:

   ```bash
   git push origin test/ci-pipeline
   ```

4. Check GitHub Actions tab to see the workflow running

### Test Build Workflow

1. Merge to main branch (or use workflow_dispatch)
2. Go to Actions tab → Select workflow → Run workflow
3. Monitor the build progress

## 📦 Artifact Management

### Downloading Artifacts

1. Go to the workflow run in GitHub Actions
2. Scroll to "Artifacts" section
3. Click on the artifact to download

### Artifact Retention

- Test results: 7 days
- Build artifacts: 30 days

To change retention, modify the `retention-days` parameter in workflow files.

## 🐛 Troubleshooting

### CI Fails on Coverage

If coverage is below 85%:

1. Check coverage report in artifacts
2. Identify files with low coverage
3. Add tests to increase coverage
4. Or temporarily adjust threshold in `jest.config.js`

### Android Build Fails

Common issues:

- **Gradle version mismatch**: Update `android/gradle/wrapper/gradle-wrapper.properties`
- **SDK not found**: Ensure Android SDK is properly set up in workflow
- **Memory issues**: Add `org.gradle.jvmargs=-Xmx2048m` to `gradle.properties`

### iOS Build Fails

Common issues:

- **CocoaPods issues**: Run `pod install` locally and commit `Podfile.lock`
- **Code signing**: Ensure proper certificates or disable signing for CI
- **Xcode version**: Update Xcode version in workflow if needed

### Workflow Not Running

1. Check if workflows are enabled in repository settings
2. Verify workflow files are in `.github/workflows/` directory
3. Check workflow syntax in Actions tab
4. Ensure branch protection rules allow workflows

## 📝 Best Practices

1. **Always run CI before merging**: Ensure all checks pass
2. **Keep coverage above threshold**: Add tests for new features
3. **Use feature branches**: Don't push directly to main
4. **Review build artifacts**: Verify builds before deployment
5. **Monitor workflow runs**: Check for failures regularly

## 🔗 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [React Native CI/CD Guide](https://reactnative.dev/docs/signed-apk-android)
- [Jest Coverage Documentation](https://jestjs.io/docs/configuration#coveragethreshold-object)

## 🚀 Store Publishing

To enable automatic publishing to Google Play Store and Apple App Store:

1. **Follow the detailed setup guide:** See `STORE_PUBLISHING_SETUP.md`
2. **Add required secrets** to GitHub repository
3. **Workflows are already configured** - they will automatically publish when secrets are added

The publishing workflows (`android-publish.yml` and `ios-publish.yml`) will:

- ✅ Build the apps
- ✅ Upload to stores automatically (when secrets are configured)
- ✅ Fall back to manual upload if secrets are missing

## 📞 Support

For issues or questions:

1. Check workflow logs in GitHub Actions
2. Review this documentation and `STORE_PUBLISHING_SETUP.md`
3. Check React Native and GitHub Actions documentation
4. Open an issue in the repository
