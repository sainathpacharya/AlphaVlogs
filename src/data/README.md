# Static data (no API mode)

When `API_CONFIG.MODE === 'mock'` in `src/config/api-config.ts`, the app uses this static data and **does not call any backend APIs**.

## Files

| File | Used for |
|------|----------|
| `auth.json` | OTP flow: valid mobiles, OTP value, token shape (reference for mock-auth). |
| `users.json` | Login/registration: static users (e.g. 9876543210 → user_001, 8765432109 → user_002). |
| `events.json` | Dashboard & events: all 15 event categories (titles match dashboard Lottie keys). |
| `subscription.json` | Subscription screen: sample active subscription for `user_001`. |
| `schools.json` | Registration: school list and “Other” option. |

## Login / OTP (static)

- **Send OTP:** Any 10-digit mobile is accepted; no SMS is sent.
- **Verify OTP:** Use mobile **9876543210** or **8765432109** with OTP **123456** to log in.
  - 9876543210 → student (user_001)
  - 8765432109 → influencer (user_002)
- **Register:** New users are created in-memory by the mock (see `mock-auth.ts` / `mock-data-store.ts`).

## Switching back to real API

Committed config uses production (`https://api.alphavlogs.com`). For a local backend, copy `src/config/api-config.local.example.ts` to `api-config.local.ts`, set `USE_PRODUCTION_API: false`, and set `DEV.LAN_HOST` to your Mac’s LAN IP (`ipconfig getifaddr en0`). Dev URLs:

| Client | Base URL |
|--------|----------|
| Physical device (same Wi‑Fi) | `http://<LAN_HOST>:8080` |
| Android emulator | `http://10.0.2.2:8080` |
| iOS simulator | `http://localhost:8080` |

Then rebuild. All services will use the real backend again.

## Events (real API)

- **Endpoint:** `GET /api/students/events`
- **Auth:** `Authorization: Bearer <accessToken>` (set automatically after OTP login)
- **Used by:** Dashboard home screen event grid
- **GIFs:** Each event may include `eventGif` (e.g. `/assets/gifs/singing.gif`). Loaded via `react-native-fast-image` from `{apiBaseUrl}{eventGif}` with **disk cache** (not re-downloaded every visit).
- **Events cache:** After the first successful `GET /api/students/events`, the list is stored in AsyncStorage for 7 days (same API base URL). Dashboard uses cache on later opens; pass `forceRefresh: true` to refetch.
