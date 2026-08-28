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

export type AnalyticsConsentValue = 'granted' | 'denied';

export async function getAnalyticsConsent(): Promise<AnalyticsConsentValue | null> {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.ANALYTICS_CONSENT);
  if (value === 'granted' || value === 'denied') {
    return value;
  }
  return null;
}

export async function setAnalyticsConsent(
  consent: AnalyticsConsentValue,
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.ANALYTICS_CONSENT, consent);
  await applyAnalyticsConsent(consent);
}

export async function applyAnalyticsConsent(
  consent: AnalyticsConsentValue,
): Promise<void> {
  const enabled = consent === 'granted';
  const analytics = getAnalytics();
  const crashlytics = getCrashlytics();

  await Promise.all([
    setAnalyticsCollectionEnabled(analytics, enabled),
    setCrashlyticsCollectionEnabled(crashlytics, enabled),
  ]);
}

export async function bootstrapAnalyticsConsent(): Promise<AnalyticsConsentValue | null> {
  const consent = await getAnalyticsConsent();
  const analytics = getAnalytics();
  const crashlytics = getCrashlytics();

  if (consent) {
    await applyAnalyticsConsent(consent);
  } else {
    await Promise.all([
      setAnalyticsCollectionEnabled(analytics, false),
      setCrashlyticsCollectionEnabled(crashlytics, false),
    ]);
  }
  return consent;
}
