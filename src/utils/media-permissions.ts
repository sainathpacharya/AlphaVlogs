import {Platform} from 'react-native';
import {PERMISSIONS} from 'react-native-permissions';

export type PermissionConstant =
  | (typeof PERMISSIONS.IOS)[keyof typeof PERMISSIONS.IOS]
  | (typeof PERMISSIONS.ANDROID)[keyof typeof PERMISSIONS.ANDROID];

/** Android API level from React Native (number on Android). */
export function getAndroidApiLevel(): number {
  if (Platform.OS !== 'android') {
    return 0;
  }

  const version = Platform.Version;
  if (typeof version === 'number') {
    return version;
  }

  const parsed = Number.parseInt(String(version), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/** True when the OS granted full, partial, or limited access. */
export function isPermissionSatisfied(status: {
  granted: boolean;
  limited?: boolean;
}): boolean {
  return status.granted || status.limited === true;
}

/**
 * Runtime read permissions needed to pick videos from the gallery.
 *
 * Android 13+ (API 33): READ_MEDIA_VIDEO
 * Android 10–12 (API 29–32): READ_EXTERNAL_STORAGE (scoped storage)
 * Android 7–9 (API 24–28): READ_EXTERNAL_STORAGE (+ WRITE for legacy devices)
 */
export function getAndroidVideoGalleryPermissions(): PermissionConstant[] {
  const apiLevel = getAndroidApiLevel();

  if (apiLevel >= 33) {
    return [PERMISSIONS.ANDROID.READ_MEDIA_VIDEO];
  }

  if (apiLevel >= 29) {
    return [PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE];
  }

  return [
    PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
  ];
}

/** Android 14+ partial gallery access after the system photo picker. */
export function getAndroidPartialGalleryPermission(): PermissionConstant | null {
  return getAndroidApiLevel() >= 34
    ? PERMISSIONS.ANDROID.READ_MEDIA_VISUAL_USER_SELECTED
    : null;
}

/** POST_NOTIFICATIONS is only a runtime permission from Android 13+. */
export function getAndroidNotificationPermission(): PermissionConstant | null {
  return getAndroidApiLevel() >= 33
    ? PERMISSIONS.ANDROID.POST_NOTIFICATIONS
    : null;
}

/** iOS photo-library read permission used for picking videos. */
export function getIosPhotoLibraryPermission(): PermissionConstant {
  return PERMISSIONS.IOS.PHOTO_LIBRARY;
}
