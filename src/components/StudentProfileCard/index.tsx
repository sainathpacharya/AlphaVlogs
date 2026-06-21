import React, {useCallback} from 'react';
import {ActivityIndicator, StyleSheet} from 'react-native';
import {Box, HStack, Pressable, Text, VStack} from '@/components';
import {StudentProfile} from '@/types';
import {CheckCircle2, GraduationCap, School} from 'lucide-react-native';

export interface StudentProfileCardProps {
  profile: StudentProfile;
  colors: Record<string, string>;
  onPress: () => void;
  isSelected?: boolean;
  isLoading?: boolean;
  testID?: string;
}

export const StudentProfileCard = React.memo(function StudentProfileCard({
  profile,
  colors,
  onPress,
  isSelected = false,
  isLoading = false,
  testID,
}: StudentProfileCardProps) {
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isLoading}
      opacity={isLoading ? 0.7 : 1}
      mb="$3">
      <Box
        style={[
          styles.card,
          {
            backgroundColor: colors.cardBackground,
            borderColor: isSelected ? colors.accentAction : colors.border || 'rgba(0,0,0,0.08)',
          },
        ]}>
        <VStack space="sm">
          <HStack alignItems="center" justifyContent="space-between">
            <Text
              style={{
                color: colors.primaryText,
                fontSize: 18,
                fontWeight: '700',
                flex: 1,
              }}>
              {fullName}
            </Text>
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.accentAction} />
            ) : null}
          </HStack>

          <HStack space="xs" alignItems="center">
            <GraduationCap size={16} color={colors.mutedText} />
            <Text style={{color: colors.mutedText, fontSize: 14}}>
              Class {profile.className}
            </Text>
          </HStack>

          <HStack space="xs" alignItems="center">
            <School size={16} color={colors.mutedText} />
            <Text
              style={{color: colors.mutedText, fontSize: 14, flex: 1}}
              numberOfLines={2}>
              {profile.schoolName}
            </Text>
          </HStack>

          <HStack space="sm" flexWrap="wrap">
            {profile.verified ? (
              <Box
                style={[
                  styles.badge,
                  {backgroundColor: `${colors.accentAction}22`},
                ]}>
                <HStack space="xs" alignItems="center">
                  <CheckCircle2 size={12} color={colors.accentAction} />
                  <Text
                    style={{color: colors.accentAction, fontSize: 12, fontWeight: '600'}}>
                    Verified
                  </Text>
                </HStack>
              </Box>
            ) : null}
            {profile.isSubscribed ? (
              <Box
                style={[
                  styles.badge,
                  {backgroundColor: `${colors.success || '#34C759'}22`},
                ]}>
                <Text
                  style={{
                    color: colors.success || '#34C759',
                    fontSize: 12,
                    fontWeight: '600',
                  }}>
                  Subscribed
                </Text>
              </Box>
            ) : null}
          </HStack>
        </VStack>
      </Box>
    </Pressable>
  );
});

export const StudentProfileCardRow = React.memo(function StudentProfileCardRow({
  profile,
  colors,
  onPressProfile,
  isLoading,
  testID,
}: {
  profile: StudentProfile;
  colors: Record<string, string>;
  onPressProfile: (studentId: number) => void;
  isLoading?: boolean;
  testID?: string;
}) {
  const onPress = useCallback(
    () => onPressProfile(profile.studentId),
    [onPressProfile, profile.studentId],
  );

  return (
    <StudentProfileCard
      profile={profile}
      colors={colors}
      onPress={onPress}
      isLoading={isLoading}
      testID={testID}
    />
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 16,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});

export default StudentProfileCard;
