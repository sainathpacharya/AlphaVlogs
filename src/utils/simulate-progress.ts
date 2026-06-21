/** Simulates upload progress; resolves at 100% or when cancelled. */
export function simulateUploadProgress(
  onProgress: (progress: number) => void,
  step = 10,
  intervalMs = 200,
): {promise: Promise<void>; cancel: () => void} {
  let progress = 0;
  let intervalId: ReturnType<typeof setInterval> | undefined;

  const promise = new Promise<void>(resolve => {
    intervalId = setInterval(() => {
      progress += step;
      onProgress(Math.min(progress, 100));
      if (progress >= 100) {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = undefined;
        }
        resolve();
      }
    }, intervalMs);
  });

  return {
    promise,
    cancel: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
    },
  };
}
