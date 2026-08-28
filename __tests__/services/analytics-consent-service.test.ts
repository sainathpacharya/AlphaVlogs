import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAnalytics,
  setAnalyticsCollectionEnabled,
} from '@react-native-firebase/analytics';
import {
  getCrashlytics,
  setCrashlyticsCollectionEnabled,
} from '@react-native-firebase/crashlytics';
import {STORAGE_KEYS} from '@/constants';
import {
  applyAnalyticsConsent,
  bootstrapAnalyticsConsent,
  getAnalyticsConsent,
  setAnalyticsConsent,
} from '../../src/services/analytics-consent-service';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('analytics-consent-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when consent is not stored', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    await expect(getAnalyticsConsent()).resolves.toBeNull();
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.ANALYTICS_CONSENT);
  });

  it('returns stored granted or denied consent', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('granted');
    await expect(getAnalyticsConsent()).resolves.toBe('granted');

    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('denied');
    await expect(getAnalyticsConsent()).resolves.toBe('denied');

    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('invalid');
    await expect(getAnalyticsConsent()).resolves.toBeNull();
  });

  it('persists consent and applies collection settings', async () => {
    await setAnalyticsConsent('granted');

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.ANALYTICS_CONSENT,
      'granted',
    );
    expect(setAnalyticsCollectionEnabled).toHaveBeenCalledWith(
      getAnalytics(),
      true,
    );
    expect(setCrashlyticsCollectionEnabled).toHaveBeenCalledWith(
      getCrashlytics(),
      true,
    );
  });

  it('disables analytics and crashlytics when consent is denied', async () => {
    await applyAnalyticsConsent('denied');

    expect(setAnalyticsCollectionEnabled).toHaveBeenCalledWith(
      getAnalytics(),
      false,
    );
    expect(setCrashlyticsCollectionEnabled).toHaveBeenCalledWith(
      getCrashlytics(),
      false,
    );
  });

  it('bootstraps stored consent when available', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('granted');

    await expect(bootstrapAnalyticsConsent()).resolves.toBe('granted');
    expect(setAnalyticsCollectionEnabled).toHaveBeenCalledWith(
      getAnalytics(),
      true,
    );
  });

  it('disables collection when consent has not been set', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    await expect(bootstrapAnalyticsConsent()).resolves.toBeNull();
    expect(setAnalyticsCollectionEnabled).toHaveBeenCalledWith(
      getAnalytics(),
      false,
    );
    expect(setCrashlyticsCollectionEnabled).toHaveBeenCalledWith(
      getCrashlytics(),
      false,
    );
  });
});
