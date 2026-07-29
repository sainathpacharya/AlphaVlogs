import {useEffect, useState} from 'react';
import {useUserStore} from '@/stores/user-store';
import {useUserCachedStore} from '@/stores/user-cached-store';

type PersistApi = {
  hasHydrated: () => boolean;
  onFinishHydration: (fn: () => void) => () => void;
};

function waitForPersistHydration(persist: PersistApi): Promise<void> {
  if (persist.hasHydrated()) {
    return Promise.resolve();
  }
  return new Promise(resolve => {
    // onFinishHydration may invoke the listener synchronously; avoid calling
    // the unsubscribe handle before it is assigned.
    persist.onFinishHydration(() => {
      resolve();
    });
  });
}

/** Wait until persisted Zustand stores have rehydrated from AsyncStorage. */
export async function waitForStoreHydration(): Promise<void> {
  await Promise.all([
    waitForPersistHydration(useUserStore.persist),
    waitForPersistHydration(useUserCachedStore.persist),
  ]);
}

/**
 * True only after user-store (and cached store) finish rehydrating.
 * Prevents treating the default `isAuthenticated: false` as logged-out and
 * wiping Keychain/AsyncStorage tokens before the session is restored.
 */
export function useStoreHydration(): boolean {
  const [hydrated, setHydrated] = useState(
    () =>
      useUserStore.persist.hasHydrated() &&
      useUserCachedStore.persist.hasHydrated(),
  );

  useEffect(() => {
    let cancelled = false;
    void waitForStoreHydration().then(() => {
      if (!cancelled) {
        setHydrated(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return hydrated;
}
