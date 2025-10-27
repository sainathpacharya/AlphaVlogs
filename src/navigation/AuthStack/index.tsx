import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useUserStore} from '@/stores';
import WelcomeScreen from '../../screens/Welcome';
import {AuthStackParamList} from './types';
import LoginScreen from '../../screens/Login';
import RegistrationScreen from '../../screens/Registration';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack = () => {
  const {setAuthenticated} = useUserStore();

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login">
        {props => <LoginScreen {...props} setIsLoggedIn={setAuthenticated} />}
      </Stack.Screen>
      <Stack.Screen name="Signup" component={RegistrationScreen} />
    </Stack.Navigator>
  );
};

export {Stack, AuthStack};
