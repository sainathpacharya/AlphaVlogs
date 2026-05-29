import React, {useEffect} from 'react';
import {Dimensions} from 'react-native';
import {SafeAreaView, StatusBar, VStack} from '../../components';
import appLogo from '../../assets/png/appLogo.png';
import {MotiImage} from 'moti';
import {useThemeColors} from '../../utils/colors';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../navigation/AuthStack/types';

const {width, height} = Dimensions.get('window');

type WelcomeScreenNavigationProp = NativeStackNavigationProp<
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
      <StatusBar testID="welcome-status-bar" translucent={false} />

      <VStack
        testID="welcome-container"
        h="$full"
        w="$full"
        style={{backgroundColor: colors.white}}
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
            width: width * 0.69,
            height: height * 0.3,
            resizeMode: 'cover',
          }}
        />
      </VStack>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
