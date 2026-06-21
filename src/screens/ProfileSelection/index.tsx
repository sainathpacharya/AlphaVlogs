import React, {useCallback, useState} from 'react';
import {Alert, ScrollView} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Box, Pressable, StatusBar, Text, VStack} from '@/components';
import {StudentProfileCardRow} from '@/components/StudentProfileCard';
import {useSelectProfileMutation, useIsMounted} from '@/hooks';
import {AuthStackParamList} from '@/navigation/AuthStack/types';
import {useThemeColors} from '@/utils/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileSelection'>;

const ProfileSelectionScreen = ({route, navigation}: Props) => {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const {mobile, profiles} = route.params;
  const selectProfileMutation = useSelectProfileMutation();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const isMounted = useIsMounted();

  const handleSelect = useCallback(
    async (studentId: number) => {
      setLoadingId(studentId);
      try {
        const response = await selectProfileMutation.mutateAsync({studentId, mobile});
        if (!isMounted.current) {
          return;
        }
        if (response.success && response.data) {
          Alert.alert(
            'Login Successful',
            `Welcome ${response.data.user.firstName}!`,
          );
          return;
        }

        const message = response.error || 'Unable to select profile.';
        if (/expired|verify otp/i.test(message)) {
          Alert.alert('Session Expired', message, [
            {text: 'Login Again', onPress: () => navigation.navigate('Login')},
          ]);
          return;
        }

        Alert.alert('Selection Failed', message);
      } catch {
        if (isMounted.current) {
          Alert.alert('Error', 'Unable to select profile. Please try again.');
        }
      } finally {
        if (isMounted.current) {
          setLoadingId(null);
        }
      }
    },
    [mobile, navigation, selectProfileMutation, isMounted],
  );

  return (
    <VStack flex={1} style={{backgroundColor: colors.primaryBackground}}>
      <StatusBar translucent={false} />
      <Box px="$5" pt={insets.top + 12} pb="$3">
        <Pressable
          onPress={() => navigation.goBack()}
          mb="$4"
          alignSelf="flex-start">
          <Text style={{color: colors.accentAction, fontSize: 16}}>← Back</Text>
        </Pressable>
        <Text
          style={{
            color: colors.primaryText,
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 8,
          }}>
          Select Student
        </Text>
        <Text style={{color: colors.mutedText, fontSize: 15, lineHeight: 22}}>
          Multiple students are linked to +91 {mobile}. Choose who you want to continue as.
        </Text>
      </Box>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}>
        {profiles.map(profile => (
          <StudentProfileCardRow
            key={profile.studentId}
            testID={`profile-selection-${profile.studentId}`}
            profile={profile}
            colors={colors}
            isLoading={loadingId === profile.studentId || selectProfileMutation.isPending}
            onPressProfile={handleSelect}
          />
        ))}
      </ScrollView>
    </VStack>
  );
};

export default ProfileSelectionScreen;
