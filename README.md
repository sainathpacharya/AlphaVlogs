# AlphaVlogs

React Native talent-show app for kids (React Native 0.77, TypeScript, Gluestack UI).

## New developer? Start here

**→ [docs/DEVELOPER_SETUP.md](docs/DEVELOPER_SETUP.md)** — complete clone-to-run guide, configuration matrix, secrets policy, iOS/Android requirements, and troubleshooting.

Another developer should be able to:

**Clone → follow DEVELOPER_SETUP.md → install dependencies → run on Android/iOS**

No root `.env` file is used. Optional local API overrides: copy `src/config/api-config.local.example.ts` → `api-config.local.ts`.

## Quick start

```bash
git clone https://github.com/sainathpacharya/AlphaVlogs.git
cd AlphaVlogs
yarn install          # Node >= 20; runs pod install on macOS
yarn start            # Metro
yarn android          # developDebug (com.nsnr.alphavlogs.dev)
yarn ios              # iOS simulator (macOS + Xcode)
```

Default API: `https://api.alphavlogs.com` (no extra config required).

## Scripts

| Command | Description |
|---------|-------------|
| `yarn start` | Metro bundler |
| `yarn android` | Run Android developDebug |
| `yarn ios` | Run iOS simulator |
| `yarn type-check` | TypeScript |
| `yarn test:ci` | Jest tests |
| `yarn lint` | ESLint |
| `yarn build:android:develop-release` | Dev release APK |
| `yarn build:android:production-release` | Production release APK |

## Project structure

```
src/
├── components/     # UI components
├── navigation/     # React Navigation stacks
├── screens/        # Screen components
├── services/       # API, Firebase, payments
├── stores/         # Zustand state
├── hooks/          # Custom hooks
├── config/         # API config (+ optional api-config.local.ts)
├── constants/      # App constants
└── types/          # TypeScript types
```

## Key technologies

- **State:** Zustand + React Query
- **Navigation:** React Navigation 6
- **UI:** Gluestack UI
- **Auth:** JWT + Keychain; OTP login
- **Firebase:** Analytics & Crashlytics (consent-gated)
- **Payments:** Razorpay (Android), Apple IAP (iOS)

## Documentation

| Doc | Purpose |
|-----|---------|
| [docs/DEVELOPER_SETUP.md](docs/DEVELOPER_SETUP.md) | **Primary setup guide** |
| [docs/GITHUB_ACTIONS_SETUP.md](docs/GITHUB_ACTIONS_SETUP.md) | CI/CD secrets |
| [docs/PLAY_STORE_AND_APP_STORE_PUBLISHING.md](docs/PLAY_STORE_AND_APP_STORE_PUBLISHING.md) | Store release |
| [docs/FIREBASE_CONSOLE_UPDATE.md](docs/FIREBASE_CONSOLE_UPDATE.md) | Firebase registration |
| [docs/SSL_PINNING.md](docs/SSL_PINNING.md) | SSL pinning |

## License

MIT
