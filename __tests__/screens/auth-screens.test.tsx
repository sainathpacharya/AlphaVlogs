import './setupScreenMocks';
import React from 'react';
import {fireEvent, waitFor} from '@testing-library/react-native';
import {useNavigation} from '@react-navigation/native';
import {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useSelectProfileMutation,
} from '@/hooks';
import {renderScreen} from '../utils/screen-test-utils';
import LoginScreen from '@/screens/Login';
import ProfileSelectionScreen from '@/screens/ProfileSelection';

jest.mock('react-native-confetti-cannon', () => {
  const React = require('react');
  const {View} = require('react-native');
  return (props: Record<string, unknown>) =>
    React.createElement(View, {testID: 'confetti-cannon', ...props});
});

describe('Auth Screens', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    replace: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
  });

  describe('LoginScreen', () => {
    it('renders login screen with key elements', () => {
      const {getByTestId, getByText, queryByTestId} = renderScreen(LoginScreen, {
        navigation: mockNavigation,
      });

      expect(getByTestId('login-screen')).toBeTruthy();
      expect(getByTestId('login-logo')).toBeTruthy();
      expect(getByTestId('login-mobile-field')).toBeTruthy();
      expect(getByTestId('login-submit-button')).toBeTruthy();
      expect(getByText('Register')).toBeTruthy();
      expect(queryByTestId('login-keyboard-dismiss')).toBeNull();
    });

    it('navigates to Registration when register link is pressed', () => {
      const {getByTestId} = renderScreen(LoginScreen, {
        navigation: mockNavigation,
      });

      fireEvent.press(getByTestId('login-register-button'));

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Signup');
    });

    it('shows error for invalid mobile number on submit', async () => {
      const {getByTestId, findByTestId} = renderScreen(LoginScreen, {
        navigation: mockNavigation,
      });

      fireEvent.changeText(getByTestId('login-mobile-field'), '123');
      fireEvent.press(getByTestId('login-submit-button'));

      expect(await findByTestId('login-mobile-error')).toBeTruthy();
    });

    it('calls send OTP mutation for valid mobile', async () => {
      const mutateAsync = jest.fn().mockResolvedValue({success: true});
      (useSendOtpMutation as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        mutateAsync,
        isPending: false,
        isError: false,
        error: null,
        reset: jest.fn(),
      });

      const {getByTestId} = renderScreen(LoginScreen, {
        navigation: mockNavigation,
      });

      fireEvent.changeText(getByTestId('login-mobile-field'), '9876543210');
      fireEvent.press(getByTestId('login-submit-button'));

      await waitFor(() => {
        expect(mutateAsync).toHaveBeenCalled();
      });
    });
  });

  describe('ProfileSelectionScreen', () => {
    const mockProfiles = [
      {
        studentId: 1,
        firstName: 'Alice',
        lastName: 'Smith',
        className: '5',
        schoolName: 'Test School',
        verified: true,
        isSubscribed: false,
      },
      {
        studentId: 2,
        firstName: 'Bob',
        lastName: 'Jones',
        className: '6',
        schoolName: 'Test School',
        verified: false,
        isSubscribed: false,
      },
    ];

    const route = {
      key: 'profile-selection',
      name: 'ProfileSelection' as const,
      params: {mobile: '9876543210', otp: '123456', profiles: mockProfiles},
    };

    it('renders profile selection screen with student profiles', () => {
      const {getByText, getByTestId} = renderScreen(ProfileSelectionScreen, {
        navigation: mockNavigation,
        route,
      });

      expect(getByText('Select Student')).toBeTruthy();
      expect(getByText(/Multiple students are linked/)).toBeTruthy();
      expect(getByTestId('profile-selection-1')).toBeTruthy();
      expect(getByTestId('profile-selection-2')).toBeTruthy();
      expect(getByText('Alice Smith')).toBeTruthy();
      expect(getByText('Bob Jones')).toBeTruthy();
    });

    it('calls select profile mutation with otp when a profile is pressed', async () => {
      const mutateAsync = jest
        .fn()
        .mockResolvedValue({success: true, data: {user: {firstName: 'Alice'}}});
      (useSelectProfileMutation as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        mutateAsync,
        isPending: false,
        isError: false,
        error: null,
        reset: jest.fn(),
      });

      const {getByTestId} = renderScreen(ProfileSelectionScreen, {
        navigation: mockNavigation,
        route,
      });

      fireEvent.press(getByTestId('profile-selection-1'));

      await waitFor(() => {
        expect(mutateAsync).toHaveBeenCalledWith({
          studentId: 1,
          mobile: '9876543210',
          otp: '123456',
        });
      });
    });

    it('shows session expired alert when OTP verification is required', async () => {
      const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');
      const mutateAsync = jest.fn().mockResolvedValue({
        success: false,
        error: 'OTP verification required before profile selection',
        statusCode: 400,
      });
      (useSelectProfileMutation as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        mutateAsync,
        isPending: false,
        isError: false,
        error: null,
        reset: jest.fn(),
      });

      const {getByTestId} = renderScreen(ProfileSelectionScreen, {
        navigation: mockNavigation,
        route,
      });

      fireEvent.press(getByTestId('profile-selection-1'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Session Expired',
          'OTP verification required before profile selection',
          expect.any(Array),
        );
      });
      alertSpy.mockRestore();
    });

    it('shows login success alert after selecting a student', async () => {
      const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');
      const mutateAsync = jest.fn().mockResolvedValue({
        success: true,
        data: {user: {firstName: 'Alice'}, tokens: {accessToken: 'a', refreshToken: 'r', expiresIn: 3600}},
      });
      (useSelectProfileMutation as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        mutateAsync,
        isPending: false,
        isError: false,
        error: null,
        reset: jest.fn(),
      });

      const {getByTestId} = renderScreen(ProfileSelectionScreen, {
        navigation: mockNavigation,
        route,
      });

      fireEvent.press(getByTestId('profile-selection-1'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Login Successful',
          'Welcome Alice!',
        );
      });
      alertSpy.mockRestore();
    });

    it('navigates back when back button is pressed', () => {
      const {getByText} = renderScreen(ProfileSelectionScreen, {
        navigation: mockNavigation,
        route,
      });

      fireEvent.press(getByText('← Back'));

      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });
});
