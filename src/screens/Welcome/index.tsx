import React, {useEffect} from 'react';
import {Dimensions} from 'react-native';
import {SafeAreaView, StatusBar, VStack} from '../../components';
import {AppLogoImage} from '../../components/AppLogoImage';
import appLogo from '../../assets/png/appLogo.png';
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
        <AppLogoImage
          testID="welcome-logo"
          source={appLogo}
          animation="spring-in"
          style={{
            width: width * 0.69,
            height: height * 0.3,
          }}
        />
      </VStack>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
