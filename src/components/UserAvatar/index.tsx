import React from 'react';
import {Image, Platform, StyleProp, ViewStyle} from 'react-native';
import {User} from 'lucide-react-native';
import {Box} from '../box';
import {useThemeColors} from '@/utils/colors';

type UserLike = {
  firstName?: string;
  lastName?: string;
  profileImage?: string;
} | null | undefined;

export type UserAvatarSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_PX: Record<UserAvatarSize, number> = {
  sm: 36,
  md: 48,
  lg: 72,
  xl: 100,
};

const ICON_SIZE: Record<UserAvatarSize, number> = {
  sm: 18,
  md: 24,
  lg: 36,
  xl: 44,
};

interface UserAvatarProps {
  user: UserLike;
  size?: UserAvatarSize;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export function UserAvatar({user, size = 'md', testID, style}: UserAvatarProps) {
  const colors = useThemeColors();
  const dimension = SIZE_PX[size];
  const iconSize = ICON_SIZE[size];
  const hasPhoto = Boolean(user?.profileImage?.trim());

  return (
    <Box
      testID={testID}
      style={[
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: colors.accentAction,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        Platform.select({
          ios: {
            shadowColor: colors.accentAction,
            shadowOffset: {width: 0, height: 3},
            shadowOpacity: size === 'md' ? 0.28 : 0.18,
            shadowRadius: size === 'md' ? 6 : 8,
          },
          android: {elevation: size === 'md' ? 3 : 2},
        }),
        style,
      ]}>
      {hasPhoto ? (
        <Image
          source={{uri: user!.profileImage!.trim()}}
          style={{width: dimension, height: dimension}}
          resizeMode="cover"
        />
      ) : (
        <User size={iconSize} color={colors.white} strokeWidth={2} />
      )}
    </Box>
  );
}
