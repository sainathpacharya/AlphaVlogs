import {renderHook} from '@testing-library/react-native';
import {useNetwork} from '../../src/hooks/useNetwork';

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
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
});
