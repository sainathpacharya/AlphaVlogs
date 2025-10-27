import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { permissionsService, PermissionResult, PermissionStatus } from '../services/permissions-service';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<PermissionResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Load permissions on mount
  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const result = await permissionsService.checkMultiplePermissions();
      setPermissions(result);
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPermissions = useCallback(async () => {
    await loadPermissions();
  }, [loadPermissions]);

  const requestPermission = useCallback(async (permissionType: keyof PermissionResult) => {
    try {
      let granted = false;
      
      switch (permissionType) {
        case 'camera':
          granted = await permissionsService.requestCameraPermission();
          break;
        case 'photoLibrary':
          granted = await permissionsService.requestPhotoLibraryPermission();
          break;
        case 'storage':
          granted = await permissionsService.requestStoragePermission();
          break;
        case 'location':
          granted = await permissionsService.requestLocationPermission();
          break;
        case 'microphone':
          granted = await permissionsService.requestMicrophonePermission();
          break;
        case 'notifications':
          granted = await permissionsService.requestNotificationPermission();
          break;
      }
      
      if (granted) {
        await refreshPermissions();
      }
      
      return granted;
    } catch (error) {
      console.error(`Error requesting ${permissionType} permission:`, error);
      return false;
    }
  }, [refreshPermissions]);

  const requestVideoRecordingPermissions = useCallback(async () => {
    try {
      const granted = await permissionsService.requestVideoRecordingPermissions();
      if (granted) {
        await refreshPermissions();
      }
      return granted;
    } catch (error) {
      console.error('Error requesting video recording permissions:', error);
      return false;
    }
  }, [refreshPermissions]);

  const requestVideoUploadPermissions = useCallback(async () => {
    try {
      const granted = await permissionsService.requestVideoUploadPermissions();
      if (granted) {
        await refreshPermissions();
      }
      return granted;
    } catch (error) {
      console.error('Error requesting video upload permissions:', error);
      return false;
    }
  }, [refreshPermissions]);

  const requestEssentialPermissions = useCallback(async () => {
    try {
      const granted = await permissionsService.requestEssentialPermissions();
      if (granted) {
        await refreshPermissions();
      }
      return granted;
    } catch (error) {
      console.error('Error requesting essential permissions:', error);
      return false;
    }
  }, [refreshPermissions]);

  const openSettings = useCallback(async () => {
    await permissionsService.openAppSettings();
  }, []);

  const hasPermission = useCallback((permissionType: keyof PermissionResult) => {
    if (!permissions) return false;
    return permissions[permissionType]?.granted || false;
  }, [permissions]);

  const isPermissionBlocked = useCallback((permissionType: keyof PermissionResult) => {
    if (!permissions) return false;
    return permissions[permissionType]?.blocked || false;
  }, [permissions]);

  const isPermissionUnavailable = useCallback((permissionType: keyof PermissionResult) => {
    if (!permissions) return false;
    return permissions[permissionType]?.unavailable || false;
  }, [permissions]);

  const getPermissionStatus = useCallback((permissionType: keyof PermissionResult): PermissionStatus | null => {
    if (!permissions) return null;
    return permissions[permissionType] || null;
  }, [permissions]);

  // Check if all essential permissions are granted
  const hasEssentialPermissions = useCallback(() => {
    if (!permissions) return false;
    return (
      permissions.camera?.granted &&
      permissions.photoLibrary?.granted &&
      permissions.storage?.granted
    );
  }, [permissions]);

  // Check if video recording permissions are granted
  const hasVideoRecordingPermissions = useCallback(() => {
    if (!permissions) return false;
    return (
      permissions.camera?.granted &&
      permissions.microphone?.granted &&
      permissions.storage?.granted
    );
  }, [permissions]);

  // Check if video upload permissions are granted
  const hasVideoUploadPermissions = useCallback(() => {
    if (!permissions) return false;
    return (
      permissions.photoLibrary?.granted &&
      permissions.storage?.granted
    );
  }, [permissions]);

  return {
    // State
    permissions,
    loading,
    
    // Actions
    requestPermission,
    requestVideoRecordingPermissions,
    requestVideoUploadPermissions,
    requestEssentialPermissions,
    refreshPermissions,
    openSettings,
    
    // Getters
    hasPermission,
    isPermissionBlocked,
    isPermissionUnavailable,
    getPermissionStatus,
    hasEssentialPermissions,
    hasVideoRecordingPermissions,
    hasVideoUploadPermissions,
    
    // Platform info
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
  };
};
