import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useOTPAutoRead } from '../../src/hooks/useOTPAutoRead';
import otpAutoReadService from '../../src/services/otp-auto-read-service';

jest.mock('../../src/services/otp-auto-read-service', () => ({
  __esModule: true,
  default: {
    isSupported: jest.fn(),
    startListening: jest.fn(),
    stopListening: jest.fn(),
    extractOTPFromMessage: jest.fn(),
    getPlatformInstructions: jest.fn(() => 'Test instructions'),
  },
}));

const mockService = otpAutoReadService as jest.Mocked<typeof otpAutoReadService>;

describe('useOTPAutoRead', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockService.isSupported.mockResolvedValue(true);
    mockService.startListening.mockResolvedValue({ success: true });
    mockService.extractOTPFromMessage.mockReturnValue('123456');
  });

  it('checks support on mount', async () => {
    const { result } = renderHook(() => useOTPAutoRead());

    await waitFor(() => {
      expect(result.current.isSupported).toBe(true);
    });
    expect(mockService.isSupported).toHaveBeenCalled();
    expect(result.current.platformInstructions).toBe('Test instructions');
  });

  it('starts listening when supported', async () => {
    const onOTPReceived = jest.fn();
    const onError = jest.fn();

    const { result } = renderHook(() =>
      useOTPAutoRead({ enableAutoRead: true, onOTPReceived, onError }),
    );

    await waitFor(() => expect(result.current.isSupported).toBe(true));

    await act(async () => {
      await result.current.startListening();
    });

    expect(mockService.startListening).toHaveBeenCalledWith({
      enableAutoRead: true,
      timeout: 60000,
    });
    expect(result.current.isListening).toBe(false);
  });

  it('calls onError when listener reports error', async () => {
    const onError = jest.fn();
    mockService.startListening.mockResolvedValue({
      success: false,
      error: 'Already listening',
    });

    const { result } = renderHook(() => useOTPAutoRead({ onError }));

    await waitFor(() => expect(result.current.isSupported).toBe(true));

    await act(async () => {
      await result.current.startListening();
    });

    expect(onError).toHaveBeenCalledWith('Already listening');
  });

  it('does not start when auto-read disabled', async () => {
    const { result } = renderHook(() => useOTPAutoRead({ enableAutoRead: false }));

    await waitFor(() => expect(result.current.isSupported).toBe(true));

    await act(async () => {
      await result.current.startListening();
    });

    expect(mockService.startListening).not.toHaveBeenCalled();
  });

  it('stops listening and delegates extractOTPFromMessage', async () => {
    const { result } = renderHook(() => useOTPAutoRead());

    act(() => {
      result.current.stopListening();
    });

    expect(mockService.stopListening).toHaveBeenCalled();

    act(() => {
      const otp = result.current.extractOTPFromMessage('Jack Marvels: Your OTP is 123456');
      expect(otp).toBe('123456');
    });
  });

  it('stops listening on unmount', async () => {
    const { unmount } = renderHook(() => useOTPAutoRead());

    unmount();

    expect(mockService.stopListening).toHaveBeenCalled();
  });
});
