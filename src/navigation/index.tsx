import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import RootNavigator from './RootNavigator';
import {AnalyticsConsentPrompt} from '@/components/AnalyticsConsentPrompt';
import {
  bootstrapAnalyticsConsent,
  getAnalyticsConsent,
} from '@/services/analytics-consent-service';
import {
  initializeFirebaseMonitoring,
  logScreenView,
} from '@/services/firebase-service';
import {getActiveRouteName} from '@/utils/navigation-route';

const Navigation = () => {
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef<string | undefined>(undefined);
  const [showConsentPrompt, setShowConsentPrompt] = useState(false);

  useEffect(() => {
    void (async () => {
      await bootstrapAnalyticsConsent();
      const consent = await getAnalyticsConsent();
      if (consent === null) {
        setShowConsentPrompt(true);
      }
      await initializeFirebaseMonitoring();
    })();
  }, []);

  const trackCurrentScreen = useCallback(() => {
    const currentRouteName = getActiveRouteName(navigationRef.getRootState());

    if (currentRouteName && routeNameRef.current !== currentRouteName) {
      routeNameRef.current = currentRouteName;
      void logScreenView(currentRouteName);
    }
  }, [navigationRef]);

  return (
    <>
      <NavigationContainer
        ref={navigationRef}
        onReady={trackCurrentScreen}
        onStateChange={trackCurrentScreen}>
        <RootNavigator />
      </NavigationContainer>
      <AnalyticsConsentPrompt
        visible={showConsentPrompt}
        onComplete={() => setShowConsentPrompt(false)}
      />
    </>
  );
};

export default Navigation;
