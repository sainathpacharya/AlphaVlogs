/**
 * Local backend overrides (not committed).
 *
 * 1. Copy this file to `api-config.local.ts` (gitignored).
 * 2. Set your machine's LAN IP and USE_PRODUCTION_API: false.
 * 3. Rebuild the app.
 */
export const API_CONFIG_LOCAL = {
  USE_PRODUCTION_API: false,
  DEV: {
    // ipconfig getifaddr en0  (macOS) or your backend machine's LAN IP
    LAN_HOST: '192.168.x.x',
    USE_LOCAL_BACKEND: false,
    PORT: 8080,
  },
};
