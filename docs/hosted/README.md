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

## How to publish

1. Upload `delete-account.html` to your web host (e.g. S3, Netlify, WordPress, or your company site).
2. Ensure the page is publicly accessible without login.
3. Enter the live URL in Play Console **Data safety → Delete account URL**.
4. Re-run store submission checklists in `docs/PLAY_STORE_AND_APP_STORE_PUBLISHING.md`.

## Notes

- Contact emails use `support@alphavlogs.com` and `privacy@alphavlogs.com` from the app.
- Developer name **NSNR Technologies** matches `src/constants/legal.ts`.
- The in-app delete flow remains under **Profile → Delete Account**.
