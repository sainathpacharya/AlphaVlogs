import './setupScreenMocks';
import React from 'react';
import {fireEvent, waitFor} from '@testing-library/react-native';
import {Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  useEventsQuery,
  useStudentProfilesQuery,
  useSwitchProfileMutation,
} from '@/hooks';
import {canAccessPayment} from '@/utils/payment';
import {subscriptionService} from '@/services/subscription-service';
import {renderScreen} from '../utils/screen-test-utils';
import DashboardScreen from '@/screens/Dashboard';
import ProfileScreen from '@/screens/Profile';
import SwitchProfileScreen from '@/screens/SwitchProfile';
import SubscriptionScreen from '@/screens/Subscription';
import PermissionsScreen from '@/screens/Permissions';
import VideoUploadScreen from '@/screens/VideoUpload';

describe('Main App Screens', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    replace: jest.fn(),
    dispatch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
  });

  describe('DashboardScreen', () => {
    it('renders dashboard with greeting and user name', () => {
      const {getByTestId} = renderScreen(DashboardScreen);

      expect(getByTestId('dashboard-screen')).toBeTruthy();
      expect(getByTestId('dashboard-greeting-text')).toBeTruthy();
      expect(getByTestId('dashboard-user-name')).toBeTruthy();
      expect(getByTestId('dashboard-profile-button')).toBeTruthy();
    });

    it('shows loading state when events are loading', () => {
      (useEventsQuery as jest.Mock).mockReturnValue({
        data: [],
        isLoading: true,
        isError: false,
        error: null,
        refetch: jest.fn(),
      });

      const {getByTestId} = renderScreen(DashboardScreen);

      expect(getByTestId('dashboard-loading')).toBeTruthy();
      expect(getByTestId('dashboard-loading-text')).toBeTruthy();
    });

    it('renders events list when data is available', () => {
      (useEventsQuery as jest.Mock).mockReturnValue({
        data: [
          {id: '1', title: 'Singing', iconId: 'singing', gifUrl: null},
          {id: '2', title: 'Dancing', iconId: 'dancing', gifUrl: null},
        ],
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      });

      const {getByTestId} = renderScreen(DashboardScreen);

      expect(getByTestId('dashboard-events-list')).toBeTruthy();
    });

    it('navigates to Profile when profile button is pressed', () => {
      const {getByTestId} = renderScreen(DashboardScreen);

      fireEvent.press(getByTestId('dashboard-profile-button'));

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Profile');
    });

    it('shows subscription banner when payment is accessible and not subscribed', () => {
      (canAccessPayment as jest.Mock).mockReturnValue(true);
      (subscriptionService.isStudentSubscribed as jest.Mock).mockResolvedValue(
        false,
      );

      const {getByTestId} = renderScreen(DashboardScreen);

      expect(getByTestId('dashboard-subscription-banner')).toBeTruthy();
    });
  });

  describe('ProfileScreen', () => {
    it('renders profile screen with user info', () => {
      const {getByTestId, getByText} = renderScreen(ProfileScreen);

      expect(getByTestId('profile-screen')).toBeTruthy();
      expect(getByTestId('profile-title')).toBeTruthy();
      expect(getByText('Profile')).toBeTruthy();
      expect(getByTestId('profile-avatar')).toBeTruthy();
      expect(getByTestId('profile-user-name')).toBeTruthy();
    });

    it('renders account menu items', () => {
      const {getByTestId} = renderScreen(ProfileScreen);

      expect(getByTestId('profile-switch-student-button')).toBeTruthy();
      expect(getByTestId('profile-terms-button')).toBeTruthy();
      expect(getByTestId('profile-privacy-button')).toBeTruthy();
      expect(getByTestId('profile-about-button')).toBeTruthy();
      expect(getByTestId('profile-logout-button')).toBeTruthy();
    });

    it('navigates to SwitchProfile when switch student is pressed', () => {
      const {getByTestId} = renderScreen(ProfileScreen);

      fireEvent.press(getByTestId('profile-switch-student-button'));

      expect(mockNavigation.navigate).toHaveBeenCalledWith('SwitchProfile');
    });

    it('shows logout confirmation alert', () => {
      const alertSpy = jest.spyOn(Alert, 'alert');
      const {getByTestId} = renderScreen(ProfileScreen);

      fireEvent.press(getByTestId('profile-logout-button'));

      expect(alertSpy).toHaveBeenCalledWith(
        'Logout',
        'Are you sure you want to logout?',
        expect.any(Array),
        expect.any(Object),
      );
    });
  });

  describe('SwitchProfileScreen', () => {
    const mockProfiles = [
      {studentId: 10, firstName: 'Charlie', lastName: 'Brown'},
      {studentId: 20, firstName: 'Diana', lastName: 'Prince'},
    ];

    it('renders switch profile screen with profiles', () => {
      (useStudentProfilesQuery as jest.Mock).mockReturnValue({
        data: mockProfiles,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
        isRefetching: false,
      });

      const {getByText, getByTestId} = renderScreen(SwitchProfileScreen);

      expect(getByText('Switch Student')).toBeTruthy();
      expect(getByTestId('switch-profile-10')).toBeTruthy();
      expect(getByTestId('switch-profile-20')).toBeTruthy();
    });

    it('calls switch profile mutation when profile is selected', async () => {
      const mutateAsync = jest.fn().mockResolvedValue({
        success: true,
        data: {user: {firstName: 'Charlie'}},
      });
      (useStudentProfilesQuery as jest.Mock).mockReturnValue({
        data: mockProfiles,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
        isRefetching: false,
      });
      (useSwitchProfileMutation as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        mutateAsync,
        isPending: false,
        isError: false,
        error: null,
        reset: jest.fn(),
      });

      const {getByTestId} = renderScreen(SwitchProfileScreen);

      fireEvent.press(getByTestId('switch-profile-10'));

      await waitFor(() => {
        expect(mutateAsync).toHaveBeenCalledWith(10);
      });
      await waitFor(() => {
        expect(mockNavigation.dispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'RESET',
            payload: {
              index: 0,
              routes: [{name: 'Dashboard'}],
            },
          }),
        );
      });
    });

    it('shows session expired copy when profiles load returns unauthorized', () => {
      (useStudentProfilesQuery as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: true,
        error: new Error('Unauthorized'),
        refetch: jest.fn(),
        isRefetching: false,
      });

      const {getByText} = renderScreen(SwitchProfileScreen);

      expect(
        getByText(/Your session expired\. Please go back, log out, and sign in again\./),
      ).toBeTruthy();
      expect(getByText('Try Again')).toBeTruthy();
    });
  });

  describe('SubscriptionScreen', () => {
    it('renders subscription screen with plan selection', () => {
      const {getByTestId, getByText} = renderScreen(SubscriptionScreen);

      expect(getByTestId('subscription-screen')).toBeTruthy();
      expect(getByTestId('subscription-content')).toBeTruthy();
      expect(getByTestId('subscription-plan-selection')).toBeTruthy();
      expect(getByText('Subscription')).toBeTruthy();
    });

    it('renders free and premium plan cards', () => {
      const {getByTestId} = renderScreen(SubscriptionScreen);

      expect(getByTestId('subscription-plan-card-free')).toBeTruthy();
      expect(getByTestId('subscription-plan-card-premium')).toBeTruthy();
    });
  });

  describe('PermissionsScreen', () => {
    it('renders permissions screen with header and items', () => {
      const {getByText} = renderScreen(PermissionsScreen);

      expect(getByText('Permissions')).toBeTruthy();
      expect(getByText('Manage app permissions')).toBeTruthy();
      expect(getByText('Camera')).toBeTruthy();
      expect(getByText('Photo Library')).toBeTruthy();
      expect(getByText('Microphone')).toBeTruthy();
    });

    it('navigates back when back button is pressed', () => {
      const {getByText} = renderScreen(PermissionsScreen);

      fireEvent.press(getByText('←'));

      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  describe('VideoUploadScreen', () => {
    const route = {
      key: 'video-upload',
      name: 'VideoUpload' as const,
      params: {
        eventId: 'singing',
        eventTitle: 'Singing Competition',
        iconId: 'singing',
      },
    };

    it('renders video upload screen with event title', async () => {
      const {getByText} = renderScreen(VideoUploadScreen, {
        navigation: mockNavigation,
        route,
      });

      await waitFor(() => {
        expect(getByText('Singing Competition')).toBeTruthy();
      });
    });

    it('is a valid React component', () => {
      expect(VideoUploadScreen).toBeDefined();
      expect(typeof VideoUploadScreen).toBe('function');
    });
  });
});
