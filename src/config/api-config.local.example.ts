/**
 * Local backend overrides (not committed).
 *
 * Setup:
 *   cp src/config/api-config.local.example.ts src/config/api-config.local.ts
 *
 * When to use:
 *   - Point at a LAN backend instead of production API
 *   - Enable extra dev logging in Metro
 *
 * After changes: rebuild the app (yarn android / yarn ios).
 */
export const API_CONFIG_LOCAL = {
  /** false = use DEV.LAN_HOST; true = use https://api.alphavlogs.com (default) */
  USE_PRODUCTION_API: false,

  DEV: {
    /** Your machine's LAN IP — macOS: ipconfig getifaddr en0 */
    LAN_HOST: '192.168.x.x',

    /** true = localhost/10.0.2.2 emulator alias; false = LAN_HOST for remote backend */
    USE_LOCAL_BACKEND: false,

    /** Backend port when USE_PRODUCTION_API is false */
    PORT: 8080,

    /** Stream API request/response groups to Metro terminal */
    LOG_API_CALLS: true,

    /** Log mock service calls when MODE is 'mock' */
    LOG_MOCK_DATA: true,

    /** Keep console.log / warn active in __DEV__ */
    ENABLE_CONSOLE_LOGS: true,
  },
};
