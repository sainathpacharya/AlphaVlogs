import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

type ApiConfigLocal = {
  USE_PRODUCTION_API?: boolean;
  DEV?: Partial<typeof DEFAULT_API_CONFIG.DEV>;
};

/** Optional local overrides — copy from api-config.local.example.ts (gitignored). */
function loadLocalOverrides(): ApiConfigLocal {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const local = require('./api-config.local') as {
      API_CONFIG_LOCAL?: ApiConfigLocal;
    };
    return local.API_CONFIG_LOCAL ?? {};
  } catch {
    return {};
  }
}

const DEFAULT_API_CONFIG = {
  // Set to 'mock' to use static data (no API calls), 'real' to use actual backend
  MODE: 'real' as 'mock' | 'real',

  // Mock API settings
  MOCK: {
    ENABLE_DELAY: true,
    DEFAULT_DELAY: 500, // milliseconds
    UPLOAD_DELAY: 2000, // milliseconds
    PAYMENT_DELAY: 1500, // milliseconds
  },

  // Committed default: production API. Override in api-config.local.ts for LAN backend.
  USE_PRODUCTION_API: true,

  // Real API settings (production)
  REAL: {
    BASE_URL: 'https://api.alphavlogs.com',
    TIMEOUT: 30000, // milliseconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // milliseconds
  },

  // Used only when USE_PRODUCTION_API is false in a __DEV__ build (see api-config.local.example.ts).
  DEV: {
    LAN_HOST: 'localhost',
    USE_LOCAL_BACKEND: false,
    PORT: 8080,
    /** API + service console groups in Metro (dev builds only). */
    LOG_API_CALLS: true,
    LOG_MOCK_DATA: true,
    /** JS console.log/warn enabled in __DEV__; stripped in release via dev-logging.ts */
    ENABLE_CONSOLE_LOGS: true,
    ENABLE_MOCK_ERRORS: false,
    MOCK_ERROR_RATE: 0.1,
  },

  // Feature flags
  FEATURES: {
    ENABLE_CACHING: true,
    ENABLE_OFFLINE_MODE: true,
    ENABLE_PUSH_NOTIFICATIONS: true,
    ENABLE_BIOMETRIC_AUTH: true,
  },
};

const LOCAL_OVERRIDES = loadLocalOverrides();

// API Configuration
export const API_CONFIG = {
  ...DEFAULT_API_CONFIG,
  USE_PRODUCTION_API:
    LOCAL_OVERRIDES.USE_PRODUCTION_API ?? DEFAULT_API_CONFIG.USE_PRODUCTION_API,
  DEV: {
    ...DEFAULT_API_CONFIG.DEV,
    ...LOCAL_OVERRIDES.DEV,
  },
};

/** Dev base URL — LAN_HOST for remote backend; loopback aliases when USE_LOCAL_BACKEND. */
export const getDevApiBaseUrl = (): string => {
  const { LAN_HOST, PORT, USE_LOCAL_BACKEND } = API_CONFIG.DEV;
  const origin = (host: string) => `http://${host}:${PORT}`;

  if (!USE_LOCAL_BACKEND) {
    return origin(LAN_HOST);
  }

  if (Platform.OS === 'android') {
    return DeviceInfo.isEmulatorSync() ? origin('10.0.2.2') : origin(LAN_HOST);
  }

  return DeviceInfo.isEmulatorSync() ? origin('localhost') : origin(LAN_HOST);
};

export const isMockMode = () => __DEV__ && API_CONFIG.MODE === 'mock';

export const getApiBaseUrl = (): string => {
  if (isMockMode()) {
    return 'mock://api';
  }
  if (__DEV__ && !API_CONFIG.USE_PRODUCTION_API) {
    return getDevApiBaseUrl();
  }
  return API_CONFIG.REAL.BASE_URL;
};

export const getApiTimeout = () => {
  if (isMockMode()) {
    return API_CONFIG.MOCK.DEFAULT_DELAY;
  }
  return API_CONFIG.REAL.TIMEOUT;
};

export const isFeatureEnabled = (feature: keyof typeof API_CONFIG.FEATURES) => {
  return API_CONFIG.FEATURES[feature];
};

export const isDevFeatureEnabled = (feature: keyof typeof API_CONFIG.DEV) => {
  const {
    LOG_API_CALLS,
    LOG_MOCK_DATA,
    ENABLE_MOCK_ERRORS,
    MOCK_ERROR_RATE,
    ENABLE_CONSOLE_LOGS,
  } = API_CONFIG.DEV;
  const flags = {
    LOG_API_CALLS,
    LOG_MOCK_DATA,
    ENABLE_MOCK_ERRORS,
    MOCK_ERROR_RATE,
    ENABLE_CONSOLE_LOGS,
  };
  return flags[feature as keyof typeof flags];
};
