import { Alert, Linking, Platform } from 'react-native';
import {
  check,
  request,
  checkMultiple,
  requestMultiple,
  openSettings,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';
import { permissionsService } from '../../src/services/permissions-service';

jest.mock('react-native-permissions', () => ({
  PERMISSIONS: {
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
      PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
      LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE',
      MICROPHONE: 'ios.permission.MICROPHONE',
    },
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
      READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
      WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
      READ_MEDIA_VIDEO: 'android.permission.READ_MEDIA_VIDEO',
      READ_MEDIA_VISUAL_USER_SELECTED:
        'android.permission.READ_MEDIA_VISUAL_USER_SELECTED',
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
      RECORD_AUDIO: 'android.permission.RECORD_AUDIO',
      POST_NOTIFICATIONS: 'android.permission.POST_NOTIFICATIONS',
    },
  },
  RESULTS: {
    UNAVAILABLE: 'unavailable',
    DENIED: 'denied',
    GRANTED: 'granted',
    BLOCKED: 'blocked',
    LIMITED: 'limited',
  },
  check: jest.fn(),
  request: jest.fn(),
  checkMultiple: jest.fn(),
  requestMultiple: jest.fn(),
  openSettings: jest.fn(),
}));

jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

const mockCheck = check as jest.MockedFunction<typeof check>;
const mockRequest = request as jest.MockedFunction<typeof request>;
const mockCheckMultiple = checkMultiple as jest.MockedFunction<typeof checkMultiple>;
const mockRequestMultiple = requestMultiple as jest.MockedFunction<typeof requestMultiple>;
const mockOpenSettings = openSettings as jest.MockedFunction<typeof openSettings>;

describe('PermissionsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    Object.defineProperty(Platform, 'Version', { configurable: true, value: 33 });
  });

  describe('checkPermission', () => {
    it('returns granted for null permission', async () => {
      const status = await permissionsService.checkPermission(null);

      expect(status.granted).toBe(true);
      expect(mockCheck).not.toHaveBeenCalled();
    });

    it('maps granted result', async () => {
      mockCheck.mockResolvedValue(RESULTS.GRANTED);

      const status = await permissionsService.checkPermission(PERMISSIONS.IOS.CAMERA);

      expect(status.granted).toBe(true);
      expect(status.blocked).toBe(false);
    });

    it('maps blocked and limited results', async () => {
      mockCheck.mockResolvedValueOnce(RESULTS.BLOCKED);
      const blocked = await permissionsService.checkPermission(PERMISSIONS.IOS.CAMERA);
      expect(blocked.blocked).toBe(true);

      mockCheck.mockResolvedValueOnce(RESULTS.LIMITED);
      const limited = await permissionsService.checkPermission(PERMISSIONS.IOS.PHOTO_LIBRARY);
      expect(limited.limited).toBe(true);
    });

    it('returns unavailable on error', async () => {
      mockCheck.mockRejectedValue(new Error('fail'));

      const status = await permissionsService.checkPermission(PERMISSIONS.IOS.CAMERA);

      expect(status.unavailable).toBe(true);
      expect(status.granted).toBe(false);
    });
  });

  describe('requestPermission', () => {
    it('returns granted for null permission', async () => {
      const status = await permissionsService.requestPermission(null);

      expect(status.granted).toBe(true);
      expect(mockRequest).not.toHaveBeenCalled();
    });

    it('maps request result', async () => {
      mockRequest.mockResolvedValue(RESULTS.GRANTED);

      const status = await permissionsService.requestPermission(PERMISSIONS.ANDROID.CAMERA);

      expect(status.granted).toBe(true);
    });

    it('returns unavailable on request error', async () => {
      mockRequest.mockRejectedValue(new Error('request failed'));

      const status = await permissionsService.requestPermission(PERMISSIONS.ANDROID.CAMERA);

      expect(status.unavailable).toBe(true);
    });
  });

  describe('checkMultiplePermissions', () => {
    it('maps all permission slots', async () => {
      mockCheckMultiple.mockResolvedValue({
        [PERMISSIONS.ANDROID.CAMERA]: RESULTS.GRANTED,
        [PERMISSIONS.ANDROID.READ_MEDIA_VIDEO]: RESULTS.DENIED,
        [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]: RESULTS.GRANTED,
        [PERMISSIONS.ANDROID.RECORD_AUDIO]: RESULTS.GRANTED,
        [PERMISSIONS.ANDROID.POST_NOTIFICATIONS]: RESULTS.UNAVAILABLE,
      } as any);

      const result = await permissionsService.checkMultiplePermissions();

      expect(result.camera.granted).toBe(true);
      expect(result.photoLibrary.granted).toBe(false);
      expect(result.location.granted).toBe(true);
    });

    it('returns defaults on error', async () => {
      mockCheckMultiple.mockRejectedValue(new Error('fail'));

      const result = await permissionsService.checkMultiplePermissions();

      expect(result.camera.unavailable).toBe(true);
      expect(result.notifications.unavailable).toBe(true);
    });
  });

  describe('requestMultiplePermissions', () => {
    it('maps requested permissions', async () => {
      mockRequestMultiple.mockResolvedValue({
        [PERMISSIONS.ANDROID.CAMERA]: RESULTS.GRANTED,
        [PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE]: RESULTS.GRANTED,
        [PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE]: RESULTS.GRANTED,
        [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]: RESULTS.GRANTED,
        [PERMISSIONS.ANDROID.RECORD_AUDIO]: RESULTS.GRANTED,
        [PERMISSIONS.ANDROID.POST_NOTIFICATIONS]: RESULTS.GRANTED,
      } as any);

      const result = await permissionsService.requestMultiplePermissions();

      expect(result.camera.granted).toBe(true);
      expect(result.microphone.granted).toBe(true);
      expect(result.notifications.granted).toBe(true);
    });

    it('returns defaults on error', async () => {
      mockRequestMultiple.mockRejectedValue(new Error('fail'));

      const result = await permissionsService.requestMultiplePermissions();

      expect(result.camera.unavailable).toBe(true);
    });
  });

  describe('iOS platform paths', () => {
    beforeEach(() => {
      Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    });

    it('checks iOS permission set', async () => {
      mockCheckMultiple.mockResolvedValue({
        [PERMISSIONS.IOS.CAMERA]: RESULTS.GRANTED,
        [PERMISSIONS.IOS.PHOTO_LIBRARY]: RESULTS.GRANTED,
        [PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]: RESULTS.GRANTED,
        [PERMISSIONS.IOS.MICROPHONE]: RESULTS.GRANTED,
      } as any);

      const result = await permissionsService.checkMultiplePermissions();

      expect(result.camera.granted).toBe(true);
      expect(result.notifications.granted).toBe(true);
    });

    it('skips storage permission on iOS', async () => {
      mockCheck.mockResolvedValue(RESULTS.GRANTED);

      await expect(permissionsService.requestStoragePermission()).resolves.toBe(true);
      expect(mockRequest).not.toHaveBeenCalled();
    });

    it('requestEssentialPermissions succeeds when all granted', async () => {
      mockRequestMultiple.mockResolvedValue({
        [PERMISSIONS.IOS.CAMERA]: RESULTS.GRANTED,
        [PERMISSIONS.IOS.PHOTO_LIBRARY]: RESULTS.GRANTED,
        [PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]: RESULTS.GRANTED,
        [PERMISSIONS.IOS.MICROPHONE]: RESULTS.GRANTED,
      } as any);

      const result = await permissionsService.requestEssentialPermissions();

      expect(result).toBe(true);
      expect(Alert.alert).not.toHaveBeenCalled();
    });
  });

  describe('isPermissionGranted', () => {
    it('returns boolean grant state', async () => {
      mockCheck.mockResolvedValue(RESULTS.GRANTED);

      await expect(
        permissionsService.isPermissionGranted(PERMISSIONS.IOS.CAMERA),
      ).resolves.toBe(true);
    });
  });

  describe('requestPermissionWithRationale', () => {
    it('returns true when already granted', async () => {
      mockCheck.mockResolvedValue(RESULTS.GRANTED);

      const granted = await permissionsService.requestPermissionWithRationale(
        PERMISSIONS.IOS.CAMERA,
        'Camera',
        'Need camera',
      );

      expect(granted).toBe(true);
      expect(mockRequest).not.toHaveBeenCalled();
    });

    it('shows settings alert when blocked', async () => {
      mockCheck.mockResolvedValue(RESULTS.BLOCKED);

      const granted = await permissionsService.requestPermissionWithRationale(
        PERMISSIONS.IOS.CAMERA,
        'Camera',
        'Need camera',
        'Enable in settings',
      );

      expect(granted).toBe(false);
      expect(Alert.alert).toHaveBeenCalled();
    });

    it('requests permission when denied', async () => {
      mockCheck.mockResolvedValue(RESULTS.DENIED);
      mockRequest.mockResolvedValue(RESULTS.GRANTED);

      const granted = await permissionsService.requestPermissionWithRationale(
        PERMISSIONS.IOS.CAMERA,
        'Camera',
        'Need camera',
      );

      expect(granted).toBe(true);
      expect(mockRequest).toHaveBeenCalled();
    });

    it('shows rationale when denied after request', async () => {
      mockCheck.mockResolvedValue(RESULTS.DENIED);
      mockRequest.mockResolvedValue(RESULTS.DENIED);

      const granted = await permissionsService.requestPermissionWithRationale(
        PERMISSIONS.IOS.CAMERA,
        'Camera',
        'Need camera',
      );

      expect(granted).toBe(false);
      expect(Alert.alert).toHaveBeenCalled();
    });

    it('returns true when permission is null', async () => {
      const granted = await permissionsService.requestPermissionWithRationale(
        null,
        'Notifications',
        'msg',
      );

      expect(granted).toBe(true);
    });
  });

  describe('openAppSettings', () => {
    it('opens settings via permissions library', async () => {
      mockOpenSettings.mockResolvedValue();

      await permissionsService.openAppSettings();

      expect(mockOpenSettings).toHaveBeenCalled();
    });

    it('falls back to Linking when openSettings fails', async () => {
      mockOpenSettings.mockRejectedValue(new Error('fail'));
      const linking = require('react-native').Linking;
      linking.openSettings = jest.fn().mockResolvedValue(undefined);

      await permissionsService.openAppSettings();

      expect(linking.openSettings).toHaveBeenCalled();
    });
  });

  describe('convenience request methods', () => {
    beforeEach(() => {
      mockCheck.mockResolvedValue(RESULTS.GRANTED);
    });

    it('requestVideoRecordingPermissions requires camera, mic, storage', async () => {
      const result = await permissionsService.requestVideoRecordingPermissions();
      expect(result).toBe(true);
      expect(mockCheck).toHaveBeenCalled();
    });

    it('requestVideoUploadPermissions requires photo library and storage', async () => {
      const result = await permissionsService.requestVideoUploadPermissions();
      expect(result).toBe(true);
      expect(mockCheck).toHaveBeenCalledWith(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);
    });

    it('requestVideoUploadPermissions uses legacy storage on older Android', async () => {
      Object.defineProperty(Platform, 'Version', { configurable: true, value: 28 });
      mockCheck.mockResolvedValue(RESULTS.GRANTED);

      const result = await permissionsService.requestVideoUploadPermissions();

      expect(result).toBe(true);
      expect(mockCheck).toHaveBeenCalledWith(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
      expect(mockCheck).toHaveBeenCalledWith(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
    });

    it('requestEssentialPermissions alerts when not all granted', async () => {
      mockRequestMultiple.mockResolvedValue({
        [PERMISSIONS.IOS.CAMERA]: RESULTS.GRANTED,
        [PERMISSIONS.IOS.PHOTO_LIBRARY]: RESULTS.DENIED,
        [PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]: RESULTS.GRANTED,
        [PERMISSIONS.IOS.MICROPHONE]: RESULTS.GRANTED,
      } as any);

      const result = await permissionsService.requestEssentialPermissions();

      expect(result).toBe(false);
      expect(Alert.alert).toHaveBeenCalled();
    });

    it('skips notification permission below Android 13', async () => {
      Object.defineProperty(Platform, 'Version', { configurable: true, value: 32 });
      mockCheck.mockResolvedValue(RESULTS.GRANTED);

      await expect(permissionsService.requestNotificationPermission()).resolves.toBe(true);
      expect(mockRequest).not.toHaveBeenCalled();
    });

    it('skips storage permission on Android 10+', async () => {
      Object.defineProperty(Platform, 'Version', { configurable: true, value: 29 });
      mockCheck.mockResolvedValue(RESULTS.GRANTED);

      await expect(permissionsService.requestStoragePermission()).resolves.toBe(true);
      expect(mockRequest).not.toHaveBeenCalled();
    });

    it('accepts partial gallery access on Android 14 when full read is denied', async () => {
      Object.defineProperty(Platform, 'Version', { configurable: true, value: 34 });
      mockCheck
        .mockResolvedValueOnce(RESULTS.DENIED)
        .mockResolvedValueOnce(RESULTS.LIMITED);
      mockRequest.mockResolvedValue(RESULTS.DENIED);

      const result = await permissionsService.requestVideoUploadPermissions();

      expect(result).toBe(true);
      expect(mockCheck).toHaveBeenCalledWith(
        PERMISSIONS.ANDROID.READ_MEDIA_VISUAL_USER_SELECTED,
      );
    });

    it('requests notification permission on Android 13+', async () => {
      Object.defineProperty(Platform, 'Version', { configurable: true, value: 33 });
      mockCheck.mockResolvedValue(RESULTS.GRANTED);

      await expect(permissionsService.requestNotificationPermission()).resolves.toBe(true);
      expect(mockCheck).toHaveBeenCalledWith(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
    });
  });
});
