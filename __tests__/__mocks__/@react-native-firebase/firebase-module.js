const createFirebaseModuleMock = () => {
  const instance = {
    logScreenView: jest.fn().mockResolvedValue(undefined),
    setAnalyticsCollectionEnabled: jest.fn().mockResolvedValue(undefined),
    setUserId: jest.fn().mockResolvedValue(undefined),
    logEvent: jest.fn().mockResolvedValue(undefined),
    setAttribute: jest.fn().mockResolvedValue(undefined),
    setCrashlyticsCollectionEnabled: jest.fn().mockResolvedValue(undefined),
    recordError: jest.fn().mockResolvedValue(undefined),
    log: jest.fn(),
  };

  return jest.fn(() => instance);
};

module.exports = createFirebaseModuleMock();
