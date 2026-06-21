import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useStatusBarConfig} from '@/utils/colors';
import {AppStackParamList} from './types';
import DashboardScreen from '../../screens/Dashboard';
import ProfileScreen from '../../screens/Profile';
import SwitchProfileScreen from '../../screens/SwitchProfile';
import QuizScreen from '../../screens/Quiz';
import ResultsScreen from '../../screens/Results';
import SubscriptionScreen from '../../screens/Subscription';
import VideoUploadScreen from '../../screens/VideoUpload';
import BadgePage from '../../components/_custom/Badges/BadgePage';
import MockTestScreen from '../../screens/MockTest';
import PermissionsScreen from '../../screens/Permissions';
import ComingSoonScreen from '../../screens/ComingSoon';
import AboutUsScreen from '../../screens/AboutUs';
import TermsAndConditionsScreen from '../../screens/TermsAndConditions';
import PrivacyPolicyScreen from '../../screens/PrivacyPolicy';

const AppStack = createNativeStackNavigator<AppStackParamList>();

const AppStackScreen = () => {
  const {navigationStatusBarStyle, backgroundColor} = useStatusBarConfig();

  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: false,
        statusBarStyle: navigationStatusBarStyle,
        statusBarBackgroundColor: backgroundColor,
      }}>
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
      <AppStack.Screen name="BadgePage" component={BadgePage} />
      <AppStack.Screen name="MockTest" component={MockTestScreen} />
      <AppStack.Screen name="Permissions" component={PermissionsScreen} />
      <AppStack.Screen name="ComingSoon" component={ComingSoonScreen} />
      <AppStack.Screen name="AboutUs" component={AboutUsScreen} />
      <AppStack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
      <AppStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </AppStack.Navigator>
  );
};

export {AppStack, AppStackScreen};
