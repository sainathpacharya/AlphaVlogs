# How to Get SHA-1 Key for Android App

SHA-1 (and SHA-256) keys are required for:

- Google Play App Signing
- Firebase Authentication (Google Sign-In)
- Google Maps API
- Other Google Services

## 🔑 Quick Method: Get SHA-1 from Debug Keystore

### For Debug Build (Development)

Run this command in your terminal:

```bash
cd android
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Default debug keystore password:** `android`

You'll see output like:

```
Certificate fingerprints:
     SHA1: AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD
     SHA256: 11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00
```

Copy the **SHA1** value (the one with colons).

---

## 🔐 For Release Build (Production)

### If you have a release keystore:

```bash
cd android
keytool -list -v -keystore app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Or if you have a custom release keystore:

```bash
keytool -list -v -keystore /path/to/your/release.keystore -alias your-key-alias
```

You'll be prompted for the keystore password and key password.

---

## 📱 Alternative: Get SHA-1 from Running App

### Method 1: Using Gradle (Recommended)

Add this to your `android/app/build.gradle`:

```gradle
android {
    // ... existing code ...

    signingConfigs {
        debug {
            // ... existing debug config ...
        }
        release {
            // ... existing release config ...
        }
    }

    // Add this task to print SHA-1
    task printSHA1 {
        doLast {
            def keystoreFile = file('debug.keystore')
            if (keystoreFile.exists()) {
                def stdout = new ByteArrayOutputStream()
                exec {
                    commandLine 'keytool', '-list', '-v', '-keystore', keystoreFile.absolutePath,
                            '-alias', 'androiddebugkey', '-storepass', 'android', '-keypass', 'android'
                    standardOutput = stdout
                }
                def output = stdout.toString()
                def sha1Matcher = output =~ /SHA1:\s+([A-F0-9:]+)/
                if (sha1Matcher.find()) {
                    println "SHA-1: ${sha1Matcher.group(1)}"
                }
            } else {
                // Try default debug keystore
                def stdout = new ByteArrayOutputStream()
                exec {
                    commandLine 'keytool', '-list', '-v', '-keystore',
                            "${System.getProperty('user.home')}/.android/debug.keystore",
                            '-alias', 'androiddebugkey', '-storepass', 'android', '-keypass', 'android'
                    standardOutput = stdout
                }
                def output = stdout.toString()
                def sha1Matcher = output =~ /SHA1:\s+([A-F0-9:]+)/
                if (sha1Matcher.find()) {
                    println "SHA-1: ${sha1Matcher.group(1)}"
                }
            }
        }
    }
}
```

Then run:

```bash
cd android
./gradlew printSHA1
```

### Method 2: Using React Native CLI

```bash
cd android
./gradlew signingReport
```

This will show SHA-1 and SHA-256 for all signing configs.

---

## 🚀 Quick Script: Get All SHA Keys

Create a file `get-sha-keys.sh` in your project root:

```bash
#!/bin/bash

echo "🔑 Getting SHA-1 and SHA-256 keys..."
echo ""

# Debug keystore (default location)
echo "📱 Debug Keystore SHA-1:"
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android 2>/dev/null | grep -A 1 "SHA1:" | head -2

echo ""
echo "📱 Debug Keystore SHA-256:"
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android 2>/dev/null | grep -A 1 "SHA256:" | head -2

# Check if app has custom debug keystore
if [ -f "android/app/debug.keystore" ]; then
    echo ""
    echo "📱 App Debug Keystore SHA-1:"
    keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android 2>/dev/null | grep -A 1 "SHA1:" | head -2

    echo ""
    echo "📱 App Debug Keystore SHA-256:"
    keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android 2>/dev/null | grep -A 1 "SHA256:" | head -2
fi

echo ""
echo "✅ Done!"
```

Make it executable and run:

```bash
chmod +x get-sha-keys.sh
./get-sha-keys.sh
```

---

## 📋 Where to Use SHA-1 Key

### 1. Google Play Console (App Signing)

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Go to **Release** → **Setup** → **App signing**
4. Upload your SHA-1 key if required

### 2. Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Your apps**
4. Click on your Android app
5. Click **Add fingerprint**
6. Paste your SHA-1 key

### 3. Google Cloud Console (for APIs)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Edit your OAuth 2.0 Client ID
5. Add SHA-1 to **SHA certificate fingerprints**

---

## 🔍 Get SHA-1 from Your Current Setup

Based on your project, here's the command for your debug keystore:

```bash
# Your app uses debug.keystore in android/app/
cd android
keytool -list -v -keystore app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Or if using default Android debug keystore:

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

---

## 📝 Format

SHA-1 keys look like this:

```
AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD
```

**Important:**

- Keep the colons (`:`) when copying
- It's 20 bytes represented as 40 hex characters with colons
- You need both SHA-1 and SHA-256 for some services

---

## 🛠️ Troubleshooting

### Error: "keystore file not found"

- The debug keystore is created automatically when you first build
- Run `yarn android` once to create it
- Or use the default location: `~/.android/debug.keystore`

### Error: "alias not found"

- For debug: use alias `androiddebugkey`
- For release: use your custom alias (check `build.gradle`)

### Need SHA-1 for Release Build

- You'll need your release keystore file
- Use the same command but with your release keystore path and password

---

## ✅ Quick Command Reference

```bash
# Debug SHA-1 (most common)
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1

# Debug SHA-256
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA256

# Using Gradle (shows all)
cd android && ./gradlew signingReport
```

---

**Need help?** Run the command and share the output if you encounter any issues!
