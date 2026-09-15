# Hosted legal pages for store submission

Static pages in this folder are ready to publish on your website. After hosting, update the URLs in:

- `src/constants/legal.ts` → `LEGAL_URLS`
- Google Play Console → Privacy policy URL, Delete account URL
- App Store Connect → Privacy Policy and Terms URLs

## Recommended URLs

| Page | Suggested path | File |
|------|----------------|------|
| Delete account | `https://alphavlogs.com/delete-account` | `delete-account.html` |
| Privacy policy | `https://alphavlogs.com/privacy-policy` | `privacy-policy.html` |
| Terms of service | `https://alphavlogs.com/terms` | `terms.html` |
| Terms of Use (EULA) | `https://www.apple.com/legal/internet-services/itunes/dev/stdeula/` | Apple standard EULA (required in App Description) |

## How to publish

1. Upload `delete-account.html` to your web host (e.g. S3, Netlify, WordPress, or your company site).
2. Ensure the page is publicly accessible without login.
3. Enter the live URL in Play Console **Data safety → Delete account URL**.
4. Re-run store submission checklists in `docs/PLAY_STORE_AND_APP_STORE_PUBLISHING.md`.

## App Store Connect (Apple 3.1.2)

For auto-renewable subscriptions, add **both**:

1. **Privacy Policy** field: `https://alphavlogs.com/privacy-policy`
2. **App Description** (or custom EULA field) must include a working Terms of Use link:

`https://www.apple.com/legal/internet-services/itunes/dev/stdeula/`

Suggested App Description sentence:

> Annual Premium is auto-renewable (1 year). The price is shown in the app before purchase. Terms of Use (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/ Privacy Policy: https://alphavlogs.com/privacy-policy


- Contact emails use `support@alphavlogs.com` and `privacy@alphavlogs.com` from the app.
- Developer name **NSNR Technologies** matches `src/constants/legal.ts`.
- The in-app delete flow remains under **Profile → Delete Account**.
