import {Platform} from 'react-native';
import {PERMISSIONS} from 'react-native-permissions';
import {
  getAndroidApiLevel,
  getAndroidNotificationPermission,
  getAndroidPartialGalleryPermission,
  getAndroidVideoGalleryPermissions,
  getIosPhotoLibraryPermission,
  isPermissionSatisfied,
} from '../../src/utils/media-permissions';

describe('media-permissions', () => {
  const setAndroidApi = (api: number) => {
    Object.defineProperty(Platform, 'OS', {configurable: true, value: 'android'});
    Object.defineProperty(Platform, 'Version', {configurable: true, value: api});
  };

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', {configurable: true, value: 'ios'});
    Object.defineProperty(Platform, 'Version', {configurable: true, value: '17.0'});
  });

  it('reads Android API level from Platform.Version', () => {
    setAndroidApi(33);
    expect(getAndroidApiLevel()).toBe(33);
  });

  it('returns zero on non-Android platforms', () => {
    Object.defineProperty(Platform, 'OS', {configurable: true, value: 'ios'});
    expect(getAndroidApiLevel()).toBe(0);
  });

  it('parses string Android API versions and falls back for invalid values', () => {
    Object.defineProperty(Platform, 'OS', {configurable: true, value: 'android'});
    Object.defineProperty(Platform, 'Version', {configurable: true, value: '31'});
    expect(getAndroidApiLevel()).toBe(31);

    Object.defineProperty(Platform, 'Version', {configurable: true, value: 'invalid'});
    expect(getAndroidApiLevel()).toBe(0);
  });

  it('uses READ_MEDIA_VIDEO on Android 13+', () => {
    setAndroidApi(33);
    expect(getAndroidVideoGalleryPermissions()).toEqual([
      PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
    ]);

    setAndroidApi(35);
    expect(getAndroidVideoGalleryPermissions()).toEqual([
      PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
    ]);
  });

  it('uses READ_EXTERNAL_STORAGE on Android 10–12', () => {
    setAndroidApi(29);
    expect(getAndroidVideoGalleryPermissions()).toEqual([
      PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    ]);

    setAndroidApi(32);
    expect(getAndroidVideoGalleryPermissions()).toEqual([
      PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    ]);
  });

  it('uses legacy read/write storage on Android 7–9', () => {
    setAndroidApi(24);
    expect(getAndroidVideoGalleryPermissions()).toEqual([
      PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
    ]);
  });

  it('exposes partial gallery permission only on Android 14+', () => {
    setAndroidApi(33);
    expect(getAndroidPartialGalleryPermission()).toBeNull();

    setAndroidApi(34);
    expect(getAndroidPartialGalleryPermission()).toBe(
      PERMISSIONS.ANDROID.READ_MEDIA_VISUAL_USER_SELECTED,
    );
  });

  it('exposes notification permission only on Android 13+', () => {
    setAndroidApi(32);
    expect(getAndroidNotificationPermission()).toBeNull();

    setAndroidApi(33);
    expect(getAndroidNotificationPermission()).toBe(
      PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
    );
  });

  it('treats limited iOS photo access as satisfied', () => {
    expect(isPermissionSatisfied({granted: false, blocked: false, unavailable: false, limited: true})).toBe(true);
    expect(isPermissionSatisfied({granted: true, blocked: false, unavailable: false})).toBe(true);
    expect(isPermissionSatisfied({granted: false, blocked: false, unavailable: false})).toBe(false);
  });

  it('uses iOS photo library permission constant', () => {
    expect(getIosPhotoLibraryPermission()).toBe(PERMISSIONS.IOS.PHOTO_LIBRARY);
  });
});
