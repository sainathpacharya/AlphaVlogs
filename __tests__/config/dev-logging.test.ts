jest.mock('react-native', () => ({
  LogBox: {
    ignoreLogs: jest.fn(),
    ignoreAllLogs: jest.fn(),
  },
}));

jest.mock('@/utils/dev-log', () => ({
  devLog: jest.fn(),
}));

describe('dev-logging config', () => {
  const originalDev = (global as { __DEV__?: boolean }).__DEV__;
  const originalConsole = { ...console };

  afterEach(() => {
    (global as { __DEV__?: boolean }).__DEV__ = originalDev;
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.debug = originalConsole.debug;
    console.warn = originalConsole.warn;
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('configures LogBox and dev logging in development', () => {
    (global as { __DEV__?: boolean }).__DEV__ = true;
    jest.isolateModules(() => {
      const { LogBox } = require('react-native');
      const { configureDevLogging } = require('../../src/config/dev-logging');
      const { devLog } = require('@/utils/dev-log');

      configureDevLogging();

      expect(LogBox.ignoreLogs).toHaveBeenCalledWith([]);
      expect(devLog).toHaveBeenCalledWith(
        expect.stringContaining('Dev logging enabled'),
      );
    });
  });

  it('silences console methods and ignores all logs in production', () => {
    (global as { __DEV__?: boolean }).__DEV__ = false;
    jest.isolateModules(() => {
      const { LogBox } = require('react-native');
      const { configureDevLogging } = require('../../src/config/dev-logging');

      configureDevLogging();

      expect(LogBox.ignoreAllLogs).toHaveBeenCalledWith(true);
      expect(console.log()).toBeUndefined();
      expect(console.info()).toBeUndefined();
      expect(console.debug()).toBeUndefined();
      expect(console.warn()).toBeUndefined();
    });
  });
});
