import React from 'react';
import {ScrollView, Alert} from 'react-native';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  StatusBar,
  Heading,
  Divider,
  Pressable,
} from '../../components';
import {useThemeColors} from '../../utils/colors';
import {usePermissions} from '../../hooks/usePermissions';
import {useNavigation} from '@react-navigation/native';

const PermissionItem: React.FC<{
  title: string;
  description: string;
  status: 'granted' | 'denied' | 'blocked' | 'unavailable';
  onRequest: () => void;
  onSettings?: () => void;
  colors: any;
}> = ({title, description, status, onRequest, onSettings, colors}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'granted':
        return colors.success;
      case 'denied':
        return colors.warning;
      case 'blocked':
        return colors.error;
      case 'unavailable':
        return colors.mutedText;
      default:
        return colors.mutedText;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'granted':
        return 'Granted';
      case 'denied':
        return 'Denied';
      case 'blocked':
        return 'Blocked';
      case 'unavailable':
        return 'Unavailable';
      default:
        return 'Unknown';
    }
  };

  const getActionButton = () => {
    if (status === 'granted') {
      return (
        <Text style={{color: colors.success, fontWeight: 'bold'}}>
          ✓ Granted
        </Text>
      );
    }

    if (status === 'blocked') {
      return (
        <Button
          size="sm"
          variant="outline"
          onPress={onSettings}
          style={{borderColor: colors.accentAction}}>
          <Text style={{color: colors.accentAction}}>Open Settings</Text>
        </Button>
      );
    }

    return (
      <Button
        size="sm"
        onPress={onRequest}
        style={{backgroundColor: colors.accentAction}}>
        <Text style={{color: colors.white}}>Grant Permission</Text>
      </Button>
    );
  };

  return (
    <Box
      style={{
        backgroundColor: colors.cardBackground,
        padding: 16,
        borderRadius: 12,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: colors.border,
      }}>
      <HStack justifyContent="space-between" alignItems="center" mb={2}>
        <Text
          style={{
            color: colors.primaryText,
            fontSize: 16,
            fontWeight: 'bold',
          }}>
          {title}
        </Text>
        <Text
          style={{
            color: getStatusColor(),
            fontSize: 12,
            fontWeight: 'bold',
          }}>
          {getStatusText()}
        </Text>
      </HStack>

      <Text
        style={{
          color: colors.secondaryText,
          fontSize: 14,
          marginBottom: 16,
        }}>
        {description}
      </Text>

      <HStack justifyContent="flex-end">{getActionButton()}</HStack>
    </Box>
  );
};

const PermissionsScreen: React.FC = () => {
  const colors = useThemeColors();
  const navigation = useNavigation();
  const {
    permissions,
    loading,
    requestPermission,
    openSettings,
    refreshPermissions,
    hasPermission,
    isPermissionBlocked,
    isPermissionUnavailable,
  } = usePermissions();

  const handleRequestPermission = async (permissionType: string) => {
    try {
      const granted = await requestPermission(permissionType as any);
      if (granted) {
        Alert.alert('Success', 'Permission granted successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request permission. Please try again.');
    }
  };

  const handleOpenSettings = () => {
    openSettings();
  };

  const handleRefresh = () => {
    refreshPermissions();
  };

  const getPermissionStatus = (permissionType: string) => {
    if (loading) return 'unavailable';
    if (hasPermission(permissionType as any)) return 'granted';
    if (isPermissionBlocked(permissionType as any)) return 'blocked';
    if (isPermissionUnavailable(permissionType as any)) return 'unavailable';
    return 'denied';
  };

  const permissionItems = [
    {
      key: 'camera',
      title: 'Camera',
      description: 'Required to record videos for talent show events',
    },
    {
      key: 'photoLibrary',
      title: 'Photo Library',
      description: 'Required to select and upload existing videos',
    },
    {
      key: 'storage',
      title: 'Storage',
      description: 'Required to save and access video files',
    },
    {
      key: 'microphone',
      title: 'Microphone',
      description: 'Required to record audio for videos',
    },
    {
      key: 'location',
      title: 'Location',
      description: 'Used for school-specific features and recommendations',
    },
    {
      key: 'notifications',
      title: 'Notifications',
      description: 'Sends updates about events, quizzes, and results',
    },
  ];

  return (
    <Box style={{flex: 1, backgroundColor: colors.primaryBackground}}>
      <StatusBar
        barStyle={
          colors.primaryBackground === '#000000'
            ? 'light-content'
            : 'dark-content'
        }
        backgroundColor={colors.primaryBackground}
      />

      {/* Header */}
      <Box
        style={{
          backgroundColor: colors.cardBackground,
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
        <HStack alignItems="center" mb={16}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.accentBackground,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}>
            <Text style={{color: colors.accentAction, fontSize: 18}}>←</Text>
          </Pressable>

          <VStack flex={1}>
            <Heading size="lg" style={{color: colors.primaryText}}>
              Permissions
            </Heading>
            <Text style={{color: colors.secondaryText, fontSize: 14}}>
              Manage app permissions
            </Text>
          </VStack>
        </HStack>
      </Box>

      <ScrollView style={{flex: 1}} contentContainerStyle={{padding: 16}}>
        {/* Info Section */}
        <Box
          style={{
            backgroundColor: colors.accentBackground,
            padding: 16,
            borderRadius: 12,
            marginBottom: 24,
            borderLeftWidth: 4,
            borderLeftColor: colors.accentAction,
          }}>
          <Text
            style={{
              color: colors.primaryText,
              fontSize: 16,
              fontWeight: 'bold',
              marginBottom: 8,
            }}>
            Why do we need these permissions?
          </Text>
          <Text
            style={{
              color: colors.secondaryText,
              fontSize: 14,
              lineHeight: 20,
            }}>
            JackMarvelsApp needs these permissions to provide you with the best
            experience. Camera and microphone are essential for recording talent
            show videos, while storage access allows you to upload existing
            videos and save new ones.
          </Text>
        </Box>

        {/* Permissions List */}
        <VStack space="md">
          {permissionItems.map(item => (
            <PermissionItem
              key={item.key}
              title={item.title}
              description={item.description}
              status={getPermissionStatus(item.key)}
              onRequest={() => handleRequestPermission(item.key)}
              onSettings={handleOpenSettings}
              colors={colors}
            />
          ))}
        </VStack>

        <Divider style={{marginVertical: 24, backgroundColor: colors.border}} />

        {/* Action Buttons */}
        <VStack space="md">
          <Button
            onPress={handleRefresh}
            style={{backgroundColor: colors.accentAction}}
            disabled={loading}>
            <Text style={{color: colors.white, fontWeight: 'bold'}}>
              {loading ? 'Refreshing...' : 'Refresh Permissions'}
            </Text>
          </Button>

          <Button
            variant="outline"
            onPress={handleOpenSettings}
            style={{borderColor: colors.accentAction}}>
            <Text style={{color: colors.accentAction, fontWeight: 'bold'}}>
              Open App Settings
            </Text>
          </Button>
        </VStack>

        {/* Footer Info */}
        <Box
          style={{
            marginTop: 32,
            padding: 16,
            backgroundColor: colors.mutedBackground,
            borderRadius: 12,
          }}>
          <Text
            style={{
              color: colors.secondaryText,
              fontSize: 12,
              textAlign: 'center',
              lineHeight: 18,
            }}>
            If you're having trouble with permissions, try opening your device's
            Settings app and manually enabling permissions for JackMarvelsApp.
          </Text>
        </Box>
      </ScrollView>
    </Box>
  );
};

export default PermissionsScreen;
