import { simulateUploadProgress } from '../../src/utils/simulate-progress';

describe('simulate-progress utils', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('reports incremental progress until 100%', async () => {
    const onProgress = jest.fn();
    const { promise } = simulateUploadProgress(onProgress, 25, 100);

    jest.advanceTimersByTime(100);
    expect(onProgress).toHaveBeenCalledWith(25);

    jest.advanceTimersByTime(100);
    expect(onProgress).toHaveBeenCalledWith(50);

    jest.advanceTimersByTime(200);
    await promise;
    expect(onProgress).toHaveBeenLastCalledWith(100);
  });

  it('caps progress at 100 when step overshoots', async () => {
    const onProgress = jest.fn();
    const { promise } = simulateUploadProgress(onProgress, 60, 50);

    jest.advanceTimersByTime(50);
    jest.advanceTimersByTime(50);
    await promise;

    expect(onProgress).toHaveBeenCalledWith(60);
    expect(onProgress).toHaveBeenCalledWith(100);
  });

  it('cancel stops further progress updates', () => {
    const onProgress = jest.fn();
    const { cancel } = simulateUploadProgress(onProgress, 10, 100);

    jest.advanceTimersByTime(100);
    expect(onProgress).toHaveBeenCalledTimes(1);

    cancel();
    jest.advanceTimersByTime(500);
    expect(onProgress).toHaveBeenCalledTimes(1);
  });
});
