# SSL public key pinning

Production HTTPS for `api.alphavlogs.com` uses [react-native-ssl-public-key-pinning](https://github.com/frw/react-native-ssl-public-key-pinning) (OkHttp on Android, TrustKit on iOS).

## When it runs

| Build | Pinning |
|-------|---------|
| `__DEV__` (Metro debug) | **Off** — local `http://` backend works |
| Release / production | **On** (unless `API_CONFIG.MODE === 'mock'`) |

Config: `src/config/ssl-pinning.ts`.

## Regenerate pins after cert change

Leaf pin (primary):

```sh
echo | openssl s_client -servername api.alphavlogs.com -connect api.alphavlogs.com:443 2>/dev/null \
  | openssl x509 -pubkey -noout \
  | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary \
  | openssl enc -base64
```

Update `SSL_PUBLIC_KEY_HASHES` in `src/config/ssl-pinning.ts`. **Keep at least two hashes** (iOS requirement). Add a backup leaf pin before rotation when possible.

Also update `EXPIRATION_DATE` if you extend server cert validity.

## Verify pinning

1. Temporarily set a wrong hash in `SSL_PUBLIC_KEY_HASHES`.
2. Build a **release** app and call `https://api.alphavlogs.com` — request should fail.
3. Restore correct hashes and confirm requests succeed.

## Not covered

- `http://` dev LAN URLs
- Native SDKs with their own HTTP (e.g. Razorpay)
- WebView loads (separate stack)

## Rebuild required

After changing pins or installing the library:

```sh
cd ios && pod install && cd ..
yarn android   # or yarn ios
```
