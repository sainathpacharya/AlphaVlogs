import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Alert, ScrollView, Dimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import {
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Divider,
  Badge,
  Pressable,
} from '@/components';
import {SUBSCRIPTION, PAYMENT_METHODS} from '@/constants';
import {useThemeColors} from '@/utils/colors';
import {subscriptionService} from '@/services/subscription-service';
import {useUserStore} from '@/stores';

const {width} = Dimensions.get('window');

interface PaymentMethod {
  id: string;
  type: 'cash' | 'cheque' | 'razorpay' | 'stripe' | 'paytm';
  name: string;
  isEnabled: boolean;
  icon?: string;
}

const SubscriptionScreen: React.FC = () => {
  const navigation = useNavigation();
  const colors = useThemeColors();
  const {user} = useUserStore();
  const styles = getStyles(colors);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium'>('free');
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setIsLoading(true);

      // Load current subscription
      const subscription = await subscriptionService.getCurrentSubscription();
      setCurrentSubscription(subscription);

      if (subscription?.plan === 'premium') {
        setSelectedPlan('premium');
      }

      // Load payment methods - prioritize Razorpay
      const methods = await subscriptionService.getPaymentMethods();

      // If no methods from API, use default Razorpay method
      const defaultMethods: PaymentMethod[] = [
        {
          id: 'razorpay',
          type: 'razorpay',
          name: 'Razorpay (UPI, Cards, Net Banking)',
          isEnabled: true,
          icon: '💳',
        },
      ];

      const finalMethods = methods.length > 0 ? methods : defaultMethods;
      setPaymentMethods(finalMethods);

      // Auto-select Razorpay if available
      const razorpayMethod = (finalMethods as any[]).find(
        (m: any) => m?.type === 'razorpay',
      );
      if (razorpayMethod) {
        setSelectedPaymentMethod(razorpayMethod.id);
      } else if (finalMethods.length > 0 && finalMethods[0]) {
        setSelectedPaymentMethod(finalMethods[0].id);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (selectedPlan === 'free') {
      Alert.alert('Free Plan', 'You are already on the free plan.');
      return;
    }

    if (!selectedPaymentMethod) {
      Alert.alert('Payment Method', 'Please select a payment method.');
      return;
    }

    try {
      setIsLoading(true);

      const paymentMethod = paymentMethods.find(
        m => m.id === selectedPaymentMethod,
      );

      if (!paymentMethod) {
        Alert.alert('Error', 'Selected payment method not found.');
        return;
      }

      // Create subscription
      const subscription = await subscriptionService.createSubscription({
        plan: 'premium',
        paymentMethod: paymentMethod.type,
        amount: SUBSCRIPTION.PRICING.PREMIUM_ANNUAL,
      });

      let paymentResult;

      // Handle Razorpay payment
      if (paymentMethod.type === 'razorpay') {
        try {
          // Prepare user details for Razorpay
          const userDetails = {
            email: user?.email || 'user@jackmarvels.com',
            contact: user?.mobile || '9999999999',
            name: `${user?.firstName || 'Jack'} ${user?.lastName || 'Marvels User'}`.trim(),
          };

          // Initiate Razorpay payment
          const razorpayResponse =
            await subscriptionService.initiateRazorpayPayment(
              SUBSCRIPTION.PRICING.PREMIUM_ANNUAL,
              userDetails,
              'Jack Marvels Premium Subscription',
            );

          // Process payment with Razorpay response
          paymentResult = await subscriptionService.processPayment({
            subscriptionId: subscription.id,
            paymentMethod: selectedPaymentMethod,
            paymentData: razorpayResponse,
          });
        } catch (razorpayError: any) {
          console.error('Razorpay payment error:', razorpayError);

          // Handle specific Razorpay errors
          if (razorpayError.message === 'Payment was cancelled by user') {
            Alert.alert(
              'Payment Cancelled',
              'You cancelled the payment. You can try again anytime.',
            );
            return;
          } else {
            Alert.alert(
              'Payment Error',
              razorpayError.message ||
                'Payment processing failed. Please try again.',
            );
            return;
          }
        }
      } else {
        // Process other payment methods
        paymentResult = await subscriptionService.processPayment({
          subscriptionId: subscription.id,
          paymentMethod: selectedPaymentMethod,
        });
      }

      if (paymentResult.success) {
        Alert.alert(
          '✅ Subscription Successful',
          `Welcome to Jack Marvels Premium! You now have access to all quizzes and premium features.\n\nTransaction ID: ${paymentResult.transactionId}`,
          [
            {
              text: 'Continue',
              onPress: () => {
                loadSubscriptionData();
                navigation.goBack();
              },
            },
          ],
        );
      } else {
        Alert.alert(
          '❌ Payment Failed',
          'Payment processing failed. Please try again or contact support.',
        );
      }
    } catch (error: any) {
      console.error('Error subscribing:', error);
      Alert.alert(
        '❌ Subscription Error',
        error.message || 'Something went wrong. Please try again later.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your premium subscription?',
      [
        {text: 'No', style: 'cancel'},
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await subscriptionService.cancelSubscription();
              if (success) {
                Alert.alert(
                  'Subscription Cancelled',
                  'Your subscription has been cancelled.',
                );
                loadSubscriptionData();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel subscription.');
            }
          },
        },
      ],
    );
  };

  const renderPlanCard = (plan: 'free' | 'premium', isSelected: boolean) => {
    const isPremium = plan === 'premium';
    const features =
      SUBSCRIPTION.FEATURES[
        plan.toUpperCase() as keyof typeof SUBSCRIPTION.FEATURES
      ];

    return (
      <Pressable
        testID={`subscription-plan-card-${plan}`}
        onPress={() => setSelectedPlan(plan)}
        style={[
          styles.planCard,
          isSelected && styles.selectedPlanCard,
          isPremium && styles.premiumCard,
        ]}>
        <VStack space="md" flex={1}>
          <HStack justifyContent="space-between" alignItems="center">
            <Text
              testID={`subscription-plan-title-${plan}`}
              style={[
                styles.planTitle,
                isSelected && styles.selectedPlanTitle,
              ]}>
              {isPremium ? 'Premium Plan' : 'Free Plan'}
            </Text>
            {isPremium && (
              <Badge
                testID={`subscription-plan-badge-${plan}`}
                action="success"
                variant="solid">
                ₹100/year
              </Badge>
            )}
          </HStack>

          <VStack testID={`subscription-plan-features-${plan}`} space="sm">
            {features.map((feature, index) => (
              <HStack key={index} space="sm" alignItems="center">
                <View
                  testID={`subscription-plan-checkmark-${plan}-${index}`}
                  style={[
                    styles.checkmark,
                    isSelected && styles.selectedCheckmark,
                  ]}
                />
                <Text
                  testID={`subscription-plan-feature-${plan}-${index}`}
                  style={[
                    styles.featureText,
                    isSelected && styles.selectedFeatureText,
                  ]}>
                  {feature}
                </Text>
              </HStack>
            ))}
          </VStack>

          {isPremium && (
            <Text
              testID={`subscription-plan-price-${plan}`}
              style={styles.priceText}>
              ₹{SUBSCRIPTION.PRICING.PREMIUM_ANNUAL}/year
            </Text>
          )}
        </VStack>
      </Pressable>
    );
  };

  const renderPaymentMethod = (method: PaymentMethod) => {
    const isSelected = selectedPaymentMethod === method.id;

    return (
      <Pressable
        key={method.id}
        testID={`subscription-payment-method-${method.id}`}
        onPress={() => setSelectedPaymentMethod(method.id)}
        style={[
          styles.paymentMethodCard,
          isSelected && styles.selectedPaymentMethod,
        ]}
        disabled={!method.isEnabled}>
        <HStack space="md" alignItems="center">
          <View
            testID={`subscription-payment-icon-${method.id}`}
            style={[
              styles.paymentIcon,
              !method.isEnabled && styles.disabledIcon,
            ]}
          />
          <VStack flex={1}>
            <Text
              testID={`subscription-payment-name-${method.id}`}
              style={[
                styles.paymentMethodName,
                !method.isEnabled && styles.disabledText,
              ]}>
              {method.name}
            </Text>
            {!method.isEnabled && (
              <Text
                testID={`subscription-payment-disabled-${method.id}`}
                style={styles.disabledText}>
                Coming Soon
              </Text>
            )}
          </VStack>
          {isSelected && (
            <View
              testID={`subscription-payment-selected-${method.id}`}
              style={styles.selectedIndicator}
            />
          )}
        </HStack>
      </Pressable>
    );
  };

  return (
    <ScrollView testID="subscription-screen" style={styles.container}>
      {/* Custom Header with Back Button */}
      <HStack
        testID="subscription-header"
        alignItems="center"
        justifyContent="space-between"
        p="$4"
        pt="$12"
        style={{backgroundColor: colors.primaryBackground}}>
        <Pressable
          testID="subscription-back-button"
          onPress={() => navigation.goBack()}
          p="$2"
          borderRadius="$md"
          style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
          <Text
            testID="subscription-back-arrow"
            style={{color: colors.white, fontSize: 18}}>
            ←
          </Text>
        </Pressable>
        <Text
          testID="subscription-title"
          style={[styles.headerTitle, {flex: 1, textAlign: 'center'}]}>
          Subscription
        </Text>
        <Box w="$10" />
      </HStack>

      <VStack testID="subscription-content" space="lg" p="$4">
        {/* Header */}
        <VStack
          testID="subscription-header-section"
          space="sm"
          alignItems="center">
          <LottieView
            testID="subscription-lottie"
            source={require('@/assets/lottie/quiz.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
          <Text testID="subscription-header-title" style={styles.headerTitle}>
            Choose Your Plan
          </Text>
          <Text
            testID="subscription-header-subtitle"
            style={styles.headerSubtitle}>
            Unlock premium features and access to all quizzes
          </Text>
        </VStack>

        {/* Current Subscription Status */}
        {currentSubscription && (
          <Box
            testID="subscription-current-status"
            style={styles.currentSubscriptionCard}>
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text
                  testID="subscription-current-plan"
                  style={styles.currentPlanText}>
                  Current Plan:{' '}
                  {currentSubscription.plan === 'premium' ? 'Premium' : 'Free'}
                </Text>
                {currentSubscription.plan === 'premium' && (
                  <Text
                    testID="subscription-expiry-date"
                    style={styles.expiryText}>
                    Expires:{' '}
                    {new Date(currentSubscription.endDate).toLocaleDateString()}
                  </Text>
                )}
              </VStack>
              {currentSubscription.plan === 'premium' && (
                <Button
                  testID="subscription-cancel-button"
                  onPress={handleCancelSubscription}
                  style={styles.cancelButton}>
                  <Text
                    testID="subscription-cancel-text"
                    style={{color: colors.white, fontWeight: 'bold'}}>
                    Cancel
                  </Text>
                </Button>
              )}
            </HStack>
          </Box>
        )}

        {/* Plan Selection */}
        <VStack testID="subscription-plan-selection" space="md">
          <Text testID="subscription-plan-title" style={styles.sectionTitle}>
            Select Plan
          </Text>
          <HStack space="md">
            {renderPlanCard('free', selectedPlan === 'free')}
            {renderPlanCard('premium', selectedPlan === 'premium')}
          </HStack>
        </VStack>

        {/* Payment Methods */}
        {selectedPlan === 'premium' && (
          <VStack testID="subscription-payment-methods" space="md">
            <Text
              testID="subscription-payment-title"
              style={styles.sectionTitle}>
              Payment Method
            </Text>
            <VStack space="sm">
              {paymentMethods.map(renderPaymentMethod)}
            </VStack>
          </VStack>
        )}

        {/* Subscribe Button */}
        {selectedPlan === 'premium' && (
          <Button
            testID="subscription-subscribe-button"
            onPress={handleSubscribe}
            disabled={isLoading || !selectedPaymentMethod}
            style={[
              styles.subscribeButton,
              (isLoading || !selectedPaymentMethod) && styles.disabledButton,
            ]}>
            <Text
              testID="subscription-subscribe-text"
              style={{color: colors.white, fontWeight: 'bold'}}>
              {isLoading ? 'Processing...' : 'Subscribe Now'}
            </Text>
          </Button>
        )}

        {/* Terms and Conditions */}
        <VStack testID="subscription-terms" space="sm">
          <Text testID="subscription-terms-text-1" style={styles.termsText}>
            By subscribing, you agree to our Terms of Service and Privacy
            Policy.
          </Text>
          <Text testID="subscription-terms-text-2" style={styles.termsText}>
            Subscription will auto-renew annually. Cancel anytime in your
            account settings.
          </Text>
        </VStack>
      </VStack>
    </ScrollView>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    lottie: {
      width: 120,
      height: 120,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.primaryText,
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: 16,
      color: colors.mutedText,
      textAlign: 'center',
    },
    currentSubscriptionCard: {
      backgroundColor: colors.cardBackground,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    currentPlanText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primaryText,
    },
    expiryText: {
      fontSize: 14,
      color: colors.mutedText,
      marginTop: 4,
    },
    cancelButton: {
      backgroundColor: colors.danger,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primaryText,
    },
    planCard: {
      flex: 1,
      backgroundColor: colors.cardBackground,
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
    },
    selectedPlanCard: {
      borderColor: colors.accentAction,
      backgroundColor: colors.cardBackground,
    },
    premiumCard: {
      borderColor: colors.success,
    },
    planTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primaryText,
    },
    selectedPlanTitle: {
      color: colors.accentAction,
    },
    checkmark: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: colors.border,
    },
    selectedCheckmark: {
      backgroundColor: colors.accentAction,
    },
    featureText: {
      fontSize: 14,
      color: colors.primaryText,
    },
    selectedFeatureText: {
      color: colors.primaryText,
    },
    priceText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.success,
      textAlign: 'center',
      marginTop: 8,
    },
    paymentMethodCard: {
      backgroundColor: colors.cardBackground,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectedPaymentMethod: {
      borderColor: colors.accentAction,
      backgroundColor: colors.cardBackground,
    },
    paymentIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.border,
    },
    disabledIcon: {
      backgroundColor: colors.border,
      opacity: 0.5,
    },
    paymentMethodName: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.primaryText,
    },
    disabledText: {
      color: colors.mutedText,
    },
    selectedIndicator: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.accentAction,
    },
    subscribeButton: {
      backgroundColor: colors.accentAction,
      paddingVertical: 16,
      borderRadius: 12,
      marginTop: 16,
    },
    disabledButton: {
      backgroundColor: colors.border,
    },
    termsText: {
      fontSize: 12,
      color: colors.mutedText,
      textAlign: 'center',
      lineHeight: 18,
    },
  });

export default SubscriptionScreen;
