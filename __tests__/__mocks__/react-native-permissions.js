module.exports = {
  PERMISSIONS: { ANDROID: {}, IOS: {} },
  RESULTS: {
    UNAVAILABLE: 'unavailable',
    DENIED: 'denied',
    GRANTED: 'granted',
    BLOCKED: 'blocked',
  },
  check: jest.fn(async () => 'granted'),
  request: jest.fn(async () => 'granted'),
  checkNotifications: jest.fn(async () => ({ status: 'granted' })),
  requestNotifications: jest.fn(async () => ({ status: 'granted' })),
};
