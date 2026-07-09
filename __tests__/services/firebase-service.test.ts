import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import {
  initializeFirebaseMonitoring,
  logScreenView,
  recordError,
  setFirebaseUser,
} from '../../src/services/firebase-service';

describe('firebase-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it('records errors with crash context', async () => {
    const error = new Error('Test failure');

    await recordError(error, {error_source: 'unit_test'});

    expect(crashlytics().setAttribute).toHaveBeenCalledWith(
      'error_source',
      'unit_test',
    );
    expect(crashlytics().recordError).toHaveBeenCalledWith(error);
  });
});
