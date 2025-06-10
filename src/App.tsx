/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {GluestackUIProvider} from '@gluestack-ui/themed';
import {config} from '@gluestack-ui/config';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AppStackScreen} from './navigation/AppStack';
import {AuthStackScreen} from './navigation/AuthStack';

const RootStack = createNativeStackNavigator();

const App = () => {
  const isLoggedIn = false; // Replace with actual auth logic
  return (
    <GluestackUIProvider config={config}>
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{headerShown: false}}>
          {!isLoggedIn ? (
            <RootStack.Screen name="Auth" component={AuthStackScreen} />
          ) : (
            <RootStack.Screen name="App" component={AppStackScreen} />
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </GluestackUIProvider>
  );
};

export default App;
