import React from 'react';
import {ActivityIndicator, Alert, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ChevronRight, LogOut, Trash2, Users} from 'lucide-react-native';
import {
  VStack,
  HStack,
  Text,
  Box,
  Pressable,
  UserAvatar,
} from '@/components';
import {APP_CONFIG} from '@/constants';
import {useThemeColors} from '@/utils/colors';
import {maskEmail, maskMobile} from '@/utils/privacy';
import {getAppVersion} from '@/utils/platform';
import {useUser, useUserStore} from '@/stores';
import {useUserCachedStore} from '@/stores/user-cached-store';
import {useDeleteAccountMutation} from '@/hooks';
import {AppStackParamList} from '@/navigation/AppStack/types';

type ProfileNav = NativeStackNavigationProp<AppStackParamList, 'Profile'>;

type ProfileColors = ReturnType<typeof useThemeColors>;

type ProfileSectionProps = {
  title?: string;
  testID?: string;
  colors: ProfileColors;
  children: React.ReactNode;
};

const ProfileSection = ({title, testID, colors, children}: ProfileSectionProps) => (
  <VStack testID={testID} space="sm" mb="$4">
    {title ? (
      <Text
        style={{
          color: colors.mutedText,
          fontSize: 13,
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          paddingHorizontal: 4,
        }}>
        {title}
      </Text>
    ) : null}
    <Box
      style={{
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border || 'rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}>
      {children}
    </Box>
  </VStack>
);

type ProfileMenuItemProps = {
  label: string;
  testID: string;
  onPress: () => void;
  colors: ProfileColors;
  icon?: React.ReactNode;
  labelColor?: string;
  showChevron?: boolean;
  isLast?: boolean;
  disabled?: boolean;
  trailing?: React.ReactNode;
};

const ProfileMenuItem = ({
  label,
  testID,
  onPress,
  colors,
  icon,
  labelColor,
  showChevron = true,
  isLast,
  disabled,
  trailing,
}: ProfileMenuItemProps) => (
  <Pressable testID={testID} onPress={onPress} disabled={disabled}>
    <HStack
      alignItems="center"
      justifyContent="space-between"
      px="$4"
      py="$3.5"
      style={{
        opacity: disabled ? 0.6 : 1,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.border || 'rgba(0,0,0,0.08)',
      }}>
      <HStack alignItems="center" space="md" flex={1}>
        {icon}
        <Text
          style={{
            color: labelColor || colors.primaryText,
            fontSize: 16,
            fontWeight: '500',
          }}>
          {label}
        </Text>
      </HStack>
      {trailing}
      {showChevron ? (
        <ChevronRight size={20} color={colors.mutedText} strokeWidth={2} />
      ) : null}
    </HStack>
  </Pressable>
);

type ProfileInfoRowProps = {
  label: string;
  value: string;
  testID: string;
  colors: ProfileColors;
  isLast?: boolean;
  valueColor?: string;
};

const ProfileInfoRow = ({
  label,
  value,
  testID,
  colors,
  isLast,
  valueColor,
}: ProfileInfoRowProps) => (
  <HStack
    testID={testID}
    justifyContent="space-between"
    alignItems="center"
    px="$4"
    py="$3.5"
    style={{
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: colors.border || 'rgba(0,0,0,0.08)',
    }}>
    <Text style={{color: colors.mutedText, fontSize: 15}}>{label}</Text>
    <Text
      style={{
        color: valueColor || colors.primaryText,
        fontSize: 15,
        fontWeight: '500',
        textAlign: 'right',
        flexShrink: 1,
        marginLeft: 12,
      }}>
      {value}
    </Text>
  </HStack>
);

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileNav>();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const user = useUser();
  const setAuthenticated = useUserStore(state => state.setAuthenticated);
  const setUser = useUserStore(state => state.setUser);
  const reset = useUserStore(state => state.reset);
  const appVersion = getAppVersion() || APP_CONFIG.version;
  const deleteAccountMutation = useDeleteAccountMutation();
  const isDeletingAccount = deleteAccountMutation.isPending;

  const clearLocalSession = async () => {
    await useUserCachedStore.getState().clearAll();
    reset();
    setAuthenticated(false);
    setUser(null);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Are you absolutely sure? Your account will be permanently removed.',
              [
                {text: 'Cancel', style: 'cancel'},
                {
                  text: 'Yes, Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      const response = await deleteAccountMutation.mutateAsync();
                      if (response.success) {
                        await clearLocalSession();
                        Alert.alert(
                          'Account Deleted',
                          'Your account has been permanently deleted.',
                          [{text: 'OK', style: 'default'}],
                        );
                      } else {
                        Alert.alert(
                          'Deletion Failed',
                          response.error || 'Unable to delete your account. Please try again.',
                        );
                      }
                    } catch {
                      Alert.alert(
                        'Deletion Failed',
                        'Unable to delete your account. Please check your connection and try again.',
                      );
                    }
                  },
                },
              ],
              {cancelable: true},
            );
          },
        },
      ],
      {cancelable: true},
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            reset();
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
      style={{backgroundColor: colors.secondaryBackground}}>
      <HStack
        testID="profile-header"
        alignItems="center"
        justifyContent="space-between"
        px="$4"
        pb="$3"
        style={{
          backgroundColor: colors.secondaryBackground,
          paddingTop: insets.top + 4,
        }}>
        <Pressable
          testID="profile-back-button"
          onPress={() => navigation.goBack()}
          p="$2"
          borderRadius="$md"
          style={{backgroundColor: colors.border || 'rgba(0,0,0,0.08)'}}>
          <Text
            testID="profile-back-arrow"
            style={{color: colors.primaryText, fontSize: 18}}>
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

      <ScrollView
        testID="profile-content"
        style={{flex: 1}}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}>
        <VStack testID="profile-header-section" space="md" alignItems="center" pt="$2" pb="$4">
          <UserAvatar user={user} size="xl" testID="profile-avatar" />
          <VStack testID="profile-user-info" space="xs" alignItems="center">
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
              {maskEmail(user?.email)}
            </Text>
            <Text
              testID="profile-user-mobile"
              style={{color: colors.mutedText, fontSize: 14}}>
              {maskMobile(user?.mobile)}
            </Text>
          </VStack>
        </VStack>

        <ProfileSection
          testID="profile-account-info"
          title="Account Information"
          colors={colors}>
          {user?.state ? (
            <ProfileInfoRow
              testID="profile-location-row"
              label="Location"
              value={`${user.city}, ${user.state}`}
              colors={colors}
            />
          ) : null}
          {user?.pincode ? (
            <ProfileInfoRow
              testID="profile-pincode-row"
              label="Pincode"
              value={user.pincode}
              colors={colors}
            />
          ) : null}
          <ProfileInfoRow
            testID="profile-status-row"
            label="Status"
            value={user?.isVerified ? 'Verified' : 'Pending'}
            valueColor={user?.isVerified ? colors.accentAction : colors.mutedText}
            colors={colors}
            isLast
          />
        </ProfileSection>

        <ProfileSection testID="profile-account-menu" title="Account" colors={colors}>
          <ProfileMenuItem
            testID="profile-switch-student-button"
            label="Switch Student"
            colors={colors}
            showChevron
            icon={<Users size={20} color={colors.primaryText} strokeWidth={2} />}
            onPress={() => navigation.navigate('SwitchProfile')}
          />
        </ProfileSection>

        <ProfileSection testID="profile-legal-menu" title="Legal & Support" colors={colors}>
          <ProfileMenuItem
            testID="profile-report-content-button"
            label="Report Content"
            colors={colors}
            showChevron
            onPress={() => navigation.navigate('ReportContent')}
          />
          <ProfileMenuItem
            testID="profile-terms-button"
            label="Terms and Conditions"
            colors={colors}
            showChevron
            onPress={() => navigation.navigate('TermsAndConditions')}
          />
          <ProfileMenuItem
            testID="profile-privacy-button"
            label="Privacy Policy"
            colors={colors}
            showChevron
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />
          <ProfileMenuItem
            testID="profile-about-button"
            label="About Us"
            colors={colors}
            showChevron
            isLast
            onPress={() => navigation.navigate('AboutUs')}
          />
        </ProfileSection>

        <ProfileSection testID="profile-actions" title="Account Actions" colors={colors}>
          <ProfileMenuItem
            testID="profile-logout-button"
            label="Logout"
            colors={colors}
            showChevron={false}
            icon={<LogOut size={20} color={colors.primaryText} strokeWidth={2} />}
            onPress={handleLogout}
          />
          <ProfileMenuItem
            testID="profile-delete-account-button"
            label="Delete Account"
            colors={colors}
            showChevron={false}
            labelColor={colors.danger}
            disabled={isDeletingAccount}
            isLast
            icon={<Trash2 size={20} color={colors.danger} strokeWidth={2} />}
            trailing={
              isDeletingAccount ? (
                <ActivityIndicator
                  testID="profile-delete-account-spinner"
                  size="small"
                  color={colors.danger}
                  style={{marginRight: 4}}
                />
              ) : null
            }
            onPress={handleDeleteAccount}
          />
        </ProfileSection>

        <Text
          testID="profile-app-version"
          style={{
            color: colors.mutedText,
            fontSize: 12,
            textAlign: 'center',
            marginTop: 4,
          }}>
          Version {appVersion}
        </Text>
      </ScrollView>
    </VStack>
  );
};

export default ProfileScreen;
