import { LogBox } from 'react-native';
import { devLog } from '@/utils/dev-log';

const noop = (): void => {};

/**
 * Dev: keep console + LogBox active (logs stream to Metro with `yarn start`).
 * Release: silence debug console noise; errors still reach native crash tooling.
 */
export function configureDevLogging(): void {
  if (__DEV__) {
    LogBox.ignoreLogs([
      // Non-fatal RN internals — uncomment if too noisy:
      // 'Require cycle:',
    ]);

    devLog(
      'Dev logging enabled. Metro: yarn metro:reset | logcat: adb logcat -s AlphaVlogs ReactNativeJS',
    );
    return;
  }

  LogBox.ignoreAllLogs(true);
  console.log = noop;
  console.info = noop;
  console.debug = noop;
  console.warn = noop;
}

configureDevLogging();
