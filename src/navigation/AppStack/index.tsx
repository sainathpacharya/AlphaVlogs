import React, {useEffect} from 'react';
import {BackHandler, Platform} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {useStatusBarConfig} from '@/utils/colors';
import {AppStackParamList} from './types';
import DashboardScreen from '../../screens/Dashboard';
import ProfileScreen from '../../screens/Profile';
import SwitchProfileScreen from '../../screens/SwitchProfile';
import QuizScreen from '../../screens/Quiz';
import ResultsScreen from '../../screens/Results';
import SubscriptionScreen from '../../screens/Subscription';
import VideoUploadScreen from '../../screens/VideoUpload';
import MockTestScreen from '../../screens/MockTest';
import PermissionsScreen from '../../screens/Permissions';
import ComingSoonScreen from '../../screens/ComingSoon';
import AboutUsScreen from '../../screens/AboutUs';
import TermsAndConditionsScreen from '../../screens/TermsAndConditions';
import PrivacyPolicyScreen from '../../screens/PrivacyPolicy';

const AppStack = createNativeStackNavigator<AppStackParamList>();

/**
 * Global back-button guard for the authenticated stack.
 * When a non-root screen is focused, pops it. When on Dashboard (root),
 * the Dashboard's own usePreventHardwareBack hook shows the exit dialog.
 * Rendered as a sibling of the navigator so it can call useNavigation().
 */
function AppStackBackGuard() {
  const navigation = useNavigation();

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true; // consumed — don't let OS handle it
      }
      return false; // Dashboard's usePreventHardwareBack will handle it
    });
    return () => handler.remove();
  }, [navigation]);

  return null;
}

const AppStackNavigator = () => {
  const {navigationStatusBarStyle, backgroundColor} = useStatusBarConfig();

  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: false,
        statusBarStyle: navigationStatusBarStyle,
        statusBarBackgroundColor: backgroundColor,
      } as NativeStackNavigationOptions}>
      <AppStack.Screen name="Dashboard" component={DashboardScreen} />
      <AppStack.Screen name="Profile" component={ProfileScreen} />
      <AppStack.Screen name="SwitchProfile" component={SwitchProfileScreen} />
      <AppStack.Screen name="Quiz" component={QuizScreen} />
      <AppStack.Screen name="Results" component={ResultsScreen} />
      <AppStack.Screen name="Subscription" component={SubscriptionScreen} />
      <AppStack.Screen
        name="VideoUpload"
        component={VideoUploadScreen as any}
        options={({route}) => ({
          title: route.params?.eventTitle || 'Video Upload',
        })}
      />
      <AppStack.Screen name="MockTest" component={MockTestScreen} />
      <AppStack.Screen name="Permissions" component={PermissionsScreen} />
      <AppStack.Screen name="ComingSoon" component={ComingSoonScreen} />
      <AppStack.Screen name="AboutUs" component={AboutUsScreen} />
      <AppStack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
      <AppStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </AppStack.Navigator>
  );
};

/**
 * AppStackScreen wraps the navigator + back guard together.
 * Both are rendered inside NavigationContainer so useNavigation() works.
 */
const AppStackScreen = () => (
  <>
    <AppStackBackGuard />
    <AppStackNavigator />
  </>
);

export {AppStack, AppStackScreen};
