import React from 'react';
import {render, fireEvent, act} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import QuizScreen from '../../src/screens/Quiz/index';

// Mock the navigation
const mockNavigation = {
  goBack: jest.fn(),
};

// Mock the theme colors
jest.mock('../../src/utils/colors', () => ({
  useThemeColors: () => ({
    primaryBackground: '#FFFFFF',
    primaryText: '#000000',
    accentAction: '#007AFF',
    mutedText: '#888888',
    white: '#FFFFFF',
  }),
}));

describe('QuizScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderScreen = () => {
    return render(
      <NavigationContainer>
        <QuizScreen />
      </NavigationContainer>,
    );
  };

  describe('Screen Rendering', () => {
    it('should render the quiz screen', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('quiz-screen')).toBeTruthy();
      expect(getByTestId('quiz-header')).toBeTruthy();
      expect(getByTestId('quiz-content')).toBeTruthy();
    });

    it('should render header with back button and title', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('quiz-back-button')).toBeTruthy();
      expect(getByTestId('quiz-back-arrow')).toBeTruthy();
      expect(getByTestId('quiz-title')).toBeTruthy();
    });

    it('should render coming soon message', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('quiz-coming-soon')).toBeTruthy();
      expect(getByTestId('quiz-development-message')).toBeTruthy();
    });

    it('should display correct coming soon text', () => {
      const {getByTestId} = renderScreen();

      const comingSoonText = getByTestId('quiz-coming-soon');
      const developmentText = getByTestId('quiz-development-message');

      expect(comingSoonText.props.children).toBe('Quiz Screen - Coming Soon');
      expect(developmentText.props.children).toBe(
        'This screen is under development',
      );
    });
  });

  describe('Navigation', () => {
    it('should navigate back when back button is pressed', async () => {
      const {getByTestId} = renderScreen();

      const backButton = getByTestId('quiz-back-button');

      await act(async () => {
        fireEvent.press(backButton);
      });

      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('quiz-screen')).toBeTruthy();
      expect(getByTestId('quiz-title')).toBeTruthy();
      expect(getByTestId('quiz-back-button')).toBeTruthy();
      expect(getByTestId('quiz-coming-soon')).toBeTruthy();
      expect(getByTestId('quiz-development-message')).toBeTruthy();
    });
  });
});
