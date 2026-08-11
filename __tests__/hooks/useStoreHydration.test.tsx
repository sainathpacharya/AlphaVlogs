import {renderHook, waitFor} from '@testing-library/react-native';

const mockUserPersist = {
  hasHydrated: jest.fn(() => false),
  onFinishHydration: jest.fn((cb: () => void) => {
    cb();
    return jest.fn();
  }),
};

const mockCachedPersist = {
  hasHydrated: jest.fn(() => false),
  onFinishHydration: jest.fn((cb: () => void) => {
    cb();
    return jest.fn();
  }),
};

jest.mock('@/stores/user-store', () => ({
  useUserStore: {
    persist: {
      hasHydrated: (...args: unknown[]) => mockUserPersist.hasHydrated(...args),
      onFinishHydration: (cb: () => void) => mockUserPersist.onFinishHydration(cb),
    },
  },
}));

jest.mock('@/stores/user-cached-store', () => ({
  useUserCachedStore: {
    persist: {
      hasHydrated: (...args: unknown[]) => mockCachedPersist.hasHydrated(...args),
      onFinishHydration: (cb: () => void) => mockCachedPersist.onFinishHydration(cb),
    },
  },
}));

import {
  useStoreHydration,
  waitForStoreHydration,
} from '../../src/hooks/useStoreHydration';

describe('useStoreHydration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserPersist.hasHydrated.mockReturnValue(false);
    mockCachedPersist.hasHydrated.mockReturnValue(false);
    mockUserPersist.onFinishHydration.mockImplementation((cb: () => void) => {
      cb();
      return jest.fn();
    });
    mockCachedPersist.onFinishHydration.mockImplementation((cb: () => void) => {
      cb();
      return jest.fn();
    });
  });

  it('waitForStoreHydration resolves after both stores hydrate', async () => {
    await expect(waitForStoreHydration()).resolves.toBeUndefined();
    expect(mockUserPersist.onFinishHydration).toHaveBeenCalled();
    expect(mockCachedPersist.onFinishHydration).toHaveBeenCalled();
  });

  it('waitForStoreHydration resolves immediately when already hydrated', async () => {
    mockUserPersist.hasHydrated.mockReturnValue(true);
    mockCachedPersist.hasHydrated.mockReturnValue(true);

    await expect(waitForStoreHydration()).resolves.toBeUndefined();
    expect(mockUserPersist.onFinishHydration).not.toHaveBeenCalled();
  });

  it('useStoreHydration becomes true after hydration', async () => {
    const {result} = renderHook(() => useStoreHydration());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('useStoreHydration starts true when stores are already hydrated', () => {
    mockUserPersist.hasHydrated.mockReturnValue(true);
    mockCachedPersist.hasHydrated.mockReturnValue(true);

    const {result} = renderHook(() => useStoreHydration());

    expect(result.current).toBe(true);
  });

  it('useStoreHydration ignores hydration completion after unmount', () => {
    const pendingCallbacks: Array<() => void> = [];
    mockUserPersist.onFinishHydration.mockImplementation((cb: () => void) => {
      pendingCallbacks.push(cb);
      return jest.fn();
    });
    mockCachedPersist.onFinishHydration.mockImplementation((cb: () => void) => {
      pendingCallbacks.push(cb);
      return jest.fn();
    });

    const {unmount} = renderHook(() => useStoreHydration());
    unmount();

    expect(() => {
      pendingCallbacks.forEach(cb => cb());
    }).not.toThrow();
  });
});
