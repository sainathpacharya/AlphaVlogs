import React, {useCallback, useEffect, useRef} from 'react';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import RootNavigator from './RootNavigator';
import {
  initializeFirebaseMonitoring,
  logScreenView,
} from '@/services/firebase-service';
import {getActiveRouteName} from '@/utils/navigation-route';

const Navigation = () => {
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    void initializeFirebaseMonitoring();
  }, []);

  const trackCurrentScreen = useCallback(() => {
    const currentRouteName = getActiveRouteName(navigationRef.getRootState());

    if (currentRouteName && routeNameRef.current !== currentRouteName) {
      routeNameRef.current = currentRouteName;
      void logScreenView(currentRouteName);
    }
  }, [navigationRef]);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={trackCurrentScreen}
      onStateChange={trackCurrentScreen}>
      <RootNavigator />
    </NavigationContainer>
  );
};

export default Navigation;
