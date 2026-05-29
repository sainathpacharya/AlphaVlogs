import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from '@/constants';
import { Event } from '@/types';

const EVENTS_CACHE_KEY = '@jack_marvels/student_events_v1';

/** Static catalog — refresh from API at most once per week unless forced. */
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

interface EventsCacheBundle {
  events: Event[];
  cachedAt: number;
  apiBaseUrl: string;
}

function parseCacheBundle(raw: string | null): EventsCacheBundle | null {
  if (!raw) {
    return null;
  }
  try {
    const bundle = JSON.parse(raw) as EventsCacheBundle;
    if (!bundle?.events?.length || bundle.apiBaseUrl !== getApiBaseUrl()) {
      return null;
    }
    return bundle;
  } catch {
    return null;
  }
}

export async function readCachedEvents(): Promise<Event[] | null> {
  const bundle = parseCacheBundle(await AsyncStorage.getItem(EVENTS_CACHE_KEY));
  if (!bundle) {
    return null;
  }
  if (Date.now() - bundle.cachedAt > CACHE_MAX_AGE_MS) {
    return null;
  }
  return bundle.events;
}

/** Use when API fails but an older cache is still useful. */
export async function readStaleCachedEvents(): Promise<Event[] | null> {
  const bundle = parseCacheBundle(await AsyncStorage.getItem(EVENTS_CACHE_KEY));
  return bundle?.events ?? null;
}

export async function writeCachedEvents(events: Event[]): Promise<void> {
  try {
    const bundle: EventsCacheBundle = {
      events,
      cachedAt: Date.now(),
      apiBaseUrl: getApiBaseUrl(),
    };
    await AsyncStorage.setItem(EVENTS_CACHE_KEY, JSON.stringify(bundle));
  } catch (error) {
    if (__DEV__) {
      console.warn('[events-cache] Failed to persist events', error);
    }
  }
}

export async function clearEventsCache(): Promise<void> {
  await AsyncStorage.removeItem(EVENTS_CACHE_KEY);
}
