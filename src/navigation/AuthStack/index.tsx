import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import WelcomeScreen from '../../screens/Welcome';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {/* <Stack.Screen name="Login" component={LoginScreen} /> */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
    </Stack.Navigator>
  );
};

export {Stack, AuthStack};
