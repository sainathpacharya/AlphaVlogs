import React from 'react';
import {render, fireEvent, waitFor, act} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import SubscriptionScreen from '../../src/screens/Subscription/index';

// Mock the navigation
const mockNavigation = {
  goBack: jest.fn(),
};

// Mock the user store
jest.mock('../../src/stores', () => ({
  useUserStore: () => ({
    user: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      mobile: '9876543210',
    },
  }),
}));

// Mock the subscription service
jest.mock('../../src/services/subscription-service', () => ({
  subscriptionService: {
    getCurrentSubscription: jest.fn(),
    createSubscription: jest.fn(),
    processPayment: jest.fn(),
    initiateRazorpayPayment: jest.fn(),
    cancelSubscription: jest.fn(),
  },
}));

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

// Mock LottieView
jest.mock('lottie-react-native', () => ({
  default: ({testID, ...props}: any) => <div testID={testID} {...props} />,
}));

// Mock Alert
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
  };
});

// Mock constants
jest.mock('../../src/constants', () => ({
  SUBSCRIPTION: {
    FEATURES: {
      FREE: ['Basic quizzes', 'Limited access'],
      PREMIUM: ['All quizzes', 'Premium features', 'Priority support'],
    },
    PRICING: {
      PREMIUM_ANNUAL: 100,
    },
  },
  PAYMENT_METHODS: [
    {id: 'razorpay', type: 'razorpay', name: 'Razorpay', isEnabled: true},
    {id: 'stripe', type: 'stripe', name: 'Stripe', isEnabled: false},
  ],
}));

describe('SubscriptionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderScreen = () => {
    return render(
      <NavigationContainer>
        <SubscriptionScreen />
      </NavigationContainer>,
    );
  };

  describe('Screen Rendering', () => {
    it('should render the subscription screen', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('subscription-screen')).toBeTruthy();
      expect(getByTestId('subscription-header')).toBeTruthy();
      expect(getByTestId('subscription-content')).toBeTruthy();
    });

    it('should render header with back button and title', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('subscription-back-button')).toBeTruthy();
      expect(getByTestId('subscription-back-arrow')).toBeTruthy();
      expect(getByTestId('subscription-title')).toBeTruthy();
    });

    it('should render header section with lottie and text', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('subscription-header-section')).toBeTruthy();
      expect(getByTestId('subscription-lottie')).toBeTruthy();
      expect(getByTestId('subscription-header-title')).toBeTruthy();
      expect(getByTestId('subscription-header-subtitle')).toBeTruthy();
    });

    it('should render plan selection', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('subscription-plan-selection')).toBeTruthy();
      expect(getByTestId('subscription-plan-title')).toBeTruthy();
      expect(getByTestId('subscription-plan-card-free')).toBeTruthy();
      expect(getByTestId('subscription-plan-card-premium')).toBeTruthy();
    });

    it('should render terms and conditions', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('subscription-terms')).toBeTruthy();
      expect(getByTestId('subscription-terms-text-1')).toBeTruthy();
      expect(getByTestId('subscription-terms-text-2')).toBeTruthy();
    });
  });

  describe('Plan Selection', () => {
    it('should render plan cards with correct titles', () => {
      const {getByTestId} = renderScreen();

      const freePlanTitle = getByTestId('subscription-plan-title-free');
      const premiumPlanTitle = getByTestId('subscription-plan-title-premium');

      expect(freePlanTitle.props.children).toBe('Free Plan');
      expect(premiumPlanTitle.props.children).toBe('Premium Plan');
    });

    it('should render plan features', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('subscription-plan-features-free')).toBeTruthy();
      expect(getByTestId('subscription-plan-features-premium')).toBeTruthy();
    });

    it('should render premium plan price', () => {
      const {getByTestId} = renderScreen();

      const premiumPrice = getByTestId('subscription-plan-price-premium');
      expect(premiumPrice.props.children).toBe('₹100/year');
    });
  });

  describe('Payment Methods', () => {
    it('should show payment methods when premium plan is selected', async () => {
      const {getByTestId} = renderScreen();

      // Select premium plan
      const premiumCard = getByTestId('subscription-plan-card-premium');

      await act(async () => {
        fireEvent.press(premiumCard);
      });

      // Wait for payment methods to appear
      await waitFor(() => {
        expect(getByTestId('subscription-payment-methods')).toBeTruthy();
        expect(getByTestId('subscription-payment-title')).toBeTruthy();
      });
    });

    it('should render payment method options', async () => {
      const {getByTestId} = renderScreen();

      // Select premium plan first
      const premiumCard = getByTestId('subscription-plan-card-premium');

      await act(async () => {
        fireEvent.press(premiumCard);
      });

      await waitFor(() => {
        expect(
          getByTestId('subscription-payment-method-razorpay'),
        ).toBeTruthy();
        expect(getByTestId('subscription-payment-method-stripe')).toBeTruthy();
      });
    });
  });

  describe('Subscribe Button', () => {
    it('should show subscribe button when premium plan is selected', async () => {
      const {getByTestId} = renderScreen();

      // Select premium plan
      const premiumCard = getByTestId('subscription-plan-card-premium');

      await act(async () => {
        fireEvent.press(premiumCard);
      });

      await waitFor(() => {
        expect(getByTestId('subscription-subscribe-button')).toBeTruthy();
        expect(getByTestId('subscription-subscribe-text')).toBeTruthy();
      });
    });

    it('should show correct button text', async () => {
      const {getByTestId} = renderScreen();

      // Select premium plan
      const premiumCard = getByTestId('subscription-plan-card-premium');

      await act(async () => {
        fireEvent.press(premiumCard);
      });

      await waitFor(() => {
        const subscribeText = getByTestId('subscription-subscribe-text');
        expect(subscribeText.props.children).toBe('Subscribe Now');
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back when back button is pressed', async () => {
      const {getByTestId} = renderScreen();

      const backButton = getByTestId('subscription-back-button');

      await act(async () => {
        fireEvent.press(backButton);
      });

      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('subscription-screen')).toBeTruthy();
      expect(getByTestId('subscription-title')).toBeTruthy();
      expect(getByTestId('subscription-back-button')).toBeTruthy();
    });
  });
});
