import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import {ErrorUtils} from 'react-native';
import {devLog} from '@/utils/dev-log';
import {
  initializeFirebaseMonitoring,
  logScreenView,
  recordError,
  setFirebaseUser,
  setupGlobalErrorHandler,
} from '../../src/services/firebase-service';

jest.mock('@/utils/dev-log', () => ({
  devLog: jest.fn(),
}));

describe('firebase-service', () => {
  const originalDev = (global as {__DEV__?: boolean}).__DEV__;

  beforeEach(() => {
    jest.clearAllMocks();
    (global as {__DEV__?: boolean}).__DEV__ = true;
  });

  afterEach(() => {
    (global as {__DEV__?: boolean}).__DEV__ = originalDev;
  });

  it('initializes analytics and crashlytics collection', async () => {
    await initializeFirebaseMonitoring();

    expect(crashlytics().setCrashlyticsCollectionEnabled).toHaveBeenCalledWith(
      true,
    );
    expect(analytics().setAnalyticsCollectionEnabled).toHaveBeenCalledWith(
      true,
    );
    expect(crashlytics().log).toHaveBeenCalledWith(
      'Firebase monitoring initialized',
    );
  });

  it('logs screen views to analytics and crashlytics', async () => {
    await logScreenView('Dashboard');

    expect(analytics().logScreenView).toHaveBeenCalledWith({
      screen_name: 'Dashboard',
      screen_class: 'Dashboard',
    });
    expect(crashlytics().setAttribute).toHaveBeenCalledWith(
      'current_screen',
      'Dashboard',
    );
    expect(crashlytics().log).toHaveBeenCalledWith('Screen view: Dashboard');
  });

  it('sets firebase user identifiers and attributes', async () => {
    await setFirebaseUser('user-123', {user_role: 'student'});

    expect(crashlytics().setUserId).toHaveBeenCalledWith('user-123');
    expect(analytics().setUserId).toHaveBeenCalledWith('user-123');
    expect(crashlytics().setAttribute).toHaveBeenCalledWith(
      'user_role',
      'student',
    );
  });

  it('clears firebase user identifiers when userId is null', async () => {
    await setFirebaseUser(null);

    expect(crashlytics().setUserId).toHaveBeenCalledWith('');
    expect(analytics().setUserId).toHaveBeenCalledWith(null);
  });

  it('truncates crashlytics attribute values longer than 1024 characters', async () => {
    const longValue = 'x'.repeat(2000);

    await setFirebaseUser('user-123', {bio: longValue});

    expect(crashlytics().setAttribute).toHaveBeenCalledWith(
      'bio',
      'x'.repeat(1024),
    );
  });

  it('records errors with crash context', async () => {
    const error = new Error('Test failure');

    await recordError(error, {error_source: 'unit_test'});

    expect(crashlytics().setAttribute).toHaveBeenCalledWith(
      'error_source',
      'unit_test',
    );
    expect(crashlytics().recordError).toHaveBeenCalledWith(error);
  });

  it('records errors without optional context', async () => {
    const error = new Error('No context');

    await recordError(error);

    expect(crashlytics().setAttribute).not.toHaveBeenCalled();
    expect(crashlytics().log).toHaveBeenCalledWith('Error: No context');
    expect(crashlytics().recordError).toHaveBeenCalledWith(error);
  });

  it('logs initialization failures in __DEV__', async () => {
    (
      crashlytics().setCrashlyticsCollectionEnabled as jest.Mock
    ).mockRejectedValueOnce(new Error('init failed'));

    await initializeFirebaseMonitoring();

    expect(devLog).toHaveBeenCalledWith(
      'Failed to initialize Firebase monitoring',
      expect.any(Error),
    );
  });

  it('swallows initialization failures outside __DEV__', async () => {
    (global as {__DEV__?: boolean}).__DEV__ = false;
    (
      crashlytics().setCrashlyticsCollectionEnabled as jest.Mock
    ).mockRejectedValueOnce(new Error('init failed'));

    await expect(initializeFirebaseMonitoring()).resolves.toBeUndefined();
    expect(devLog).not.toHaveBeenCalled();
  });

  it('logs screen view failures in __DEV__', async () => {
    (analytics().logScreenView as jest.Mock).mockRejectedValueOnce(
      new Error('screen failed'),
    );

    await logScreenView('Dashboard');

    expect(devLog).toHaveBeenCalledWith('Failed to log screen view', {
      screenName: 'Dashboard',
      error: expect.any(Error),
    });
  });

  it('logs setFirebaseUser failures in __DEV__', async () => {
    (crashlytics().setUserId as jest.Mock).mockRejectedValueOnce(
      new Error('user failed'),
    );

    await setFirebaseUser('user-123');

    expect(devLog).toHaveBeenCalledWith(
      'Failed to set Firebase user',
      expect.any(Error),
    );
  });

  it('logs recordError failures in __DEV__', async () => {
    (crashlytics().recordError as jest.Mock).mockRejectedValueOnce(
      new Error('record failed'),
    );

    await recordError(new Error('Test failure'));

    expect(devLog).toHaveBeenCalledWith(
      'Failed to record error in Crashlytics',
      expect.any(Error),
    );
  });

  it('registers a global handler that records errors and delegates', async () => {
    const defaultHandler = jest.fn();
    (ErrorUtils.getGlobalHandler as jest.Mock).mockReturnValue(defaultHandler);

    setupGlobalErrorHandler();

    const handler = (ErrorUtils.setGlobalHandler as jest.Mock).mock.calls.at(-1)[0];
    const error = new Error('global failure');
    handler(error, true);

    await new Promise<void>(resolve => setImmediate(resolve));

    expect(crashlytics().recordError).toHaveBeenCalledWith(error);
    expect(crashlytics().setAttribute).toHaveBeenCalledWith(
      'error_source',
      'global_handler',
    );
    expect(crashlytics().setAttribute).toHaveBeenCalledWith('is_fatal', 'true');
    expect(defaultHandler).toHaveBeenCalledWith(error, true);
  });

  it('normalizes non-Error values in the global handler', async () => {
    const defaultHandler = jest.fn();
    (ErrorUtils.getGlobalHandler as jest.Mock).mockReturnValue(defaultHandler);

    setupGlobalErrorHandler();

    const handler = (ErrorUtils.setGlobalHandler as jest.Mock).mock.calls.at(-1)[0];
    handler('plain string failure', false);

    await new Promise<void>(resolve => setImmediate(resolve));

    expect(crashlytics().recordError).toHaveBeenCalledWith(
      expect.objectContaining({message: 'plain string failure'}),
    );
    expect(crashlytics().setAttribute).toHaveBeenCalledWith('is_fatal', 'false');
    expect(defaultHandler).toHaveBeenCalledWith('plain string failure', false);
  });

  it('returns early when ErrorUtils is unavailable', () => {
    jest.isolateModules(() => {
      jest.doMock('react-native', () => ({
        ...jest.requireActual('../../__tests__/__mocks__/react-native.js'),
        ErrorUtils: undefined,
      }));

      const {setupGlobalErrorHandler: setupWithoutErrorUtils} =
        require('../../src/services/firebase-service');

      setupWithoutErrorUtils();

      expect(ErrorUtils.setGlobalHandler).not.toHaveBeenCalled();
    });
  });
});
