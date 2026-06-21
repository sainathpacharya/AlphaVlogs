import { Log } from 'react-native';

const TAG = 'AlphaVlogs';

/** Logs to Metro (--client-logs) and Android logcat / Xcode console. */
export function devLog(message: string, data?: unknown): void {
  if (!__DEV__) {
    return;
  }

  const payload =
    data === undefined
      ? message
      : `${message} ${typeof data === 'string' ? data : JSON.stringify(data)}`;

  if (typeof Log?.info === 'function') {
    Log.info(TAG, payload);
  } else if (typeof Log?.i === 'function') {
    Log.i(TAG, payload);
  }
  if (data === undefined) {
    console.log(`[${TAG}]`, message);
  } else {
    console.log(`[${TAG}]`, message, data);
  }
}
