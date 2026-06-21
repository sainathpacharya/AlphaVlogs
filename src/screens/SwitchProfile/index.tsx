import React, {useCallback, useState} from 'react';
import {ActivityIndicator, Alert, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Box, Pressable, Text, VStack} from '@/components';
import {StudentProfileCardRow} from '@/components/StudentProfileCard';
import {useStudentProfilesQuery, useSwitchProfileMutation, useIsMounted} from '@/hooks';
import {AppStackParamList} from '@/navigation/AppStack/types';
import {useThemeColors} from '@/utils/colors';

type SwitchProfileNav = NativeStackNavigationProp<AppStackParamList, 'SwitchProfile'>;

const SwitchProfileScreen = () => {
  const navigation = useNavigation<SwitchProfileNav>();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const {
    data: profiles = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useStudentProfilesQuery();
  const switchProfileMutation = useSwitchProfileMutation();
  const isMounted = useIsMounted();

  const handleSwitch = useCallback(
    async (studentId: number) => {
      setLoadingId(studentId);
      try {
        const response = await switchProfileMutation.mutateAsync(studentId);
        if (!isMounted.current) {
          return;
        }
        if (response.success && response.data) {
          Alert.alert(
            'Profile Switched',
            `You are now logged in as ${response.data.user.firstName}.`,
            [{text: 'OK', onPress: () => navigation.navigate('Dashboard')}],
          );
          return;
        }

        Alert.alert('Switch Failed', response.error || 'Profile not available.');
      } catch {
        if (isMounted.current) {
          Alert.alert('Error', 'Unable to switch profile. Please try again.');
        }
      } finally {
        if (isMounted.current) {
          setLoadingId(null);
        }
      }
    },
    [navigation, switchProfileMutation, isMounted],
  );

  const errorMessage =
    error instanceof Error ? error.message : 'Unable to load profiles. Please try again.';

  return (
    <VStack flex={1} style={{backgroundColor: colors.secondaryBackground}}>
      <Box px="$4" pt={insets.top + 8} pb="$3">
        <Pressable onPress={() => navigation.goBack()} mb="$3" alignSelf="flex-start">
          <Text style={{color: colors.accentAction, fontSize: 16}}>← Back</Text>
        </Pressable>
        <Text
          style={{
            color: colors.primaryText,
            fontSize: 22,
            fontWeight: 'bold',
          }}>
          Switch Student
        </Text>
        <Text style={{color: colors.mutedText, fontSize: 14, marginTop: 6}}>
          Select another student linked to your mobile number.
        </Text>
      </Box>

      {isLoading || isRefetching ? (
        <Box flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" color={colors.accentAction} />
        </Box>
      ) : isError ? (
        <Box flex={1} px="$5" alignItems="center" justifyContent="center">
          <Text
            style={{color: colors.danger, textAlign: 'center', marginBottom: 16}}>
            {errorMessage}
          </Text>
          <Pressable onPress={() => refetch()}>
            <Text style={{color: colors.accentAction, fontWeight: '600'}}>Try Again</Text>
          </Pressable>
        </Box>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 24,
          }}
          showsVerticalScrollIndicator={false}>
          {profiles.map(profile => (
            <StudentProfileCardRow
              key={profile.studentId}
              testID={`switch-profile-${profile.studentId}`}
              profile={profile}
              colors={colors}
              isLoading={loadingId === profile.studentId || switchProfileMutation.isPending}
              onPressProfile={handleSwitch}
            />
          ))}
        </ScrollView>
      )}
    </VStack>
  );
};

export default SwitchProfileScreen;
