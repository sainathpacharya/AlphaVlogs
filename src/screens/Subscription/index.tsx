import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Crown} from 'lucide-react-native';
import {
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Badge,
  Pressable,
} from '@/components';
import {SUBSCRIPTION} from '@/constants';
import {useThemeColors} from '@/utils/colors';
import {subscriptionService} from '@/services/subscription-service';
import {PaymentApiError} from '@/services/payment-service';
import {canAccessPayment} from '@/utils/payment';
import {devLog} from '@/utils/dev-log';
import {getApiBaseUrl} from '@/constants';
import {isMockMode} from '@/config/api-config';
import {useUser, useUserStore} from '@/stores';
import {useIsMounted} from '@/hooks';
import {InfoScreenLayout} from '@/components/InfoScreenLayout';

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
  const isMounted = useIsMounted();
  const user = useUser();
  const setUser = useUserStore(state => state.setUser);
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium'>('free');
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<{
    id: string;
    plan: string;
    endDate?: string;
  } | null>(null);

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        const subscription = await subscriptionService.getCurrentSubscription(user.id);
        if (cancelled) {
          return;
        }
        setCurrentSubscription(subscription);

        if (subscription?.plan === 'premium') {
          setSelectedPlan('premium');
        }

        const methods = await subscriptionService.getPaymentMethods();
        if (cancelled) {
          return;
        }

        const defaultMethods: PaymentMethod[] = [
          {
            id: 'razorpay',
            type: 'razorpay',
            name: 'Razorpay (UPI, Cards, Net Banking)',
            isEnabled: true,
            icon: '💳',
          },
        ];

        const mockOnlyMethods: PaymentMethod[] = isMockMode()
          ? [
              {id: 'cash', type: 'cash', name: 'Cash', isEnabled: true},
              {id: 'cheque', type: 'cheque', name: 'Cheque', isEnabled: true},
            ]
          : [];

        const finalMethods =
          methods.length > 0
            ? methods.filter(
                m =>
                  m.type === 'razorpay' ||
                  (isMockMode() && (m.type === 'cash' || m.type === 'cheque')),
              )
            : [...defaultMethods, ...mockOnlyMethods];
        setPaymentMethods(finalMethods);

        const razorpayMethod = (finalMethods as PaymentMethod[]).find(
          m => m?.type === 'razorpay',
        );
        if (razorpayMethod) {
          setSelectedPaymentMethod(razorpayMethod.id);
        } else if (finalMethods.length > 0 && finalMethods[0]) {
          setSelectedPaymentMethod(finalMethods[0].id);
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Error loading subscription data:', error);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const loadSubscriptionData = useCallback(async () => {
    if (!user?.id) {
      return;
    }
    try {
      if (isMounted.current) {
        setIsLoading(true);
      }

      const subscription = await subscriptionService.getCurrentSubscription(user.id);
      if (!isMounted.current) {
        return;
      }
      setCurrentSubscription(subscription);

      if (subscription?.plan === 'premium') {
        setSelectedPlan('premium');
      }

      const methods = await subscriptionService.getPaymentMethods();
      if (!isMounted.current) {
        return;
      }

      const defaultMethods: PaymentMethod[] = [
        {
          id: 'razorpay',
          type: 'razorpay',
          name: 'Razorpay (UPI, Cards, Net Banking)',
          isEnabled: true,
          icon: '💳',
        },
      ];

      const mockOnlyMethods: PaymentMethod[] = isMockMode()
        ? [
            {id: 'cash', type: 'cash', name: 'Cash', isEnabled: true},
            {id: 'cheque', type: 'cheque', name: 'Cheque', isEnabled: true},
          ]
        : [];

      const finalMethods =
        methods.length > 0
          ? methods.filter(
              m =>
                m.type === 'razorpay' ||
                (isMockMode() && (m.type === 'cash' || m.type === 'cheque')),
            )
          : [...defaultMethods, ...mockOnlyMethods];
      setPaymentMethods(finalMethods);

      const razorpayMethod = (finalMethods as PaymentMethod[]).find(
        m => m?.type === 'razorpay',
      );
      if (razorpayMethod) {
        setSelectedPaymentMethod(razorpayMethod.id);
      } else if (finalMethods.length > 0 && finalMethods[0]) {
        setSelectedPaymentMethod(finalMethods[0].id);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error loading subscription data:', error);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [user?.id, isMounted]);

  const handleSubscribe = async () => {
    if (selectedPlan === 'free') {
      Alert.alert('Free Plan', 'You are already on the free plan.');
      return;
    }

    if (!canAccessPayment(user)) {
      Alert.alert(
        'Not available',
        'Subscription payment is only available for student accounts.',
      );
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please log in to subscribe.');
      return;
    }

    if (!selectedPaymentMethod) {
      Alert.alert('Payment Method', 'Please select a payment method.');
      return;
    }

    try {
      if (isMounted.current) {
        setIsLoading(true);
      }

      const paymentMethod = paymentMethods.find(
        m => m.id === selectedPaymentMethod,
      );

      if (!paymentMethod) {
        if (isMounted.current) {
          Alert.alert('Error', 'Selected payment method not found.');
        }
        return;
      }

      if (paymentMethod.type === 'razorpay') {
        devLog('Subscription.handleSubscribe razorpay', {
          apiBaseUrl: getApiBaseUrl(),
          amountPaise: SUBSCRIPTION.PRICING.PREMIUM_ANNUAL_PAISE,
          userId: user.id,
        });
        try {
          const result = await subscriptionService.completeRazorpayCheckout(
            user,
            SUBSCRIPTION.PRICING.PREMIUM_ANNUAL_PAISE,
          );

          if (!isMounted.current) {
            return;
          }

          if (result.success) {
            setUser({
              ...user,
              isSubscribed: true,
              subscriptionStatus: 'active',
            });

            Alert.alert(
              '✅ Subscription Successful',
              `Welcome to Jack Marvels Premium! You now have access to all quizzes and premium features.\n\nPayment ID: ${result.paymentId}`,
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
              'Payment could not be verified. Please try again or contact support.',
            );
          }
        } catch (razorpayError: unknown) {
          if (__DEV__) {
            console.error('Razorpay payment error:', razorpayError);
          }

          if (!isMounted.current) {
            return;
          }

          if (razorpayError instanceof PaymentApiError) {
            if (razorpayError.statusCode === 403) {
              Alert.alert(
                'Not authorized',
                'Your account cannot access payment. Please contact support.',
              );
              return;
            }
            Alert.alert('Payment Error', razorpayError.message);
            return;
          }

          const message =
            razorpayError instanceof Error
              ? razorpayError.message
              : 'Payment failed';
          if (message === 'Payment was cancelled by user') {
            Alert.alert(
              'Payment Cancelled',
              'You cancelled the payment. You can try again anytime.',
            );
          } else {
            Alert.alert(
              'Payment Error',
              message || 'Payment processing failed. Please try again.',
            );
          }
        }
        return;
      }

      // Mock-only cash / cheque flow
      const subscription = await subscriptionService.createSubscription({
        plan: 'premium',
        paymentMethod: paymentMethod.type as 'cash' | 'cheque',
        amount: SUBSCRIPTION.PRICING.PREMIUM_ANNUAL,
        userId: user.id,
      });

      if (!isMounted.current) {
        return;
      }

      const paymentResult = await subscriptionService.processPayment({
        subscriptionId: subscription.id,
        amount: SUBSCRIPTION.PRICING.PREMIUM_ANNUAL,
        paymentMethod: selectedPaymentMethod,
      });

      if (!isMounted.current) {
        return;
      }

      if (paymentResult?.success) {
        setUser({
          ...user,
          isSubscribed: true,
          subscriptionStatus: 'active',
        });
        Alert.alert(
          '✅ Subscription Successful',
          `Welcome to Jack Marvels Premium!\n\nTransaction ID: ${(paymentResult as { transactionId?: string }).transactionId ?? 'N/A'}`,
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
    } catch (error: unknown) {
      if (__DEV__) {
        console.error('Error subscribing:', error);
      }
      if (isMounted.current) {
        const message =
          error instanceof Error ? error.message : 'Something went wrong. Please try again later.';
        Alert.alert('❌ Subscription Error', message);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
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
            if (!currentSubscription?.id) {
              Alert.alert('Error', 'No active subscription to cancel.');
              return;
            }
            try {
              const success = await subscriptionService.cancelSubscription(
                currentSubscription.id,
              );
              if (!isMounted.current) {
                return;
              }
              if (success) {
                Alert.alert(
                  'Subscription Cancelled',
                  'Your subscription has been cancelled.',
                );
                loadSubscriptionData();
              } else {
                Alert.alert('Error', 'Failed to cancel subscription.');
              }
            } catch (error) {
              if (isMounted.current) {
                Alert.alert('Error', 'Failed to cancel subscription.');
              }
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
    <InfoScreenLayout testID="subscription-screen" title="Subscription">
      <VStack testID="subscription-content" space="lg">
        {/* Header */}
        <VStack
          testID="subscription-header-section"
          space="sm"
          alignItems="center">
          <Crown
            testID="subscription-icon"
            size={72}
            color={colors.accentAction}
            strokeWidth={1.75}
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
                {currentSubscription.plan === 'premium' && currentSubscription.endDate && (
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
        {selectedPlan === 'premium' && canAccessPayment(user) && (
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
    </InfoScreenLayout>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
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
