import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useStatusBarConfig} from '@/utils/colors';
import apiService from '@/services/api';
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
      }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={RegistrationScreen} />
      <Stack.Screen name="ProfileSelection" component={ProfileSelectionScreen} />
      <Stack.Screen name="ComingSoon" component={ComingSoonScreen} />
    </Stack.Navigator>
  );
};

export {Stack, AuthStack};
