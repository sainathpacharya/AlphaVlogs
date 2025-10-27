import {renderHook} from '@testing-library/react-native';
import {useToast} from '../../src/hooks/useToast';

// Mock the toast service
jest.mock('../../src/services/notification-service', () => ({
  showToast: jest.fn(),
}));

describe('useToast Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return toast functions', () => {
    const {result} = renderHook(() => useToast());

    expect(result.current).toBeDefined();
    expect(typeof result.current.show).toBe('function');
  });

  it('should provide show function', () => {
    const {result} = renderHook(() => useToast());

    expect(result.current.show).toBeDefined();
    expect(typeof result.current.show).toBe('function');
  });
});
