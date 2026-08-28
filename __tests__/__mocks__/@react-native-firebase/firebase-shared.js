const createFirebaseInstance = () => ({
  logScreenView: jest.fn().mockResolvedValue(undefined),
  setAnalyticsCollectionEnabled: jest.fn().mockResolvedValue(undefined),
  setUserId: jest.fn().mockResolvedValue(undefined),
  logEvent: jest.fn().mockResolvedValue(undefined),
  setAttribute: jest.fn().mockResolvedValue(undefined),
  setCrashlyticsCollectionEnabled: jest.fn().mockResolvedValue(undefined),
  recordError: jest.fn().mockResolvedValue(undefined),
  log: jest.fn(),
});

const firebaseInstance = createFirebaseInstance();

const getApp = jest.fn(() => ({
  analytics: jest.fn(() => firebaseInstance),
  crashlytics: jest.fn(() => firebaseInstance),
}));

const namespaced = jest.fn(() => firebaseInstance);

module.exports = {
  firebaseInstance,
  getApp,
  namespaced,
};
