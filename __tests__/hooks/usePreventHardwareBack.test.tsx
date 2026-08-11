import { renderHook } from '@testing-library/react-native';
import { Alert, BackHandler, Platform } from 'react-native';
import { usePreventHardwareBack } from '../../src/hooks/usePreventHardwareBack';

describe('usePreventHardwareBack', () => {
  const mockRemove = jest.fn();
  let backHandler: (() => boolean) | undefined;
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    backHandler = undefined;
    (BackHandler.addEventListener as jest.Mock).mockImplementation((_event, handler) => {
      backHandler = handler;
      return { remove: mockRemove };
    });
  });

  afterEach(() => {
    Platform.OS = originalPlatform;
  });

  it('does not register a listener on iOS', () => {
    Platform.OS = 'ios';
    renderHook(() => usePreventHardwareBack());
    expect(BackHandler.addEventListener).not.toHaveBeenCalled();
  });

  it('swallows the hardware back press on Android by default', () => {
    Platform.OS = 'android';
    renderHook(() => usePreventHardwareBack(false));

    expect(BackHandler.addEventListener).toHaveBeenCalledWith(
      'hardwareBackPress',
      expect.any(Function),
    );
    expect(backHandler?.()).toBe(true);
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('shows an exit confirmation on Android when confirmExit is true', () => {
    Platform.OS = 'android';
    renderHook(() => usePreventHardwareBack(true));

    expect(backHandler?.()).toBe(true);
    expect(Alert.alert).toHaveBeenCalledWith(
      'Exit App',
      'Are you sure you want to exit?',
      expect.any(Array),
      { cancelable: true },
    );

    const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
    buttons[1].onPress?.();
    expect(BackHandler.exitApp).toHaveBeenCalled();
  });

  it('removes the listener on unmount', () => {
    Platform.OS = 'android';
    const { unmount } = renderHook(() => usePreventHardwareBack());
    unmount();
    expect(mockRemove).toHaveBeenCalled();
  });
});
