import React, {ReactNode} from 'react';
import {ScrollView, ScrollViewProps, StyleProp, ViewStyle} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Box, HStack, Pressable, Text, VStack} from '@/components';
import {useThemeColors} from '@/utils/colors';

interface InfoScreenLayoutProps {
  title: string;
  testID?: string;
  children: ReactNode;
  scrollProps?: ScrollViewProps;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function InfoScreenLayout({
  title,
  testID,
  children,
  scrollProps,
  contentContainerStyle,
}: InfoScreenLayoutProps) {
  const navigation = useNavigation();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <VStack
      testID={testID}
      flex={1}
      style={{backgroundColor: colors.secondaryBackground ?? colors.primaryBackground}}>
      <HStack
        alignItems="center"
        justifyContent="space-between"
        px="$4"
        pb="$3"
        style={{
          backgroundColor: colors.primaryBackground,
          paddingTop: insets.top + 4,
          borderBottomWidth: 1,
          borderBottomColor: colors.border || 'rgba(0,0,0,0.08)',
        }}>
        <Pressable
          testID={`${testID ?? 'info'}-back`}
          onPress={() => navigation.goBack()}
          p="$2"
          borderRadius="$md"
          style={{backgroundColor: colors.border || 'rgba(0,0,0,0.08)'}}>
          <Text style={{color: colors.primaryText, fontSize: 18}}>←</Text>
        </Pressable>
        <Text
          style={{
            color: colors.primaryText,
            fontSize: 18,
            fontWeight: '700',
            flex: 1,
            textAlign: 'center',
          }}
          numberOfLines={1}>
          {title}
        </Text>
        <Box w="$10" />
      </HStack>

      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={[
          {
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: insets.bottom + 28,
          },
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}
        {...scrollProps}>
        {children}
      </ScrollView>
    </VStack>
  );
}
