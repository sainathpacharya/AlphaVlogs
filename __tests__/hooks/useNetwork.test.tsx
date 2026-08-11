import {renderHook, act, waitFor} from '@testing-library/react-native';
import NetInfo from '@react-native-community/netinfo';
import {useNetwork} from '../../src/hooks/useNetwork';

let listener: ((state: unknown) => void) | null = null;

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn((cb) => {
    listener = cb;
    return jest.fn(() => {
      listener = null;
    });
  }),
  fetch: jest.fn(() =>
    Promise.resolve({
      type: 'wifi',
      isConnected: true,
      isInternetReachable: true,
    }),
  ),
}));

describe('useNetwork Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial network state', () => {
    const {result} = renderHook(() => useNetwork());

    expect(result.current).toBeDefined();
    expect(typeof result.current.isConnected).toBe('boolean');
    expect(typeof result.current.isInternetReachable).toBe('boolean');
    expect(typeof result.current.type).toBe('string');
  });

  it('should handle network state changes', () => {
    const {result} = renderHook(() => useNetwork());

    // Initial state should be defined
    expect(result.current).toBeDefined();
  });

  it('should provide network status information', () => {
    const {result} = renderHook(() => useNetwork());

    expect(result.current).toHaveProperty('isConnected');
    expect(result.current).toHaveProperty('isInternetReachable');
    expect(result.current).toHaveProperty('type');
  });

  it('updates status when NetInfo emits changes', async () => {
    const {result, unmount} = renderHook(() => useNetwork());

    await waitFor(() => {
      expect(listener).not.toBeNull();
    });

    act(() => {
      listener?.({
        type: 'cellular',
        isConnected: false,
        isInternetReachable: null,
      });
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.isInternetReachable).toBe(false);
    expect(result.current.type).toBe('cellular');

    unmount();
    expect(listener).toBeNull();
  });

  it('defaults null fetch values to false on initial load', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValueOnce({
      type: 'none',
      isConnected: null,
      isInternetReachable: null,
    });

    const {result} = renderHook(() => useNetwork());

    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
      expect(result.current.isInternetReachable).toBe(false);
      expect(result.current.type).toBe('none');
    });
  });
});
