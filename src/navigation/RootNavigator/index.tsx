import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {useStatusBarConfig} from '@/utils/colors';
import {useIsAuthenticated, useIsLoading} from '@/stores';
import {useStoreHydration} from '@/hooks/useStoreHydration';
import {RootStackParamList} from '@/types';
import LoadingScreen from '@/screens/Loading';
import {AuthStack} from '../AuthStack';
import {AppStackScreen} from '../AppStack';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const isLoading = useIsLoading();
  const isAuthenticated = useIsAuthenticated();
  const storesHydrated = useStoreHydration();
  const {navigationStatusBarStyle, backgroundColor} = useStatusBarConfig();

  // Wait for Zustand rehydration before mounting AuthStack — AuthStack clears
  // stored tokens on mount, which would wipe a restored session if run too early.
  const showLoading = isLoading || !storesHydrated;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        statusBarStyle: navigationStatusBarStyle,
        statusBarBackgroundColor: backgroundColor,
      } as NativeStackNavigationOptions}>
      {showLoading ? (
        <Stack.Screen name="Loading" component={LoadingScreen} />
      ) : isAuthenticated ? (
        <Stack.Screen name="App" component={AppStackScreen} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
