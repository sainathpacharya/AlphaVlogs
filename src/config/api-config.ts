import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

// API Configuration
export const API_CONFIG = {
  // Set to 'mock' to use static data (no API calls), 'real' to use actual backend
  MODE: 'real' as 'mock' | 'real',

  // Mock API settings
  MOCK: {
    ENABLE_DELAY: true,
    DEFAULT_DELAY: 500, // milliseconds
    UPLOAD_DELAY: 2000, // milliseconds
    PAYMENT_DELAY: 1500, // milliseconds
  },

  // Set to true to use REAL.BASE_URL even in __DEV__ builds (local LAN otherwise).
  USE_PRODUCTION_API: true,

  // Real API settings (production)
  REAL: {
    BASE_URL: 'https://api.alphavlogs.com',
    TIMEOUT: 30000, // milliseconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // milliseconds
  },

  // Local backend (Spring Boot default port 8080). Update LAN_HOST when your Mac IP changes.
  DEV: {
    LAN_HOST: '192.168.29.26',
    PORT: 8080,
    LOG_API_CALLS: true,
    LOG_MOCK_DATA: true,
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

/** Dev base URL by client: emulator/simulator vs physical device on same Wi‑Fi. */
export const getDevApiBaseUrl = (): string => {
  const { LAN_HOST, PORT } = API_CONFIG.DEV;
  const origin = (host: string) => `http://${host}:${PORT}`;

  if (Platform.OS === 'android') {
    return DeviceInfo.isEmulatorSync() ? origin('10.0.2.2') : origin(LAN_HOST);
  }

  return DeviceInfo.isEmulatorSync() ? origin('localhost') : origin(LAN_HOST);
};

export const isMockMode = () => API_CONFIG.MODE === 'mock';

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
  const { LOG_API_CALLS, LOG_MOCK_DATA, ENABLE_MOCK_ERRORS, MOCK_ERROR_RATE } =
    API_CONFIG.DEV;
  const flags = { LOG_API_CALLS, LOG_MOCK_DATA, ENABLE_MOCK_ERRORS, MOCK_ERROR_RATE };
  return flags[feature as keyof typeof flags];
};
