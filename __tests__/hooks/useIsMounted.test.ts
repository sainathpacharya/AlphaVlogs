import { renderHook, act } from '@testing-library/react-native';
import { useIsMounted, useSafeAsync } from '../../src/hooks/useIsMounted';

describe('useIsMounted', () => {
  it('returns ref that is true while mounted', () => {
    const { result, unmount } = renderHook(() => useIsMounted());

    expect(result.current.current).toBe(true);

    unmount();

    expect(result.current.current).toBe(false);
  });

  it('returns ref that is false after unmount', () => {
    const { result, unmount } = renderHook(() => useIsMounted());

    expect(result.current.current).toBe(true);
    unmount();
    expect(result.current.current).toBe(false);
  });
});

describe('useSafeAsync', () => {
  it('returns task result when mounted', async () => {
    const { result } = renderHook(() => useSafeAsync());

    let value: number | undefined;
    await act(async () => {
      value = await result.current.runSafe(async () => 42);
    });

    expect(value).toBe(42);
  });

  it('returns undefined when unmounted before resolve', async () => {
    const { result, unmount } = renderHook(() => useSafeAsync());

    let pending: Promise<number | undefined> | undefined;
    act(() => {
      pending = result.current.runSafe(
        () => new Promise<number>(resolve => setTimeout(() => resolve(99), 50)),
      );
    });

    unmount();

    await expect(pending).resolves.toBeUndefined();
  });

  it('swallows errors after unmount', async () => {
    const { result, unmount } = renderHook(() => useSafeAsync());

    let pending: Promise<unknown> | undefined;
    act(() => {
      pending = result.current.runSafe(
        () => new Promise((_resolve, reject) => setTimeout(() => reject(new Error('boom')), 20)),
      );
    });

    unmount();

    await expect(pending).resolves.toBeUndefined();
  });

  it('rethrows errors while mounted', async () => {
    const { result } = renderHook(() => useSafeAsync());

    await expect(
      result.current.runSafe(async () => {
        throw new Error('mounted error');
      }),
    ).rejects.toThrow('mounted error');
  });
});
