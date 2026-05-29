# Android logcat summary (2026-02-23)

Summary of the main log messages and what to do about them.

---

## 1. **Invalid string value: $md** (actionable)

**Log:** `unknown:ReactNative  W  Invalid string value: $md`

**Cause:** A style token `$md` is being passed to a native view as a string. React Native expects **numbers** for props like `fontSize`, `letterSpacing`, and `borderRadius`. If the theme does not resolve `$md` before the style reaches the native layer, you get this warning.

**Fix options:**

- Use numeric values in critical screens where you see the warning, e.g. `fontSize={16}` and `borderRadius={6}` instead of `fontSize="$md"` and `borderRadius="$md"` (your `gluestack-ui.config` has `fontSizes.md: 16`, `borderRadii.md: 6`).
- Or ensure your GluestackUIProvider / style resolution runs so that token `$md` is always resolved to a number before styles are sent to native (check gluestack-style/react and that no style is passed to native without going through the resolver).

---

## 2. **No entry found for service: auth_tokens** (informational)

**Log:** `RNKeychainManager  E  No entry found for service: auth_tokens`

**Cause:** react-native-keychain looked for stored credentials under the service name `auth_tokens` and found nothing. This is normal on first launch or when the user is logged out.

**Action:** No change required unless you want to reduce log noise (e.g. treat “no entry” as debug only).

---

## 3. **Cannot connect to Metro / Websocket exception** (environment)

**Logs:**

- `Couldn't connect to "ws://10.0.2.2:8081/...", will silently retry`
- `Cannot connect to Metro. ... Error: Software caused connection abort`

**Cause:** The app (emulator/device) lost connection to the Metro bundler (e.g. Metro not running, machine sleep, or network blip). `10.0.2.2` is the emulator’s way to reach the host’s `localhost`.

**Fix:**

- Start Metro: `npx react-native start` (or `yarn start`).
- For emulator: ensure nothing is blocking `localhost:8081` on your machine.
- For physical device: use `adb reverse tcp:8081 tcp:8081` or set “Debug server host & port” to your machine’s IP (e.g. `192.168.x.x:8081`).

---

## 4. **Skipped N frames / Davey! / main thread overload** (performance)

**Logs:**

- `Choreographer  I  Skipped 134 frames!  The application may be doing too much work on its main thread.`
- `HWUI  I  Davey! duration=2406ms; ...`
- Many `EGL_emulation  D  app_time_stats: ...` with high frame times.

**Cause:** Frames are taking too long (main thread or GPU). Common on emulators (EGL_emulation, software GPU) and when:

- Too much JS or layout work on the main thread.
- Heavy views (e.g. WebView, many components, complex lists).
- Animations or Reanimated work blocking the UI.

**Suggestions:**

- Test on a real device; emulator frame times are often much worse.
- Reduce work on the main thread (move heavy logic off the JS thread, avoid large synchronous operations on interaction).
- Simplify heavy screens (lazy load, flatten lists, avoid unnecessary re-renders).
- Use Hermes and release builds to see real-world performance.

---

## 5. **Attempt to set local data for view with unknown tag: -1** (React Native internals)

**Log:** `Attempt to set local data for view with unknown tag: -1`

**Cause:** The native view manager is trying to update a view that has already been unmounted or whose tag is invalid. Often harmless and can occur during fast navigation or list recycling.

**Action:** Usually safe to ignore unless you see visible UI bugs; if so, check for conditional rendering or unmounting of views that still receive updates.

---

## 6. **StrongBox security storage is not available** (informational)

**Log:** `CipherStorageBase  W  StrongBox security storage is not available. ... No StrongBox available`

**Cause:** The device/emulator doesn’t have StrongBox-backed keystore. The library falls back to a non–StrongBox implementation.

**Action:** No change needed; keychain still works.

---

## 7. **Could not find generated setter for class ...** (React Native / Fabric)

**Log:** Many `Could not find generated setter for class com.facebook.react.views...` (and third-party view managers).

**Cause:** New Architecture (Fabric) codegen didn’t generate setters for some view manager props. React Native uses reflection as fallback.

**Action:** Generally safe to ignore; consider updating React Native and third-party native modules if you upgrade.

---

## Quick checklist

| Issue                      | Severity   | Action                                      |
|---------------------------|------------|---------------------------------------------|
| Invalid string value: $md | Fixable    | Use numbers or fix token resolution         |
| No entry auth_tokens      | Info       | None                                        |
| Cannot connect to Metro   | Environment| Start Metro / check host & port / adb reverse|
| Skipped frames / Davey!   | Performance| Optimize main thread; test on real device  |
| Unknown tag -1            | Low        | Ignore unless UI is wrong                   |
| StrongBox not available   | Info       | None                                        |
| Generated setter warnings | Low        | Ignore or update RN / libs                  |
