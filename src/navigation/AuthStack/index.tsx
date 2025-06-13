import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import WelcomeScreen from '../../screens/Welcome';
import {AuthStackParamList} from './types'; // Adjust this path if needed
import LoginScreen from '../../screens/Login'; // Uncomment when ready
import RegistrationScreen from '../../screens/Registration';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={RegistrationScreen} />
    </Stack.Navigator>
  );
};

export {Stack, AuthStack};
