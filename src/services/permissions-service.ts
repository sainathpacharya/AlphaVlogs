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

class PermissionsService {
  // Define required permissions for each platform
  private getRequiredPermissions() {
    if (Platform.OS === 'ios') {
      return [
        PERMISSIONS.IOS.CAMERA,
        PERMISSIONS.IOS.PHOTO_LIBRARY,
        PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        PERMISSIONS.IOS.MICROPHONE,
        // PERMISSIONS.IOS.NOTIFICATIONS, // Not available in this version
      ];
    } else {
      return [
        PERMISSIONS.ANDROID.CAMERA,
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.RECORD_AUDIO,
        PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
      ];
    }
  }

  // Check a single permission
  async checkPermission(permission: any): Promise<PermissionStatus> {
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
  async requestPermission(permission: any): Promise<PermissionStatus> {
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

  // Check multiple permissions at once
  async checkMultiplePermissions(): Promise<PermissionResult> {
    const permissions = this.getRequiredPermissions();

    try {
      const results = await checkMultiple(permissions);

      return {
        camera: this.mapPermissionResult(results[permissions[0]!] || RESULTS.UNAVAILABLE),
        photoLibrary: this.mapPermissionResult(results[permissions[1]!] || RESULTS.UNAVAILABLE),
        storage: this.mapPermissionResult(results[permissions[2]!] || RESULTS.UNAVAILABLE),
        location: this.mapPermissionResult(results[permissions[3]!] || RESULTS.UNAVAILABLE),
        microphone: this.mapPermissionResult(results[permissions[4]!] || RESULTS.UNAVAILABLE),
        notifications: this.mapPermissionResult(results[permissions[5]!] || RESULTS.UNAVAILABLE),
      };
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

      return {
        camera: this.mapPermissionResult(results[permissions[0]!] || RESULTS.UNAVAILABLE),
        photoLibrary: this.mapPermissionResult(results[permissions[1]!] || RESULTS.UNAVAILABLE),
        storage: this.mapPermissionResult(results[permissions[2]!] || RESULTS.UNAVAILABLE),
        location: this.mapPermissionResult(results[permissions[3]!] || RESULTS.UNAVAILABLE),
        microphone: this.mapPermissionResult(results[permissions[4]!] || RESULTS.UNAVAILABLE),
        notifications: this.mapPermissionResult(results[permissions[5]!] || RESULTS.UNAVAILABLE),
      };
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
  async isPermissionGranted(permission: string): Promise<boolean> {
    const status = await this.checkPermission(permission);
    return status.granted;
  }

  // Request permission with user-friendly messaging
  async requestPermissionWithRationale(
    permission: any,
    title: string,
    message: string,
    settingsMessage?: string
  ): Promise<boolean> {
    if (!permission) {return true;} // Skip if permission not available
    const status = await this.checkPermission(permission);

    if (status.granted) {
      return true;
    }

    if (status.blocked) {
      // Permission is blocked, show settings dialog
      Alert.alert(
        title,
        settingsMessage || 'This permission is required. Please enable it in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => this.openAppSettings() },
        ]
      );
      return false;
    }

    // Request permission
    const requestResult = await this.requestPermission(permission);

    if (!requestResult.granted && !requestResult.blocked) {
      // Show rationale if permission was denied
      Alert.alert(
        title,
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Try Again', onPress: () => this.requestPermissionWithRationale(permission, title, message, settingsMessage) },
        ]
      );
    }

    return requestResult.granted;
  }

  // Open app settings
  async openAppSettings(): Promise<void> {
    try {
      await openSettings();
    } catch (error) {
      console.error('Error opening settings:', error);
      // Fallback to system settings
      Linking.openSettings();
    }
  }

  // Check and request camera permission
  async requestCameraPermission(): Promise<boolean> {
    return this.requestPermissionWithRationale(
      Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA,
      'Camera Permission',
      'Alpha Vlogs needs camera access to record videos for talent show events.',
      'Camera permission is required for video recording. Please enable it in Settings.'
    );
  }

  // Check and request photo library permission
  async requestPhotoLibraryPermission(): Promise<boolean> {
    return this.requestPermissionWithRationale(
      Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      'Photo Library Permission',
      'Alpha Vlogs needs photo library access to select and upload videos.',
      'Photo library access is required to select videos. Please enable it in Settings.'
    );
  }

  // Check and request storage permission
  async requestStoragePermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      // iOS doesn't have explicit storage permission
      return true;
    }

    return this.requestPermissionWithRationale(
      PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      'Storage Permission',
      'Alpha Vlogs needs storage access to save and upload videos.',
      'Storage permission is required to access videos. Please enable it in Settings.'
    );
  }

  // Check and request location permission
  async requestLocationPermission(): Promise<boolean> {
    return this.requestPermissionWithRationale(
      Platform.OS === 'ios' ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      'Location Permission',
      'Alpha Vlogs uses location to provide school-specific features and event recommendations.',
      'Location permission is required for school-based features. Please enable it in Settings.'
    );
  }

  // Check and request microphone permission
  async requestMicrophonePermission(): Promise<boolean> {
    return this.requestPermissionWithRationale(
      Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO,
      'Microphone Permission',
      'Alpha Vlogs needs microphone access to record audio for videos.',
      'Microphone permission is required for video recording. Please enable it in Settings.'
    );
  }

  // Check and request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    return this.requestPermissionWithRationale(
      Platform.OS === 'ios' ? null : PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
      'Notification Permission',
      'Alpha Vlogs sends notifications for new events, quiz reminders, and results updates.',
      'Notification permission is required for app updates. Please enable it in Settings.'
    );
  }

  // Request all permissions needed for video recording
  async requestVideoRecordingPermissions(): Promise<boolean> {
    const cameraGranted = await this.requestCameraPermission();
    const microphoneGranted = await this.requestMicrophonePermission();
    const storageGranted = await this.requestStoragePermission();

    return cameraGranted && microphoneGranted && storageGranted;
  }

  // Request all permissions needed for video upload
  async requestVideoUploadPermissions(): Promise<boolean> {
    const photoLibraryGranted = await this.requestPhotoLibraryPermission();
    const storageGranted = await this.requestStoragePermission();

    return photoLibraryGranted && storageGranted;
  }

  // Request all essential permissions
  async requestEssentialPermissions(): Promise<boolean> {
    const results = await this.requestMultiplePermissions();

    // Essential permissions are camera, photo library, and storage
    const essentialGranted =
      results.camera.granted &&
      results.photoLibrary.granted &&
      results.storage.granted;

    if (!essentialGranted) {
      Alert.alert(
        'Permissions Required',
        'Some essential permissions were not granted. This may limit app functionality.',
        [
          { text: 'OK', style: 'default' },
          { text: 'Open Settings', onPress: () => this.openAppSettings() },
        ]
      );
    }

    return essentialGranted;
  }
}

export const permissionsService = new PermissionsService();
export default permissionsService;
