import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { STORAGE_KEYS } from '@/constants';
import { getRegisterDeviceContext } from '@/utils/device-registration';

jest.mock('react-native-device-info', () => ({
  getUniqueId: jest.fn(() => 'device-uuid-123'),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'android',
}));

const mockGetItem = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;

describe('device-registration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses stored push token when available', async () => {
    mockGetItem.mockResolvedValue('stored-fcm-token');

    await expect(getRegisterDeviceContext()).resolves.toEqual({
      deviceId: 'device-uuid-123',
      deviceType: 'ios',
      token: 'stored-fcm-token',
    });
    expect(mockGetItem).toHaveBeenCalledWith(STORAGE_KEYS.PUSH_TOKEN);
  });

  it('falls back to device id when push token is missing', async () => {
    mockGetItem.mockResolvedValue(null);

    await expect(getRegisterDeviceContext()).resolves.toEqual({
      deviceId: 'device-uuid-123',
      deviceType: 'ios',
      token: 'device-uuid-123',
    });
  });
});
