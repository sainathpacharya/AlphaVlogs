import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useUserStore} from '@/stores';
import {RootStackParamList} from '@/types';
import LoadingScreen from '@/screens/Loading';
import {AuthStack} from '../AuthStack';
import {AppStackScreen} from '../AppStack';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const {isLoading, isAuthenticated, setAuthenticated} = useUserStore();

  // Show loading screen while checking authentication state
  if (isLoading) {
    return <LoadingScreen />;
  }

  // If user is authenticated, show app stack
  // If not authenticated, show auth stack
  // The persistent store will automatically restore the user's login state

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {isAuthenticated ? (
        <Stack.Screen name="App" component={AppStackScreen} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
