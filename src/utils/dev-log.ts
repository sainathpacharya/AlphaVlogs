const TAG = 'AlphaVlogs';

/** Logs to Metro (--client-logs) and Android logcat / Xcode console. */
export function devLog(message: string, data?: unknown): void {
  if (!__DEV__) {
    return;
  }

  if (data === undefined) {
    console.log(`[${TAG}]`, message);
  } else {
    console.log(`[${TAG}]`, message, data);
  }
}
