import { Platform, Alert, Linking } from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  check,
  request,
  checkMultiple,
  requestMultiple,
  openSettings,
} from 'react-native-permissions';
import {
  getAndroidApiLevel,
  getAndroidNotificationPermission,
  getAndroidPartialGalleryPermission,
  getAndroidVideoGalleryPermissions,
  getIosPhotoLibraryPermission,
  isPermissionSatisfied,
} from '@/utils/media-permissions';

export interface PermissionStatus {
  granted: boolean;
  blocked: boolean;
  unavailable: boolean;
  limited?: boolean;
}

export interface PermissionResult {
  camera: PermissionStatus;
  photoLibrary: PermissionStatus;
  storage: PermissionStatus;
  location: PermissionStatus;
  microphone: PermissionStatus;
  notifications: PermissionStatus;
}

type PermissionConstant = (typeof PERMISSIONS.IOS)[keyof typeof PERMISSIONS.IOS]
  | (typeof PERMISSIONS.ANDROID)[keyof typeof PERMISSIONS.ANDROID];

class PermissionsService {
  private getRequiredPermissions(): PermissionConstant[] {
    if (Platform.OS === 'ios') {
      return [
        PERMISSIONS.IOS.CAMERA,
        PERMISSIONS.IOS.PHOTO_LIBRARY,
        PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        PERMISSIONS.IOS.MICROPHONE,
      ];
    }

    const permissions: PermissionConstant[] = [
      PERMISSIONS.ANDROID.CAMERA,
      ...getAndroidVideoGalleryPermissions(),
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.ANDROID.RECORD_AUDIO,
    ];

    const notificationPermission = getAndroidNotificationPermission();
    if (notificationPermission) {
      permissions.push(notificationPermission as PermissionConstant);
    }

    return permissions;
  }

  // Check a single permission
  async checkPermission(permission: PermissionConstant | null): Promise<PermissionStatus> {
    if (!permission) {
      return { granted: true, blocked: false, unavailable: false };
    }

    try {
      const result = await check(permission);

      return {
        granted: result === RESULTS.GRANTED,
        blocked: result === RESULTS.BLOCKED,
        unavailable: result === RESULTS.UNAVAILABLE,
        limited: result === RESULTS.LIMITED,
      };
    } catch (error) {
      console.error(`Error checking permission ${permission}:`, error);
      return {
        granted: false,
        blocked: false,
        unavailable: true,
      };
    }
  }

  // Request a single permission
  async requestPermission(permission: PermissionConstant | null): Promise<PermissionStatus> {
    if (!permission) {
      return { granted: true, blocked: false, unavailable: false };
    }

    try {
      const result = await request(permission);

      return {
        granted: result === RESULTS.GRANTED,
        blocked: result === RESULTS.BLOCKED,
        unavailable: result === RESULTS.UNAVAILABLE,
        limited: result === RESULTS.LIMITED,
      };
    } catch (error) {
      console.error(`Error requesting permission ${permission}:`, error);
      return {
        granted: false,
        blocked: false,
        unavailable: true,
      };
    }
  }

  private mapMultipleResults(
    permissions: PermissionConstant[],
    results: Record<string, string>,
  ): PermissionResult {
    const readPermission = getAndroidVideoGalleryPermissions()[0];
    const notificationPermission = getAndroidNotificationPermission();

    if (Platform.OS === 'ios') {
      return {
        camera: this.mapPermissionResult(results[PERMISSIONS.IOS.CAMERA] || RESULTS.UNAVAILABLE),
        photoLibrary: this.mapPermissionResult(results[PERMISSIONS.IOS.PHOTO_LIBRARY] || RESULTS.UNAVAILABLE),
        storage: { granted: true, blocked: false, unavailable: false },
        location: this.mapPermissionResult(results[PERMISSIONS.IOS.LOCATION_WHEN_IN_USE] || RESULTS.UNAVAILABLE),
        microphone: this.mapPermissionResult(results[PERMISSIONS.IOS.MICROPHONE] || RESULTS.UNAVAILABLE),
        notifications: { granted: true, blocked: false, unavailable: false },
      };
    }

    return {
      camera: this.mapPermissionResult(results[PERMISSIONS.ANDROID.CAMERA] || RESULTS.UNAVAILABLE),
      photoLibrary: this.mapPermissionResult(results[readPermission] || RESULTS.UNAVAILABLE),
      storage: this.mapPermissionResult(
        results[PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE] ||
          results[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE] ||
          results[readPermission] ||
          RESULTS.UNAVAILABLE,
      ),
      location: this.mapPermissionResult(results[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] || RESULTS.UNAVAILABLE),
      microphone: this.mapPermissionResult(results[PERMISSIONS.ANDROID.RECORD_AUDIO] || RESULTS.UNAVAILABLE),
      notifications: notificationPermission
        ? this.mapPermissionResult(results[notificationPermission] || RESULTS.UNAVAILABLE)
        : { granted: true, blocked: false, unavailable: false },
    };
  }

  // Check multiple permissions at once
  async checkMultiplePermissions(): Promise<PermissionResult> {
    const permissions = this.getRequiredPermissions();

    try {
      const results = await checkMultiple(permissions);
      return this.mapMultipleResults(permissions, results);
    } catch (error) {
      console.error('Error checking multiple permissions:', error);
      return this.getDefaultPermissionResult();
    }
  }

  // Request multiple permissions at once
  async requestMultiplePermissions(): Promise<PermissionResult> {
    const permissions = this.getRequiredPermissions();

    try {
      const results = await requestMultiple(permissions);
      return this.mapMultipleResults(permissions, results);
    } catch (error) {
      console.error('Error requesting multiple permissions:', error);
      return this.getDefaultPermissionResult();
    }
  }

  // Map permission result to our interface
  private mapPermissionResult(result: string): PermissionStatus {
    return {
      granted: result === RESULTS.GRANTED,
      blocked: result === RESULTS.BLOCKED,
      unavailable: result === RESULTS.UNAVAILABLE,
      limited: result === RESULTS.LIMITED,
    };
  }

  // Get default permission result
  private getDefaultPermissionResult(): PermissionResult {
    return {
      camera: { granted: false, blocked: false, unavailable: true },
      photoLibrary: { granted: false, blocked: false, unavailable: true },
      storage: { granted: false, blocked: false, unavailable: true },
      location: { granted: false, blocked: false, unavailable: true },
      microphone: { granted: false, blocked: false, unavailable: true },
      notifications: { granted: false, blocked: false, unavailable: true },
    };
  }

  // Check if a specific permission is granted
  async isPermissionGranted(permission: PermissionConstant | null): Promise<boolean> {
    const status = await this.checkPermission(permission);
    return isPermissionSatisfied(status);
  }

  // Request permission with user-friendly messaging
  async requestPermissionWithRationale(
    permission: PermissionConstant | null,
    title: string,
    message: string,
    settingsMessage?: string,
  ): Promise<boolean> {
    if (!permission) {
      return true;
    }

    const status = await this.checkPermission(permission);

    if (isPermissionSatisfied(status)) {
      return true;
    }

    if (status.blocked) {
      Alert.alert(
        title,
        settingsMessage || 'This permission is required. Please enable it in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => this.openAppSettings() },
        ],
      );
      return false;
    }

    const requestResult = await this.requestPermission(permission);

    if (!isPermissionSatisfied(requestResult) && !requestResult.blocked) {
      Alert.alert(
        title,
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Try Again',
            onPress: () =>
              this.requestPermissionWithRationale(permission, title, message, settingsMessage),
          },
        ],
      );
    }

    return isPermissionSatisfied(requestResult);
  }

  private async requestAndroidVideoReadPermissions(): Promise<boolean> {
    const permissions = getAndroidVideoGalleryPermissions();

    for (const permission of permissions) {
      const granted = await this.requestPermissionWithRationale(
        permission,
        'Video Access Permission',
        'Alpha Vlogs needs access to your videos so you can select a performance video from your gallery.',
        'Video access is required to select videos. Please enable it in Settings.',
      );

      if (!granted) {
        const partialPermission = getAndroidPartialGalleryPermission();
        if (partialPermission) {
          const partialStatus = await this.checkPermission(partialPermission);
          if (isPermissionSatisfied(partialStatus)) {
            return true;
          }
        }
        return false;
      }
    }

    return true;
  }

  private async requestIosPhotoLibraryReadPermission(): Promise<boolean> {
    return this.requestPermissionWithRationale(
      getIosPhotoLibraryPermission(),
      'Photo Library Permission',
      'Alpha Vlogs needs photo library access to select and upload videos.',
      'Photo library access is required to select videos. Please enable it in Settings.',
    );
  }

  // Open app settings
  async openAppSettings(): Promise<void> {
    try {
      await openSettings();
    } catch (error) {
      console.error('Error opening settings:', error);
      Linking.openSettings();
    }
  }

  // Check and request camera permission
  async requestCameraPermission(): Promise<boolean> {
    return this.requestPermissionWithRationale(
      Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA,
      'Camera Permission',
      'Alpha Vlogs needs camera access to record videos for talent show events.',
      'Camera permission is required for video recording. Please enable it in Settings.',
    );
  }

  // Check and request photo library permission
  async requestPhotoLibraryPermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      return this.requestIosPhotoLibraryReadPermission();
    }

    return this.requestAndroidVideoReadPermissions();
  }

  // Check and request storage permission
  async requestStoragePermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      return true;
    }

    const apiLevel = getAndroidApiLevel();
    if (apiLevel >= 29) {
      return true;
    }

    return this.requestPermissionWithRationale(
      PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
      'Storage Permission',
      'Alpha Vlogs needs storage access to read videos on older Android devices.',
      'Storage permission is required to access videos. Please enable it in Settings.',
    );
  }

  // Check and request location permission
  async requestLocationPermission(): Promise<boolean> {
    return this.requestPermissionWithRationale(
      Platform.OS === 'ios' ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      'Location Permission',
      'Alpha Vlogs uses location to provide school-specific features and event recommendations.',
      'Location permission is required for school-based features. Please enable it in Settings.',
    );
  }

  // Check and request microphone permission
  async requestMicrophonePermission(): Promise<boolean> {
    return this.requestPermissionWithRationale(
      Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO,
      'Microphone Permission',
      'Alpha Vlogs needs microphone access to record audio for videos.',
      'Microphone permission is required for video recording. Please enable it in Settings.',
    );
  }

  // Check and request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      return true;
    }

    const notificationPermission = getAndroidNotificationPermission();
    if (!notificationPermission) {
      return true;
    }

    return this.requestPermissionWithRationale(
      notificationPermission,
      'Notification Permission',
      'Alpha Vlogs sends notifications for new events, quiz reminders, and results updates.',
      'Notification permission is required for app updates. Please enable it in Settings.',
    );
  }

  // Request all permissions needed for video recording
  async requestVideoRecordingPermissions(): Promise<boolean> {
    const cameraGranted = await this.requestCameraPermission();
    const microphoneGranted = await this.requestMicrophonePermission();
    const storageGranted = await this.requestStoragePermission();

    return cameraGranted && microphoneGranted && storageGranted;
  }

  // Request all permissions needed for video upload (version-aware on Android)
  async requestVideoUploadPermissions(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      return this.requestIosPhotoLibraryReadPermission();
    }

    return this.requestAndroidVideoReadPermissions();
  }

  // Request all essential permissions
  async requestEssentialPermissions(): Promise<boolean> {
    const results = await this.requestMultiplePermissions();

    const essentialGranted =
      results.camera.granted &&
      isPermissionSatisfied(results.photoLibrary) &&
      (Platform.OS === 'ios' || isPermissionSatisfied(results.storage));

    if (!essentialGranted) {
      Alert.alert(
        'Permissions Required',
        'Some essential permissions were not granted. This may limit app functionality.',
        [
          { text: 'OK', style: 'default' },
          { text: 'Open Settings', onPress: () => this.openAppSettings() },
        ],
      );
    }

    return essentialGranted;
  }
}

export const permissionsService = new PermissionsService();
export default permissionsService;
