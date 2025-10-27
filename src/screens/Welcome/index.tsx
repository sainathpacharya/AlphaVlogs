import React, {useEffect} from 'react';
import {Dimensions, StatusBar, View} from 'react-native';
import {SafeAreaView, VStack} from '../../components';
import appLogo from '../../assets/png/appLogo.png';
import {MotiImage} from 'moti';
import {useThemeColors} from '../../utils/colors';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../../navigation/AuthStack/types';

const {width, height} = Dimensions.get('window');

// ✅ Type navigation prop
type WelcomeScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Welcome'
>;

const WelcomeScreen = () => {
  const colors = useThemeColors();
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView
      testID="welcome-screen"
      style={{flex: 1, backgroundColor: colors.primaryBackground}}>
      <StatusBar
        testID="welcome-status-bar"
        backgroundColor={colors.primaryBackground}
        barStyle={
          colors.primaryBackground === '#FFFFFF'
            ? 'dark-content'
            : 'light-content'
        }
      />

      <View
        testID="welcome-status-bar-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: StatusBar.currentHeight || 50,
          backgroundColor: colors.primaryBackground,
          zIndex: 10,
        }}
      />

      <VStack
        testID="welcome-container"
        h="$full"
        w="$full"
        style={{backgroundColor: colors.primaryBackground}}
        justifyContent="center"
        alignItems="center">
        <MotiImage
          testID="welcome-logo"
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
            width: width,
            height: height,
            resizeMode: 'cover',
          }}
        />
      </VStack>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
