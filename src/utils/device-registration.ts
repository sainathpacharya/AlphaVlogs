import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { STORAGE_KEYS } from '@/constants';
import { RegisterDeviceContext } from '@/utils/register-payload';

/** Device + push context required by POST /api/students/register. */
export async function getRegisterDeviceContext(): Promise<RegisterDeviceContext> {
  const [deviceId, storedToken] = await Promise.all([
    DeviceInfo.getUniqueId(),
    AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN),
  ]);

  const pushToken = storedToken?.trim();
  // Backend requires a non-empty token; use device id until FCM is integrated.
  const token = pushToken || deviceId;

  return {
    deviceId,
    deviceType: Platform.OS,
    token,
  };
}
