import { LogBox } from 'react-native';
import { devLog } from '@/utils/dev-log';

const noop = (): void => {};

/**
 * Dev: keep console + LogBox active (logs stream to Metro with `yarn start`
 * which passes `--client-logs` — required on RN 0.76+ for device → terminal).
 * Release: silence debug console noise; errors still reach native crash tooling.
 */
export function configureDevLogging(): void {
  if (__DEV__) {
    LogBox.ignoreLogs([
      // Non-fatal RN internals — uncomment if too noisy:
      // 'Require cycle:',
    ]);

    // Ensure console methods are not stubbed if a previous release path ran.
    // (No-op restore — native console is intact in __DEV__.)
    devLog(
      'Dev logging enabled → Metro terminal (yarn start --client-logs) | adb: yarn logs:android',
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
