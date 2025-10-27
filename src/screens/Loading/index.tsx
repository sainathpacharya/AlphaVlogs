import React from 'react';
import {View, Dimensions} from 'react-native';
import {SafeAreaView, VStack, Spinner, Text} from '@/components';
import {MotiImage} from 'moti';
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
        <MotiImage
          testID="loading-logo"
          source={appLogo}
          from={{
            opacity: 0,
            scale: 0.5,
            rotate: '-10deg',
            translateY: -100,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            rotate: '0deg',
            translateY: 0,
          }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 40,
            mass: 1.2,
            delay: 300,
          }}
          style={{
            width: width * 0.8,
            height: height * 0.4,
            resizeMode: 'contain',
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
