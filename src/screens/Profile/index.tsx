import React from 'react';
import {Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {VStack, HStack, Text, Box, Pressable} from '@/components';
import {useThemeColors} from '@/utils/colors';
import {useUserStore} from '@/stores';
import {i18n} from '@/services/i18n-service';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const colors = useThemeColors();
  const {user, setAuthenticated, setUser, reset} = useUserStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // Reset user store (this will clear persistent storage)
            reset();
            // Clear authentication state
            setAuthenticated(false);
            setUser(null);

            Alert.alert(
              '✅ Logged Out',
              'You have been successfully logged out. You will need to log in again to access the app.',
              [{text: 'OK', style: 'default'}],
            );
          },
        },
      ],
      {cancelable: true},
    );
  };

  return (
    <VStack
      testID="profile-screen"
      flex={1}
      style={{backgroundColor: colors.primaryBackground}}>
      {/* Custom Header with Back Button */}
      <HStack
        testID="profile-header"
        alignItems="center"
        justifyContent="space-between"
        p="$4"
        pt="$12"
        style={{backgroundColor: colors.primaryBackground}}>
        <Pressable
          testID="profile-back-button"
          onPress={() => navigation.goBack()}
          p="$2"
          borderRadius="$md"
          style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
          <Text
            testID="profile-back-arrow"
            style={{color: colors.white, fontSize: 18}}>
            ←
          </Text>
        </Pressable>
        <Text
          testID="profile-title"
          style={{
            color: colors.primaryText,
            fontSize: 20,
            fontWeight: 'bold',
            flex: 1,
            textAlign: 'center',
          }}>
          Profile
        </Text>
        <Box w="$10" />
      </HStack>

      <VStack testID="profile-content" flex={1} p="$4" space="lg">
        {/* Profile Header */}
        <VStack
          testID="profile-header-section"
          space="md"
          alignItems="center"
          pt="$6">
          <Box
            testID="profile-avatar"
            style={{
              backgroundColor: colors.accentAction,
              width: 100,
              height: 100,
              borderRadius: 50,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {user?.profileImage ? (
              <Text
                testID="profile-avatar-initial"
                style={{color: colors.white, fontSize: 40}}>
                {user.firstName?.charAt(0) || 'U'}
              </Text>
            ) : (
              <Text
                testID="profile-avatar-icon"
                style={{color: colors.white, fontSize: 40}}>
                👤
              </Text>
            )}
          </Box>
          <VStack testID="profile-user-info" space="sm" alignItems="center">
            <Text
              testID="profile-user-name"
              style={{
                color: colors.primaryText,
                fontSize: 24,
                fontWeight: 'bold',
              }}>
              {user?.firstName
                ? `${user.firstName} ${user.lastName || ''}`.trim()
                : 'User'}
            </Text>
            <Text
              testID="profile-user-email"
              style={{color: colors.mutedText, fontSize: 16}}>
              {user?.email || 'user@example.com'}
            </Text>
            <Text
              testID="profile-user-mobile"
              style={{color: colors.mutedText, fontSize: 14}}>
              {user?.mobile || '+91 XXXXXXXXXX'}
            </Text>
          </VStack>
        </VStack>

        {/* User Information */}
        <VStack testID="profile-account-info" space="md" pt="$6">
          <Text
            testID="profile-account-title"
            style={{
              color: colors.primaryText,
              fontSize: 18,
              fontWeight: 'bold',
            }}>
            Account Information
          </Text>

          {user?.state && (
            <HStack
              testID="profile-location-row"
              justifyContent="space-between"
              alignItems="center">
              <Text
                testID="profile-location-label"
                style={{color: colors.mutedText, fontSize: 16}}>
                Location:
              </Text>
              <Text
                testID="profile-location-value"
                style={{color: colors.primaryText, fontSize: 16}}>
                {user.city}, {user.state}
              </Text>
            </HStack>
          )}

          {user?.pincode && (
            <HStack
              testID="profile-pincode-row"
              justifyContent="space-between"
              alignItems="center">
              <Text
                testID="profile-pincode-label"
                style={{color: colors.mutedText, fontSize: 16}}>
                Pincode:
              </Text>
              <Text
                testID="profile-pincode-value"
                style={{color: colors.primaryText, fontSize: 16}}>
                {user.pincode}
              </Text>
            </HStack>
          )}

          <HStack
            testID="profile-status-row"
            justifyContent="space-between"
            alignItems="center">
            <Text
              testID="profile-status-label"
              style={{color: colors.mutedText, fontSize: 16}}>
              Status:
            </Text>
            <Text
              testID="profile-status-value"
              style={{
                color: user?.isVerified
                  ? colors.accentAction
                  : colors.mutedText,
                fontSize: 16,
              }}>
              {user?.isVerified ? '✅ Verified' : '⏳ Pending'}
            </Text>
          </HStack>
        </VStack>

        {/* Action Buttons */}
        <VStack
          testID="profile-actions"
          space="md"
          flex={1}
          justifyContent="flex-end"
          pb="$6">
          <Pressable
            testID="profile-permissions-button"
            onPress={() => navigation.navigate('Permissions' as never)}
            style={{
              backgroundColor: colors.accentAction,
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 24,
              alignItems: 'center',
            }}>
            <Text
              testID="profile-permissions-text"
              style={{color: colors.white, fontSize: 18, fontWeight: 'bold'}}>
              Manage Permissions
            </Text>
          </Pressable>

          <Pressable
            testID="profile-logout-button"
            onPress={handleLogout}
            style={{
              backgroundColor: '#FF3B30',
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 24,
              alignItems: 'center',
            }}>
            <Text
              testID="profile-logout-text"
              style={{color: colors.white, fontSize: 18, fontWeight: 'bold'}}>
              Logout
            </Text>
          </Pressable>
        </VStack>
      </VStack>
    </VStack>
  );
};

export default ProfileScreen;
