import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {useStatusBarConfig} from '@/utils/colors';
import apiService from '@/services/api';
import {screen} from '@/navigation/screen';
import WelcomeScreen from '../../screens/Welcome';
import {AuthStackParamList} from './types';
import LoginScreen from '../../screens/Login';
import RegistrationScreen from '../../screens/Registration';
import ComingSoonScreen from '../../screens/ComingSoon';
import ProfileSelectionScreen from '../../screens/ProfileSelection';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack = () => {
  const {navigationStatusBarStyle, backgroundColor} = useStatusBarConfig();

  useEffect(() => {
    void apiService.clearStoredAuth();
  }, []);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        statusBarStyle: navigationStatusBarStyle,
        statusBarBackgroundColor: backgroundColor,
      } as NativeStackNavigationOptions}>
      <Stack.Screen name="Welcome" component={screen(WelcomeScreen, 'WelcomeScreen')} />
      <Stack.Screen name="Login" component={screen(LoginScreen, 'LoginScreen')} />
      <Stack.Screen name="Signup" component={screen(RegistrationScreen, 'RegistrationScreen')} />
      <Stack.Screen
        name="ProfileSelection"
        component={screen(ProfileSelectionScreen, 'ProfileSelectionScreen')}
      />
      <Stack.Screen name="ComingSoon" component={screen(ComingSoonScreen, 'ComingSoonScreen')} />
    </Stack.Navigator>
  );
};

export {Stack, AuthStack};
