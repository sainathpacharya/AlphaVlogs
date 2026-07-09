import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import {ErrorUtils} from 'react-native';
import {devLog} from '@/utils/dev-log';

const MAX_CRASHLYTICS_ATTRIBUTE_LENGTH = 1024;

function truncate(value: string): string {
  return value.length > MAX_CRASHLYTICS_ATTRIBUTE_LENGTH
    ? value.slice(0, MAX_CRASHLYTICS_ATTRIBUTE_LENGTH)
    : value;
}

async function setCrashlyticsAttributes(
  attributes: Record<string, string>,
): Promise<void> {
  await Promise.all(
    Object.entries(attributes).map(([key, value]) =>
      crashlytics().setAttribute(key, truncate(value)),
    ),
  );
}

export async function initializeFirebaseMonitoring(): Promise<void> {
  try {
    await crashlytics().setCrashlyticsCollectionEnabled(true);
    await analytics().setAnalyticsCollectionEnabled(true);
    crashlytics().log('Firebase monitoring initialized');
  } catch (error) {
    if (__DEV__) {
      devLog('Failed to initialize Firebase monitoring', error);
    }
  }
}

export async function logScreenView(screenName: string): Promise<void> {
  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    });
    await setCrashlyticsAttributes({
      current_screen: screenName,
      last_screen_viewed_at: new Date().toISOString(),
    });
    crashlytics().log(`Screen view: ${screenName}`);
  } catch (error) {
    if (__DEV__) {
      devLog('Failed to log screen view', {screenName, error});
    }
  }
}

export async function setFirebaseUser(
  userId: string | null,
  attributes: Record<string, string> = {},
): Promise<void> {
  try {
    if (userId) {
      await crashlytics().setUserId(userId);
      await analytics().setUserId(userId);
      await setCrashlyticsAttributes(attributes);
      crashlytics().log(`User identified: ${userId}`);
      return;
    }

    await crashlytics().setUserId('');
    await analytics().setUserId(null);
  } catch (error) {
    if (__DEV__) {
      devLog('Failed to set Firebase user', error);
    }
  }
}

export async function recordError(
  error: Error,
  context: Record<string, string> = {},
): Promise<void> {
  try {
    if (Object.keys(context).length > 0) {
      await setCrashlyticsAttributes(context);
    }
    crashlytics().log(`Error: ${error.message}`);
    await crashlytics().recordError(error);
  } catch (recordErrorFailure) {
    if (__DEV__) {
      devLog('Failed to record error in Crashlytics', recordErrorFailure);
    }
  }
}

export function setupGlobalErrorHandler(): void {
  if (!ErrorUtils) {
    return;
  }

  const defaultHandler = ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler((error, isFatal) => {
    const normalizedError =
      error instanceof Error ? error : new Error(String(error));

    void recordError(normalizedError, {
      error_source: 'global_handler',
      is_fatal: String(Boolean(isFatal)),
    });

    defaultHandler?.(error, isFatal);
  });
}
