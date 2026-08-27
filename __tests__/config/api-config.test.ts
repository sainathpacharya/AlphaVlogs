const mockIsEmulatorSync = jest.fn(() => false);

jest.mock('react-native-device-info', () => ({
  isEmulatorSync: () => mockIsEmulatorSync(),
}));

jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn((obj: { ios?: unknown; android?: unknown; default?: unknown }) => obj.ios),
}));

describe('api-config', () => {
  const originalDev = (global as { __DEV__?: boolean }).__DEV__;

  const loadApiConfig = () => require('../../src/config/api-config');

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockIsEmulatorSync.mockReturnValue(false);
    (global as { __DEV__?: boolean }).__DEV__ = true;
  });

  afterEach(() => {
    (global as { __DEV__?: boolean }).__DEV__ = originalDev;
    jest.resetModules();
  });

  it('exports default API configuration', () => {
    const { API_CONFIG } = loadApiConfig();

    expect(API_CONFIG.MODE).toBe('real');
    expect(API_CONFIG.USE_PRODUCTION_API).toBe(true);
    expect(API_CONFIG.REAL.BASE_URL).toBe('https://api.alphavlogs.com');
    expect(API_CONFIG.DEV.LOG_API_CALLS).toBe(true);
    expect(API_CONFIG.FEATURES.ENABLE_CACHING).toBe(true);
  });

  it('returns production URL by default', () => {
    const { getApiBaseUrl } = loadApiConfig();
    expect(getApiBaseUrl()).toBe('https://api.alphavlogs.com');
  });

  it('returns mock URL and timeout in mock mode', () => {
    const apiConfig = loadApiConfig();
    const originalMode = apiConfig.API_CONFIG.MODE;
    apiConfig.API_CONFIG.MODE = 'mock';

    expect(apiConfig.isMockMode()).toBe(true);
    expect(apiConfig.getApiBaseUrl()).toBe('mock://api');
    expect(apiConfig.getApiTimeout()).toBe(apiConfig.API_CONFIG.MOCK.DEFAULT_DELAY);

    apiConfig.API_CONFIG.MODE = originalMode;
  });

  it('uses LAN host for dev API when production API is disabled', () => {
    const apiConfig = loadApiConfig();
    apiConfig.API_CONFIG.USE_PRODUCTION_API = false;
    apiConfig.API_CONFIG.DEV.LAN_HOST = '192.168.1.10';
    apiConfig.API_CONFIG.DEV.PORT = 9090;
    apiConfig.API_CONFIG.DEV.USE_LOCAL_BACKEND = false;

    expect(apiConfig.getApiBaseUrl()).toBe('http://192.168.1.10:9090');
  });

  it('uses emulator loopback aliases when local backend is enabled', () => {
    const configureDevBackend = () => {
      const apiConfig = loadApiConfig();
      apiConfig.API_CONFIG.USE_PRODUCTION_API = false;
      apiConfig.API_CONFIG.DEV.LAN_HOST = '192.168.1.10';
      apiConfig.API_CONFIG.DEV.PORT = 8080;
      apiConfig.API_CONFIG.DEV.USE_LOCAL_BACKEND = true;
      return apiConfig;
    };

    const iosPlatform = require('react-native').Platform;
    iosPlatform.OS = 'ios';
    iosPlatform.select.mockImplementation((obj: { ios?: unknown }) => obj.ios);
    mockIsEmulatorSync.mockReturnValue(true);
    expect(configureDevBackend().getDevApiBaseUrl()).toBe('http://localhost:8080');

    jest.resetModules();
    const androidPlatform = require('react-native').Platform;
    androidPlatform.OS = 'android';
    androidPlatform.select.mockImplementation((obj: { android?: unknown }) => obj.android);
    mockIsEmulatorSync.mockReturnValue(true);
    expect(configureDevBackend().getDevApiBaseUrl()).toBe('http://10.0.2.2:8080');

    jest.resetModules();
    const physicalAndroidPlatform = require('react-native').Platform;
    physicalAndroidPlatform.OS = 'android';
    physicalAndroidPlatform.select.mockImplementation((obj: { android?: unknown }) => obj.android);
    mockIsEmulatorSync.mockReturnValue(false);
    expect(configureDevBackend().getDevApiBaseUrl()).toBe('http://192.168.1.10:8080');
  });

  it('reports feature flags and dev feature flags', () => {
    const {
      isFeatureEnabled,
      isDevFeatureEnabled,
      API_CONFIG,
    } = loadApiConfig();

    expect(isFeatureEnabled('ENABLE_OFFLINE_MODE')).toBe(true);
    expect(isDevFeatureEnabled('LOG_API_CALLS')).toBe(API_CONFIG.DEV.LOG_API_CALLS);
    expect(isDevFeatureEnabled('MOCK_ERROR_RATE')).toBe(API_CONFIG.DEV.MOCK_ERROR_RATE);
  });

  it('returns real API timeout outside mock mode', () => {
    const { getApiTimeout, API_CONFIG } = loadApiConfig();
    expect(getApiTimeout()).toBe(API_CONFIG.REAL.TIMEOUT);
  });

  it('merges dev overrides at runtime', () => {
    const { API_CONFIG } = loadApiConfig();
    API_CONFIG.DEV.LOG_API_CALLS = false;
    expect(API_CONFIG.DEV.LOG_API_CALLS).toBe(false);
  });

  it('loads optional local overrides when api-config.local is present', () => {
    jest.resetModules();

    const factory = () => ({
      API_CONFIG_LOCAL: {
        USE_PRODUCTION_API: false,
        DEV: { LAN_HOST: '10.0.0.8', PORT: 3001, USE_LOCAL_BACKEND: false },
      },
    });

    // File is gitignored — exists locally, missing on CI.
    let localModuleExists = false;
    try {
      require.resolve('../../src/config/api-config.local');
      localModuleExists = true;
    } catch {
      localModuleExists = false;
    }

    if (localModuleExists) {
      jest.doMock('../../src/config/api-config.local', factory);
    } else {
      jest.doMock('../../src/config/api-config.local', factory, {virtual: true});
    }

    const {API_CONFIG, getApiBaseUrl} = require('../../src/config/api-config');
    expect(API_CONFIG.USE_PRODUCTION_API).toBe(false);
    expect(getApiBaseUrl()).toBe('http://10.0.0.8:3001');
  });
});
