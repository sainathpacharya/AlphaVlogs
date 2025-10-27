import React from 'react';
import {render, fireEvent, waitFor, act} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import DashboardScreen from '../../src/screens/Dashboard/index';

// Mock the navigation
const mockNavigation = {
  navigate: jest.fn(),
};

// Mock the user store
jest.mock('../../src/stores', () => ({
  useUserStore: () => ({
    user: {
      firstName: 'John',
      lastName: 'Doe',
      profileImage: null,
    },
  }),
}));

// Mock the events service
jest.mock('../../src/services/events-service', () => ({
  eventsService: {
    getEvents: jest.fn(),
  },
}));

// Mock the permissions hook
jest.mock('../../src/hooks/usePermissions', () => ({
  usePermissions: () => ({
    requestEssentialPermissions: jest.fn().mockResolvedValue(true),
  }),
}));

// Mock the translation hook
jest.mock('../../src/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'dashboard.unlockPremium': 'Unlock Premium',
        'dashboard.accessAllQuizzes': 'Access all quizzes and features',
        'dashboard.subscribe': 'Subscribe',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock the theme colors
jest.mock('../../src/utils/colors', () => ({
  useThemeColors: () => ({
    primaryBackground: '#FFFFFF',
    primaryText: '#000000',
    accentAction: '#007AFF',
    mutedText: '#888888',
    cardBackground: '#F5F5F5',
    border: '#E0E0E0',
    buttonText: '#FFFFFF',
    white: '#FFFFFF',
  }),
}));

// Mock the status bar
jest.mock('@/components/status-bar', () => ({
  StatusBar: ({testID, ...props}: any) => <div testID={testID} {...props} />,
}));

// Mock LottieView
jest.mock('lottie-react-native', () => ({
  default: ({testID, ...props}: any) => <div testID={testID} {...props} />,
}));

// Mock Reanimated
jest.mock('react-native-reanimated', () => ({
  useSharedValue: jest.fn(() => ({value: 0})),
  useAnimatedStyle: jest.fn(() => ({})),
  withSpring: jest.fn(),
  createAnimatedComponent: jest.fn(Component => Component),
}));

// Mock Dimensions
jest.mock('../../src/utils/styles', () => ({
  DIMENSIONS: {
    cardWidth: 150,
    cardHeight: 120,
    borderRadius: {
      large: 12,
    },
    padding: {
      sm: 8,
    },
    margin: {
      sm: 4,
    },
  },
}));

describe('DashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockEvents = [
    {id: 'event_001', title: 'National Anthem'},
    {id: 'event_002', title: 'Singing'},
    {id: 'event_003', title: 'Dancing'},
  ];

  const renderScreen = () => {
    return render(
      <NavigationContainer>
        <DashboardScreen />
      </NavigationContainer>,
    );
  };

  describe('Screen Rendering', () => {
    it('should render the dashboard screen', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('dashboard-screen')).toBeTruthy();
      expect(getByTestId('dashboard-container')).toBeTruthy();
    });

    it('should render header with greeting and profile', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('dashboard-header')).toBeTruthy();
      expect(getByTestId('dashboard-greeting')).toBeTruthy();
      expect(getByTestId('dashboard-greeting-text')).toBeTruthy();
      expect(getByTestId('dashboard-user-name')).toBeTruthy();
      expect(getByTestId('dashboard-profile-button')).toBeTruthy();
    });

    it('should render subscription banner', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('dashboard-subscription-banner')).toBeTruthy();
      expect(getByTestId('dashboard-subscription-title')).toBeTruthy();
      expect(getByTestId('dashboard-subscription-description')).toBeTruthy();
      expect(getByTestId('dashboard-subscription-button')).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when loading', async () => {
      const eventsService =
        require('../../src/services/events-service').eventsService;
      eventsService.getEvents.mockImplementation(() => new Promise(() => {})); // Never resolves

      const {getByTestId} = renderScreen();

      expect(getByTestId('dashboard-loading')).toBeTruthy();
      expect(getByTestId('dashboard-loading-spinner')).toBeTruthy();
      expect(getByTestId('dashboard-loading-text')).toBeTruthy();
    });
  });

  describe('Events List', () => {
    beforeEach(() => {
      const eventsService =
        require('../../src/services/events-service').eventsService;
      eventsService.getEvents.mockResolvedValue({
        success: true,
        data: {
          data: mockEvents,
        },
      });
    });

    it('should render events list when loaded', async () => {
      const {getByTestId} = renderScreen();

      await waitFor(() => {
        expect(getByTestId('dashboard-events-list')).toBeTruthy();
      });
    });

    it('should render event cards', async () => {
      const {getByTestId} = renderScreen();

      await waitFor(() => {
        mockEvents.forEach(event => {
          expect(getByTestId(`dashboard-event-card-${event.id}`)).toBeTruthy();
          expect(getByTestId(`dashboard-event-title-${event.id}`)).toBeTruthy();
          expect(
            getByTestId(`dashboard-event-lottie-${event.id}`),
          ).toBeTruthy();
        });
      });
    });

    it('should navigate to VideoUpload when event card is pressed', async () => {
      const {getByTestId} = renderScreen();

      await waitFor(() => {
        const eventCard = getByTestId('dashboard-event-card-event_001');
        fireEvent.press(eventCard);
      });

      expect(mockNavigation.navigate).toHaveBeenCalledWith('VideoUpload', {
        eventId: 'event_001',
        eventTitle: 'National Anthem',
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to Profile when profile button is pressed', async () => {
      const {getByTestId} = renderScreen();

      const profileButton = getByTestId('dashboard-profile-button');

      await act(async () => {
        fireEvent.press(profileButton);
      });

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Profile');
    });

    it('should navigate to Subscription when subscription button is pressed', async () => {
      const {getByTestId} = renderScreen();

      const subscriptionButton = getByTestId('dashboard-subscription-button');

      await act(async () => {
        fireEvent.press(subscriptionButton);
      });

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Subscription');
    });
  });

  describe('User Display', () => {
    it('should display user name in greeting', () => {
      const {getByTestId} = renderScreen();

      const userName = getByTestId('dashboard-user-name');
      expect(userName.props.children).toBe('John Doe!');
    });

    it('should display appropriate greeting based on time', () => {
      const {getByTestId} = renderScreen();

      const greeting = getByTestId('dashboard-greeting-text');
      expect(greeting.props.children).toMatch(
        /Good (Morning|Afternoon|Evening)/,
      );
    });

    it('should show user initial in profile button', () => {
      const {getByTestId} = renderScreen();

      const profileInitial = getByTestId('dashboard-profile-initial');
      expect(profileInitial.props.children).toBe('J');
    });
  });

  describe('Error Handling', () => {
    it('should show fallback events when API fails', async () => {
      const eventsService =
        require('../../src/services/events-service').eventsService;
      eventsService.getEvents.mockRejectedValue(new Error('API Error'));

      const {getByTestId} = renderScreen();

      await waitFor(() => {
        expect(getByTestId('dashboard-events-list')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('dashboard-screen')).toBeTruthy();
      expect(getByTestId('dashboard-title')).toBeTruthy();
      expect(getByTestId('dashboard-profile-button')).toBeTruthy();
      expect(getByTestId('dashboard-subscription-button')).toBeTruthy();
    });
  });
});
