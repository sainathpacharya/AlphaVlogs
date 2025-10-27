// API Configuration
export const API_CONFIG = {
  // Set to 'mock' to use mock data, 'real' to use actual backend
  MODE: 'real' as 'mock' | 'real',
  
  // Mock API settings
  MOCK: {
    ENABLE_DELAY: true,
    DEFAULT_DELAY: 500, // milliseconds
    UPLOAD_DELAY: 2000, // milliseconds
    PAYMENT_DELAY: 1500, // milliseconds
  },
  
  // Real API settings
  REAL: {
    BASE_URL: 'https://api.jackmarvels.com',
    TIMEOUT: 30000, // milliseconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // milliseconds
  },
  
  // Feature flags
  FEATURES: {
    ENABLE_CACHING: true,
    ENABLE_OFFLINE_MODE: true,
    ENABLE_PUSH_NOTIFICATIONS: true,
    ENABLE_BIOMETRIC_AUTH: true,
  },
  
  // Development settings
  DEV: {
    LOG_API_CALLS: true,
    LOG_MOCK_DATA: true,
    ENABLE_MOCK_ERRORS: false, // Simulate network errors
    MOCK_ERROR_RATE: 0.1, // 10% chance of error
  }
};

// Helper function to check if mock mode is enabled
export const isMockMode = () => API_CONFIG.MODE === 'mock';

// Helper function to get API base URL
export const getApiBaseUrl = () => {
  if (isMockMode()) {
    return 'mock://api';
  }
  return API_CONFIG.REAL.BASE_URL;
};

// Helper function to get timeout value
export const getApiTimeout = () => {
  if (isMockMode()) {
    return API_CONFIG.MOCK.DEFAULT_DELAY;
  }
  return API_CONFIG.REAL.TIMEOUT;
};

// Helper function to check if feature is enabled
export const isFeatureEnabled = (feature: keyof typeof API_CONFIG.FEATURES) => {
  return API_CONFIG.FEATURES[feature];
};

// Helper function to check if development features are enabled
export const isDevFeatureEnabled = (feature: keyof typeof API_CONFIG.DEV) => {
  return API_CONFIG.DEV[feature];
};
