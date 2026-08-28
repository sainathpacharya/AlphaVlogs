import React, {useEffect} from 'react';
import {BackHandler, Platform} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {useStatusBarConfig} from '@/utils/colors';
import {screen} from '@/navigation/screen';
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
import ReportContentScreen from '../../screens/ReportContent';

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
      <AppStack.Screen name="Dashboard" component={screen(DashboardScreen, 'DashboardScreen')} />
      <AppStack.Screen name="Profile" component={screen(ProfileScreen, 'ProfileScreen')} />
      <AppStack.Screen
        name="SwitchProfile"
        component={screen(SwitchProfileScreen, 'SwitchProfileScreen')}
      />
      <AppStack.Screen name="Quiz" component={screen(QuizScreen, 'QuizScreen')} />
      <AppStack.Screen name="Results" component={screen(ResultsScreen, 'ResultsScreen')} />
      <AppStack.Screen
        name="Subscription"
        component={screen(SubscriptionScreen, 'SubscriptionScreen')}
      />
      <AppStack.Screen
        name="VideoUpload"
        component={screen(VideoUploadScreen as any, 'VideoUploadScreen')}
        options={({route}) => ({
          title: route.params?.eventTitle || 'Video Upload',
        })}
      />
      <AppStack.Screen
        name="ReportContent"
        component={screen(ReportContentScreen, 'ReportContentScreen')}
      />
      {__DEV__ ? (
        <AppStack.Screen name="MockTest" component={screen(MockTestScreen, 'MockTestScreen')} />
      ) : null}
      <AppStack.Screen
        name="Permissions"
        component={screen(PermissionsScreen, 'PermissionsScreen')}
      />
      <AppStack.Screen name="ComingSoon" component={screen(ComingSoonScreen, 'ComingSoonScreen')} />
      <AppStack.Screen name="AboutUs" component={screen(AboutUsScreen, 'AboutUsScreen')} />
      <AppStack.Screen
        name="TermsAndConditions"
        component={screen(TermsAndConditionsScreen, 'TermsAndConditionsScreen')}
      />
      <AppStack.Screen
        name="PrivacyPolicy"
        component={screen(PrivacyPolicyScreen, 'PrivacyPolicyScreen')}
      />
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
