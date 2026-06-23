import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePermissions } from '../../src/hooks/usePermissions';
import { permissionsService } from '../../src/services/permissions-service';

jest.mock('../../src/services/permissions-service', () => ({
  permissionsService: {
    checkMultiplePermissions: jest.fn(),
    requestCameraPermission: jest.fn(),
    requestPhotoLibraryPermission: jest.fn(),
    requestStoragePermission: jest.fn(),
    requestLocationPermission: jest.fn(),
    requestMicrophonePermission: jest.fn(),
    requestNotificationPermission: jest.fn(),
    requestVideoRecordingPermissions: jest.fn(),
    requestVideoUploadPermissions: jest.fn(),
    requestEssentialPermissions: jest.fn(),
    openAppSettings: jest.fn(),
  },
}));

const mockPermissions = permissionsService as jest.Mocked<typeof permissionsService>;

const grantedResult = {
  camera: { granted: true, blocked: false, unavailable: false },
  photoLibrary: { granted: true, blocked: false, unavailable: false },
  storage: { granted: true, blocked: false, unavailable: false },
  location: { granted: false, blocked: false, unavailable: false },
  microphone: { granted: true, blocked: false, unavailable: false },
  notifications: { granted: false, blocked: true, unavailable: false },
};

describe('usePermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPermissions.checkMultiplePermissions.mockResolvedValue(grantedResult);
  });

  it('loads permissions on mount', async () => {
    const { result } = renderHook(() => usePermissions());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.permissions).toEqual(grantedResult);
    expect(mockPermissions.checkMultiplePermissions).toHaveBeenCalled();
  });

  it('reports platform flags', async () => {
    const { result } = renderHook(() => usePermissions());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(typeof result.current.isIOS).toBe('boolean');
    expect(typeof result.current.isAndroid).toBe('boolean');
  });

  it('hasPermission and status helpers', async () => {
    const { result } = renderHook(() => usePermissions());

    await waitFor(() => expect(result.current.permissions).not.toBeNull());

    expect(result.current.hasPermission('camera')).toBe(true);
    expect(result.current.isPermissionBlocked('notifications')).toBe(true);
    expect(result.current.getPermissionStatus('location')?.granted).toBe(false);
    expect(result.current.hasEssentialPermissions()).toBe(true);
    expect(result.current.hasVideoRecordingPermissions()).toBe(true);
    expect(result.current.hasVideoUploadPermissions()).toBe(true);
  });

  it('requests single permission and refreshes', async () => {
    mockPermissions.requestCameraPermission.mockResolvedValue(true);

    const { result } = renderHook(() => usePermissions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let granted = false;
    await act(async () => {
      granted = await result.current.requestPermission('camera');
    });

    expect(granted).toBe(true);
    expect(mockPermissions.requestCameraPermission).toHaveBeenCalled();
    expect(mockPermissions.checkMultiplePermissions).toHaveBeenCalledTimes(2);
  });

  it('requests video recording permissions', async () => {
    mockPermissions.requestVideoRecordingPermissions.mockResolvedValue(true);

    const { result } = renderHook(() => usePermissions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.requestVideoRecordingPermissions();
    });

    expect(mockPermissions.requestVideoRecordingPermissions).toHaveBeenCalled();
  });

  it('requests each permission type via switch', async () => {
    mockPermissions.requestPhotoLibraryPermission.mockResolvedValue(true);
    mockPermissions.requestStoragePermission.mockResolvedValue(true);
    mockPermissions.requestLocationPermission.mockResolvedValue(true);
    mockPermissions.requestMicrophonePermission.mockResolvedValue(true);
    mockPermissions.requestNotificationPermission.mockResolvedValue(true);
    mockPermissions.requestVideoUploadPermissions.mockResolvedValue(true);
    mockPermissions.requestEssentialPermissions.mockResolvedValue(true);

    const { result } = renderHook(() => usePermissions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    for (const type of [
      'photoLibrary',
      'storage',
      'location',
      'microphone',
      'notifications',
    ] as const) {
      await act(async () => {
        await result.current.requestPermission(type);
      });
    }

    await act(async () => {
      await result.current.requestVideoUploadPermissions();
      await result.current.requestEssentialPermissions();
      await result.current.refreshPermissions();
    });

    expect(mockPermissions.requestPhotoLibraryPermission).toHaveBeenCalled();
    expect(mockPermissions.requestEssentialPermissions).toHaveBeenCalled();
  });

  it('handles permission load errors gracefully', async () => {
    mockPermissions.checkMultiplePermissions.mockRejectedValueOnce(new Error('load failed'));

    const { result } = renderHook(() => usePermissions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.permissions).toBeNull();
  });

  it('returns false when permission request throws', async () => {
    mockPermissions.requestCameraPermission.mockRejectedValue(new Error('denied'));

    const { result } = renderHook(() => usePermissions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let granted = true;
    await act(async () => {
      granted = await result.current.requestPermission('camera');
    });

    expect(granted).toBe(false);
  });

  it('opens app settings', async () => {
    const { result } = renderHook(() => usePermissions());

    await act(async () => {
      await result.current.openSettings();
    });

    expect(mockPermissions.openAppSettings).toHaveBeenCalled();
  });

  it('returns false from helpers when permissions are null', () => {
    mockPermissions.checkMultiplePermissions.mockImplementation(
      () => new Promise(() => {}),
    );

    const { result } = renderHook(() => usePermissions());

    expect(result.current.hasPermission('camera')).toBe(false);
    expect(result.current.hasEssentialPermissions()).toBe(false);
    expect(result.current.isPermissionUnavailable('camera')).toBe(false);
    expect(result.current.getPermissionStatus('camera')).toBeNull();
  });

  it('returns false when bundled permission requests throw', async () => {
    mockPermissions.requestVideoRecordingPermissions.mockRejectedValue(new Error('denied'));
    mockPermissions.requestVideoUploadPermissions.mockRejectedValue(new Error('denied'));
    mockPermissions.requestEssentialPermissions.mockRejectedValue(new Error('denied'));

    const { result } = renderHook(() => usePermissions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      expect(await result.current.requestVideoRecordingPermissions()).toBe(false);
      expect(await result.current.requestVideoUploadPermissions()).toBe(false);
      expect(await result.current.requestEssentialPermissions()).toBe(false);
    });
  });

  it('does not refresh when single permission request is denied', async () => {
    mockPermissions.requestCameraPermission.mockResolvedValue(false);

    const { result } = renderHook(() => usePermissions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      expect(await result.current.requestPermission('camera')).toBe(false);
    });

    expect(mockPermissions.checkMultiplePermissions).toHaveBeenCalledTimes(1);
  });
});
