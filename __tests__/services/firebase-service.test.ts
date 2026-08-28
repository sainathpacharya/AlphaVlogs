import {
  getAnalytics,
  logEvent,
  setUserId as setAnalyticsUserId,
} from '@react-native-firebase/analytics';
import {
  getCrashlytics,
  log as crashlyticsLog,
  recordError as crashlyticsRecordError,
  setAttribute as crashlyticsSetAttribute,
  setUserId as crashlyticsSetUserId,
} from '@react-native-firebase/crashlytics';
import {ErrorUtils} from 'react-native';
import {devLog} from '@/utils/dev-log';
import {firebaseInstance} from '../../__tests__/__mocks__/@react-native-firebase/firebase-shared';
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

  it('initializes Firebase monitoring without enabling collection', async () => {
    await initializeFirebaseMonitoring();

    expect(firebaseInstance.setCrashlyticsCollectionEnabled).not.toHaveBeenCalled();
    expect(firebaseInstance.setAnalyticsCollectionEnabled).not.toHaveBeenCalled();
    expect(crashlyticsLog).toHaveBeenCalledWith(
      getCrashlytics(),
      'Firebase monitoring initialized',
    );
  });

  it('logs screen views to analytics and crashlytics', async () => {
    await logScreenView('Dashboard');

    expect(logEvent).toHaveBeenCalledWith(getAnalytics(), 'screen_view', {
      screen_name: 'Dashboard',
      screen_class: 'Dashboard',
    });
    expect(crashlyticsSetAttribute).toHaveBeenCalledWith(
      getCrashlytics(),
      'current_screen',
      'Dashboard',
    );
    expect(crashlyticsLog).toHaveBeenCalledWith(
      getCrashlytics(),
      'Screen view: Dashboard',
    );
  });

  it('sets firebase user identifiers and attributes', async () => {
    await setFirebaseUser('user-123', {user_role: 'student'});

    expect(crashlyticsSetUserId).toHaveBeenCalledWith(getCrashlytics(), 'user-123');
    expect(setAnalyticsUserId).toHaveBeenCalledWith(getAnalytics(), 'user-123');
    expect(crashlyticsSetAttribute).toHaveBeenCalledWith(
      getCrashlytics(),
      'user_role',
      'student',
    );
  });

  it('clears firebase user identifiers when userId is null', async () => {
    await setFirebaseUser(null);

    expect(crashlyticsSetUserId).toHaveBeenCalledWith(getCrashlytics(), '');
    expect(setAnalyticsUserId).toHaveBeenCalledWith(getAnalytics(), null);
  });

  it('truncates crashlytics attribute values longer than 1024 characters', async () => {
    const longValue = 'x'.repeat(2000);

    await setFirebaseUser('user-123', {bio: longValue});

    expect(crashlyticsSetAttribute).toHaveBeenCalledWith(
      getCrashlytics(),
      'bio',
      'x'.repeat(1024),
    );
  });

  it('records errors with crash context', async () => {
    const error = new Error('Test failure');

    await recordError(error, {error_source: 'unit_test'});

    expect(crashlyticsSetAttribute).toHaveBeenCalledWith(
      getCrashlytics(),
      'error_source',
      'unit_test',
    );
    expect(crashlyticsRecordError).toHaveBeenCalledWith(getCrashlytics(), error);
  });

  it('records errors without optional context', async () => {
    const error = new Error('No context');

    await recordError(error);

    expect(crashlyticsSetAttribute).not.toHaveBeenCalled();
    expect(crashlyticsLog).toHaveBeenCalledWith(getCrashlytics(), 'Error: No context');
    expect(crashlyticsRecordError).toHaveBeenCalledWith(getCrashlytics(), error);
  });

  it('logs initialization failures in __DEV__', async () => {
    (firebaseInstance.log as jest.Mock).mockImplementationOnce(() => {
      throw new Error('init failed');
    });

    await initializeFirebaseMonitoring();

    expect(devLog).toHaveBeenCalledWith(
      'Failed to initialize Firebase monitoring',
      expect.any(Error),
    );
  });

  it('swallows initialization failures outside __DEV__', async () => {
    (global as {__DEV__?: boolean}).__DEV__ = false;
    (firebaseInstance.log as jest.Mock).mockImplementationOnce(() => {
      throw new Error('init failed');
    });

    await expect(initializeFirebaseMonitoring()).resolves.toBeUndefined();
    expect(devLog).not.toHaveBeenCalled();
  });

  it('logs screen view failures in __DEV__', async () => {
    (logEvent as jest.Mock).mockRejectedValueOnce(
      new Error('screen failed'),
    );

    await logScreenView('Dashboard');

    expect(devLog).toHaveBeenCalledWith('Failed to log screen view', {
      screenName: 'Dashboard',
      error: expect.any(Error),
    });
  });

  it('logs setFirebaseUser failures in __DEV__', async () => {
    (crashlyticsSetUserId as jest.Mock).mockRejectedValueOnce(
      new Error('user failed'),
    );

    await setFirebaseUser('user-123');

    expect(devLog).toHaveBeenCalledWith(
      'Failed to set Firebase user',
      expect.any(Error),
    );
  });

  it('logs recordError failures in __DEV__', async () => {
    (crashlyticsRecordError as jest.Mock).mockImplementationOnce(() => {
      throw new Error('record failed');
    });

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

    expect(crashlyticsRecordError).toHaveBeenCalledWith(getCrashlytics(), error);
    expect(crashlyticsSetAttribute).toHaveBeenCalledWith(
      getCrashlytics(),
      'error_source',
      'global_handler',
    );
    expect(crashlyticsSetAttribute).toHaveBeenCalledWith(getCrashlytics(), 'is_fatal', 'true');
    expect(defaultHandler).toHaveBeenCalledWith(error, true);
  });

  it('normalizes non-Error values in the global handler', async () => {
    const defaultHandler = jest.fn();
    (ErrorUtils.getGlobalHandler as jest.Mock).mockReturnValue(defaultHandler);

    setupGlobalErrorHandler();

    const handler = (ErrorUtils.setGlobalHandler as jest.Mock).mock.calls.at(-1)[0];
    handler('plain string failure', false);

    await new Promise<void>(resolve => setImmediate(resolve));

    expect(crashlyticsRecordError).toHaveBeenCalledWith(
      getCrashlytics(),
      expect.objectContaining({message: 'plain string failure'}),
    );
    expect(crashlyticsSetAttribute).toHaveBeenCalledWith(getCrashlytics(), 'is_fatal', 'false');
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
