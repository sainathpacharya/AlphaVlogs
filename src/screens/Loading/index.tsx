import React from 'react';
import {Dimensions} from 'react-native';
import {SafeAreaView, VStack, Spinner, Text} from '@/components';
import {AppLogoImage} from '@/components/AppLogoImage';
import appLogo from '@/assets/png/appLogo.png';
import {useThemeColors} from '@/utils/colors';

const {width, height} = Dimensions.get('window');

const LoadingScreen = () => {
  const colors = useThemeColors();
  return (
    <SafeAreaView
      testID="loading-screen"
      style={{flex: 1, backgroundColor: colors.primaryBackground}}>
      <VStack
        testID="loading-container"
        h="$full"
        w="$full"
        style={{backgroundColor: colors.primaryBackground}}
        justifyContent="center"
        alignItems="center"
        space="md">
        <AppLogoImage
          testID="loading-logo"
          source={appLogo}
          animation="spring-in"
          style={{
            width: width * 0.8,
            height: height * 0.4,
          }}
        />

        <VStack
          testID="loading-spinner-container"
          space="sm"
          alignItems="center">
          <Spinner
            testID="loading-spinner"
            size={25}
            bgColor={colors.accentAction}
          />
          <Text
            testID="loading-text"
            fontSize="$lg"
            fontWeight="$medium"
            color={colors.mutedText}>
            Loading...
          </Text>
        </VStack>
      </VStack>
    </SafeAreaView>
  );
};

export default LoadingScreen;
