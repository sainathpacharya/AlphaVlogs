import {useEffect, useRef} from 'react';

/** Returns a ref that is true while the component is mounted. */
export function useIsMounted() {
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return isMounted;
}

/** Run async work safely; skips setState/alert when unmounted. */
export function useSafeAsync() {
  const isMounted = useIsMounted();

  const runSafe = async <T,>(task: () => Promise<T>): Promise<T | undefined> => {
    try {
      const result = await task();
      if (!isMounted.current) {
        return undefined;
      }
      return result;
    } catch (error) {
      if (isMounted.current) {
        throw error;
      }
      return undefined;
    }
  };

  return {isMounted, runSafe};
}
