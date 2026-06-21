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
  USE_PRODUCTION_API: false,

  // Real API settings (production)
  REAL: {
    BASE_URL: 'https://api.alphavlogs.com',
    TIMEOUT: 30000, // milliseconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // milliseconds
  },

  // LAN IP of the machine running the backend (Spring Boot default port 8080).
  // Set LAN_HOST to that machine's IP — not your dev Mac, and not 10.0.2.2.
  DEV: {
    LAN_HOST: '192.168.29.192', // 192.168.1.9 | 192.168.29.192
    // true only when Spring Boot runs on the same machine as the emulator/simulator
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
