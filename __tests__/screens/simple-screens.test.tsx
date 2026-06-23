import './setupScreenMocks';
import React from 'react';
import {fireEvent} from '@testing-library/react-native';
import {useNavigation} from '@react-navigation/native';
import {renderScreen} from '../utils/screen-test-utils';
import LoadingScreen from '@/screens/Loading';
import WelcomeScreen from '@/screens/Welcome';
import QuizScreen from '@/screens/Quiz';
import ResultsScreen from '@/screens/Results';
import PrivacyPolicyScreen from '@/screens/PrivacyPolicy';
import TermsAndConditionsScreen from '@/screens/TermsAndConditions';
import {PRIVACY_POLICY} from '@/content';
import {TERMS_AND_CONDITIONS} from '@/content';

describe('Simple Screens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('LoadingScreen', () => {
    it('renders loading screen with key elements', () => {
      const {getByTestId, getByText} = renderScreen(LoadingScreen);

      expect(getByTestId('loading-screen')).toBeTruthy();
      expect(getByTestId('loading-container')).toBeTruthy();
      expect(getByTestId('loading-logo')).toBeTruthy();
      expect(getByTestId('loading-spinner')).toBeTruthy();
      expect(getByText('Loading...')).toBeTruthy();
    });

    it('is a valid React component', () => {
      expect(LoadingScreen).toBeDefined();
      expect(typeof LoadingScreen).toBe('function');
    });
  });

  describe('WelcomeScreen', () => {
    it('renders welcome screen with key elements', () => {
      const {getByTestId} = renderScreen(WelcomeScreen);

      expect(getByTestId('welcome-screen')).toBeTruthy();
      expect(getByTestId('welcome-container')).toBeTruthy();
      expect(getByTestId('welcome-logo')).toBeTruthy();
    });

    it('navigates to Login after timeout', () => {
      const mockNavigate = jest.fn();
      (useNavigation as jest.Mock).mockReturnValue({
        navigate: jest.fn(),
        goBack: jest.fn(),
        replace: mockNavigate,
      });

      renderScreen(WelcomeScreen);

      jest.advanceTimersByTime(2500);

      expect(mockNavigate).toHaveBeenCalledWith('Login');
    });
  });

  describe('QuizScreen', () => {
    it('renders quiz screen with title and coming soon message', () => {
      const {getByTestId, getByText} = renderScreen(QuizScreen);

      expect(getByTestId('quiz-screen')).toBeTruthy();
      expect(getByTestId('quiz-title')).toBeTruthy();
      expect(getByText('Quiz')).toBeTruthy();
      expect(getByText('Quiz Screen - Coming Soon')).toBeTruthy();
      expect(getByText('This screen is under development')).toBeTruthy();
    });

    it('calls goBack when back button is pressed', () => {
      const mockGoBack = jest.fn();
      (useNavigation as jest.Mock).mockReturnValue({
        navigate: jest.fn(),
        goBack: mockGoBack,
        replace: jest.fn(),
      });

      const {getByTestId} = renderScreen(QuizScreen);
      fireEvent.press(getByTestId('quiz-back-button'));

      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe('ResultsScreen', () => {
    it('renders results screen with title and coming soon message', () => {
      const {getByText} = renderScreen(ResultsScreen);

      expect(getByText('Results')).toBeTruthy();
      expect(getByText('Results Screen - Coming Soon')).toBeTruthy();
      expect(getByText('This screen is under development')).toBeTruthy();
    });

    it('calls goBack when back button is pressed', () => {
      const mockGoBack = jest.fn();
      (useNavigation as jest.Mock).mockReturnValue({
        navigate: jest.fn(),
        goBack: mockGoBack,
        replace: jest.fn(),
      });

      const {getByText} = renderScreen(ResultsScreen);
      fireEvent.press(getByText('←'));

      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe('PrivacyPolicyScreen', () => {
    it('renders privacy policy screen with title and content', () => {
      const {getByTestId, getByText} = renderScreen(PrivacyPolicyScreen);

      expect(getByTestId('privacy-screen')).toBeTruthy();
      expect(getByTestId('privacy-screen-title')).toBeTruthy();
      expect(getByText(PRIVACY_POLICY.title)).toBeTruthy();
      expect(getByTestId('legal-document-body')).toBeTruthy();
      expect(getByText(PRIVACY_POLICY.intro)).toBeTruthy();
    });
  });

  describe('TermsAndConditionsScreen', () => {
    it('renders terms screen with title and content', () => {
      const {getByTestId, getByText} = renderScreen(TermsAndConditionsScreen);

      expect(getByTestId('terms-screen')).toBeTruthy();
      expect(getByTestId('terms-screen-title')).toBeTruthy();
      expect(getByText(TERMS_AND_CONDITIONS.title)).toBeTruthy();
      expect(getByTestId('legal-document-body')).toBeTruthy();
      expect(getByText(TERMS_AND_CONDITIONS.intro)).toBeTruthy();
    });
  });
});
