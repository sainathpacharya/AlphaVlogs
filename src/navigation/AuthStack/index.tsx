import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useStatusBarConfig} from '@/utils/colors';
import {useUserStore} from '@/stores';
import WelcomeScreen from '../../screens/Welcome';
import {AuthStackParamList} from './types';
import LoginScreen from '../../screens/Login';
import RegistrationScreen from '../../screens/Registration';
import ComingSoonScreen from '../../screens/ComingSoon';
const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack = () => {
  const {setAuthenticated} = useUserStore();
  const {navigationStatusBarStyle, backgroundColor} = useStatusBarConfig();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        statusBarStyle: navigationStatusBarStyle,
        statusBarBackgroundColor: backgroundColor,
      }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login">
        {props => <LoginScreen {...props} setIsLoggedIn={setAuthenticated} />}
      </Stack.Screen>
      <Stack.Screen name="Signup" component={RegistrationScreen} />
      <Stack.Screen name="ComingSoon" component={ComingSoonScreen} />
    </Stack.Navigator>
  );
};

export {Stack, AuthStack};
