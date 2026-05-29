import React from 'react';
import {Alert, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ChevronRight, LogOut} from 'lucide-react-native';
import {
  VStack,
  HStack,
  Text,
  Box,
  Pressable,
  Button,
  ButtonText,
  UserAvatar,
} from '@/components';
import {APP_CONFIG} from '@/constants';
import {useThemeColors} from '@/utils/colors';
import {maskEmail, maskMobile} from '@/utils/privacy';
import {getAppVersion} from '@/utils/platform';
import {useUserStore} from '@/stores';
import {AppStackParamList} from '@/navigation/AppStack/types';

type ProfileNav = NativeStackNavigationProp<AppStackParamList, 'Profile'>;

type ProfileMenuItemProps = {
  label: string;
  testID: string;
  onPress: () => void;
  colors: ReturnType<typeof useThemeColors>;
  isLast?: boolean;
};

const ProfileMenuItem = ({
  label,
  testID,
  onPress,
  colors,
  isLast,
}: ProfileMenuItemProps) => (
  <Pressable testID={testID} onPress={onPress}>
    <HStack
      alignItems="center"
      justifyContent="space-between"
      py="$3.5"
      style={{
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.border || 'rgba(0,0,0,0.08)',
      }}>
      <Text style={{color: colors.primaryText, fontSize: 16, fontWeight: '500'}}>
        {label}
      </Text>
      <ChevronRight size={20} color={colors.mutedText} strokeWidth={2} />
    </HStack>
  </Pressable>
);

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileNav>();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const {user, setAuthenticated, setUser, reset} = useUserStore();
  const appVersion = getAppVersion() || APP_CONFIG.version;

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
      style={{backgroundColor: colors.primaryBackground}}>
      <HStack
        testID="profile-header"
        alignItems="center"
        justifyContent="space-between"
        px="$4"
        pb="$3"
        style={{
          backgroundColor: colors.primaryBackground,
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
          paddingBottom: insets.bottom + 16,
          flexGrow: 1,
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

        <VStack testID="profile-account-info" space="md" pb="$4">
          <Text
            testID="profile-account-title"
            style={{
              color: colors.primaryText,
              fontSize: 18,
              fontWeight: 'bold',
            }}>
            Account Information
          </Text>

          {user?.state ? (
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
          ) : null}

          {user?.pincode ? (
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
          ) : null}

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
                color: user?.isVerified ? colors.accentAction : colors.mutedText,
                fontSize: 16,
              }}>
              {user?.isVerified ? '✅ Verified' : '⏳ Pending'}
            </Text>
          </HStack>
        </VStack>

        <VStack
          testID="profile-legal-menu"
          pt="$2"
          pb="$6"
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border || 'rgba(0,0,0,0.08)',
          }}>
          <ProfileMenuItem
            testID="profile-terms-button"
            label="Terms and Conditions"
            colors={colors}
            onPress={() => navigation.navigate('TermsAndConditions')}
          />
          <ProfileMenuItem
            testID="profile-privacy-button"
            label="Privacy Policy"
            colors={colors}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />
          <ProfileMenuItem
            testID="profile-about-button"
            label="About Us"
            colors={colors}
            isLast
            onPress={() => navigation.navigate('AboutUs')}
          />
        </VStack>

        <Box flex={1} minHeight={16} />

        <VStack testID="profile-actions" space="sm" w="$full" pb="$2">
          <Button
            testID="profile-logout-button"
            onPress={handleLogout}
            action="negative"
            variant="solid"
            size="lg"
            w="$full"
            style={{
              alignSelf: 'stretch',
              elevation: 0,
              shadowColor: 'transparent',
            }}>
            <HStack
              alignItems="center"
              justifyContent="center"
              space="sm"
              w="$full">
              <LogOut size={20} color={colors.white} strokeWidth={2.5} />
              <ButtonText
                testID="profile-logout-text"
                style={{flex: 0, textAlign: 'center'}}>
                Logout
              </ButtonText>
            </HStack>
          </Button>
          <Text
            testID="profile-app-version"
            style={{
              color: colors.mutedText,
              fontSize: 12,
              textAlign: 'center',
              marginTop: 8,
            }}>
            Version {appVersion}
          </Text>
        </VStack>
      </ScrollView>
    </VStack>
  );
};

export default ProfileScreen;
