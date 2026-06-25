import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {View, StyleSheet, Alert, useWindowDimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Check, Crown} from 'lucide-react-native';
import {
  VStack,
  HStack,
  Text,
  Button,
  Box,
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
import {useLogoutMutation} from '@/hooks/api/use-auth-api';
import {InfoScreenLayout} from '@/components/InfoScreenLayout';

interface PaymentMethod {
  id: string;
  type: 'cash' | 'cheque' | 'razorpay' | 'stripe' | 'paytm';
  name: string;
  isEnabled: boolean;
  icon?: string;
}

const PLAN_STACK_BREAKPOINT = 480;
const CONTENT_MAX_WIDTH = 600;

const getPaymentDisplayName = (method: PaymentMethod) => {
  if (method.type === 'razorpay') {
    return 'Razorpay';
  }
  return method.name;
};

const SubscriptionScreen: React.FC = () => {
  const navigation = useNavigation();
  const colors = useThemeColors();
  const {width: screenWidth} = useWindowDimensions();
  const isMounted = useIsMounted();
  const user = useUser();
  const setUser = useUserStore(state => state.setUser);
  const logoutMutation = useLogoutMutation();
  const isStackedPlans = screenWidth < PLAN_STACK_BREAKPOINT;
  const isWideLayout = screenWidth >= 768;
  const styles = useMemo(
    () => getStyles(colors, screenWidth),
    [colors, screenWidth],
  );
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

  const handleSessionExpired = useCallback(
    (message: string) => {
      Alert.alert('Session expired', message, [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Log in again',
          onPress: () => {
            logoutMutation.mutate();
          },
        },
      ]);
    },
    [logoutMutation],
  );

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
            if (razorpayError.statusCode === 404) {
              Alert.alert('Payment unavailable', razorpayError.message);
              return;
            }
            if (razorpayError.statusCode === 401) {
              handleSessionExpired(razorpayError.message);
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
          isStackedPlans && styles.planCardStacked,
          isSelected &&
            (isPremium ? styles.selectedPremiumCard : styles.selectedFreeCard),
        ]}>
        <VStack space="md" flex={1} justifyContent="space-between">
          <VStack space="md" flex={1}>
            <Text
              testID={`subscription-plan-title-${plan}`}
              style={[
                styles.planTitle,
                isSelected &&
                  (isPremium
                    ? styles.selectedPremiumTitle
                    : styles.selectedFreeTitle),
              ]}>
              {isPremium ? 'Premium Plan' : 'Free Plan'}
            </Text>

            <VStack testID={`subscription-plan-features-${plan}`} space="sm">
              {features.map((feature, index) => (
                <HStack
                  key={index}
                  space="sm"
                  alignItems="flex-start"
                  style={styles.featureRow}>
                  {isSelected ? (
                    <View
                      testID={`subscription-plan-checkmark-${plan}-${index}`}
                      style={[
                        styles.checkmarkSelected,
                        isPremium && styles.checkmarkSelectedPremium,
                      ]}>
                      <Check
                        size={10}
                        color={colors.white}
                        strokeWidth={3}
                      />
                    </View>
                  ) : (
                    <View
                      testID={`subscription-plan-checkmark-${plan}-${index}`}
                      style={styles.checkmark}
                    />
                  )}
                  <Text
                    testID={`subscription-plan-feature-${plan}-${index}`}
                    style={styles.featureText}>
                    {feature}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </VStack>

          {isPremium && (
            <Text
              testID={`subscription-plan-price-${plan}`}
              style={[
                styles.priceText,
                isSelected && styles.selectedPriceText,
              ]}>
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
        <HStack space="md" alignItems="center" flex={1}>
          <View
            testID={`subscription-payment-icon-${method.id}`}
            style={[
              styles.paymentIcon,
              !method.isEnabled && styles.disabledIcon,
            ]}>
            {method.icon ? (
              <Text style={styles.paymentIconEmoji}>{method.icon}</Text>
            ) : null}
          </View>
          <VStack flex={1} style={styles.paymentTextContainer}>
            <Text
              testID={`subscription-payment-name-${method.id}`}
              style={[
                styles.paymentMethodName,
                !method.isEnabled && styles.disabledText,
              ]}
              numberOfLines={2}>
              {getPaymentDisplayName(method)}
            </Text>
            {!method.isEnabled && (
              <Text
                testID={`subscription-payment-disabled-${method.id}`}
                style={styles.disabledText}>
                Coming Soon
              </Text>
            )}
            {method.type === 'razorpay' && method.isEnabled && (
              <Text style={styles.paymentMethodHint}>
                UPI, Cards & Net Banking
              </Text>
            )}
          </VStack>
          <View
            testID={`subscription-payment-selected-${method.id}`}
            style={[
              styles.radioOuter,
              isSelected && styles.radioOuterSelected,
            ]}>
            {isSelected && <View style={styles.radioInner} />}
          </View>
        </HStack>
      </Pressable>
    );
  };

  const PlanContainer = isStackedPlans ? VStack : HStack;

  return (
    <InfoScreenLayout
      testID="subscription-screen"
      title="Subscription"
      contentContainerStyle={isWideLayout ? styles.wideContentContainer : undefined}>
      <Box style={styles.contentWrapper}>
        <VStack testID="subscription-content" space="lg">
          <VStack
            testID="subscription-header-section"
            space="sm"
            alignItems="center"
            style={styles.headerSection}>
            <Crown
              testID="subscription-icon"
              size={isWideLayout ? 80 : 64}
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

          {currentSubscription && (
            <Box
              testID="subscription-current-status"
              style={styles.currentSubscriptionCard}>
              <HStack
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                space="md">
                <VStack flex={1} style={styles.currentPlanInfo}>
                  <Text
                    testID="subscription-current-plan"
                    style={styles.currentPlanText}>
                    Current Plan:{' '}
                    {currentSubscription.plan === 'premium' ? 'Premium' : 'Free'}
                  </Text>
                  {currentSubscription.plan === 'premium' &&
                    currentSubscription.endDate && (
                      <Text
                        testID="subscription-expiry-date"
                        style={styles.expiryText}>
                        Expires:{' '}
                        {new Date(
                          currentSubscription.endDate,
                        ).toLocaleDateString()}
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

          <VStack testID="subscription-plan-selection" space="md">
            <Text testID="subscription-plan-title" style={styles.sectionTitle}>
              Select Plan
            </Text>
            <PlanContainer
              space="md"
              alignItems={isStackedPlans ? 'stretch' : 'stretch'}
              style={isStackedPlans ? undefined : styles.planRow}>
              {renderPlanCard('free', selectedPlan === 'free')}
              {renderPlanCard('premium', selectedPlan === 'premium')}
            </PlanContainer>
          </VStack>

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

          {selectedPlan === 'premium' && canAccessPayment(user) && (
            <Button
              testID="subscription-subscribe-button"
              size="md"
              onPress={handleSubscribe}
              disabled={isLoading || !selectedPaymentMethod}
              style={[
                styles.subscribeButton,
                (isLoading || !selectedPaymentMethod) && styles.disabledButton,
              ]}>
              <Text
                testID="subscription-subscribe-text"
                style={styles.subscribeButtonText}>
                {isLoading ? 'Processing...' : 'Subscribe Now'}
              </Text>
            </Button>
          )}

          <VStack testID="subscription-terms" space="sm" style={styles.termsSection}>
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
      </Box>
    </InfoScreenLayout>
  );
};

const getStyles = (colors: any, screenWidth: number) => {
  const isNarrow = screenWidth < PLAN_STACK_BREAKPOINT;
  const isWide = screenWidth >= 768;

  return StyleSheet.create({
    wideContentContainer: {
      alignItems: 'center',
    },
    contentWrapper: {
      width: '100%',
      maxWidth: CONTENT_MAX_WIDTH,
      alignSelf: 'center',
    },
    headerSection: {
      paddingHorizontal: isNarrow ? 4 : 12,
    },
    headerTitle: {
      fontSize: isWide ? 28 : isNarrow ? 22 : 24,
      fontWeight: '700',
      color: colors.primaryText,
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: isNarrow ? 14 : 16,
      color: colors.mutedText,
      textAlign: 'center',
      lineHeight: isNarrow ? 20 : 24,
      paddingHorizontal: 8,
    },
    currentSubscriptionCard: {
      backgroundColor: colors.cardBackground,
      padding: isNarrow ? 14 : 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    currentPlanInfo: {
      minWidth: 0,
      flexShrink: 1,
    },
    currentPlanText: {
      fontSize: isNarrow ? 15 : 16,
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
      flexShrink: 0,
    },
    sectionTitle: {
      fontSize: isNarrow ? 17 : 18,
      fontWeight: '600',
      color: colors.primaryText,
    },
    planRow: {
      width: '100%',
    },
    planCard: {
      flex: isNarrow ? undefined : 1,
      width: isNarrow ? '100%' : undefined,
      minWidth: isNarrow ? undefined : 0,
      backgroundColor: colors.cardBackground,
      padding: isNarrow ? 16 : 18,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: colors.border,
      minHeight: isNarrow ? undefined : 220,
    },
    planCardStacked: {
      width: '100%',
    },
    selectedFreeCard: {
      borderColor: colors.accentAction,
      backgroundColor: colors.accentBackground ?? colors.cardBackground,
    },
    selectedPremiumCard: {
      borderColor: colors.success,
      backgroundColor: 'rgba(40, 167, 69, 0.06)',
    },
    planTitle: {
      fontSize: isNarrow ? 17 : 18,
      fontWeight: '700',
      color: colors.primaryText,
    },
    selectedFreeTitle: {
      color: colors.accentAction,
    },
    selectedPremiumTitle: {
      color: colors.accentAction,
    },
    featureRow: {
      width: '100%',
    },
    checkmark: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.border,
      marginTop: 1,
      flexShrink: 0,
    },
    checkmarkSelected: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.accentAction,
      marginTop: 1,
      flexShrink: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkmarkSelectedPremium: {
      backgroundColor: colors.accentAction,
    },
    featureText: {
      flex: 1,
      flexShrink: 1,
      fontSize: isNarrow ? 13 : 14,
      color: colors.primaryText,
      lineHeight: isNarrow ? 18 : 20,
    },
    priceText: {
      fontSize: isNarrow ? 18 : 20,
      fontWeight: '700',
      color: colors.success,
      marginTop: 12,
    },
    selectedPriceText: {
      color: colors.success,
    },
    paymentMethodCard: {
      backgroundColor: colors.cardBackground,
      padding: isNarrow ? 14 : 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
    },
    selectedPaymentMethod: {
      borderColor: colors.accentAction,
      backgroundColor: colors.accentBackground ?? colors.cardBackground,
    },
    paymentIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    paymentIconEmoji: {
      fontSize: 18,
    },
    disabledIcon: {
      opacity: 0.5,
    },
    paymentTextContainer: {
      minWidth: 0,
      flexShrink: 1,
    },
    paymentMethodName: {
      fontSize: isNarrow ? 15 : 16,
      fontWeight: '600',
      color: colors.primaryText,
    },
    paymentMethodHint: {
      fontSize: 13,
      color: colors.mutedText,
      marginTop: 2,
    },
    disabledText: {
      color: colors.mutedText,
    },
    radioOuter: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    radioOuterSelected: {
      borderColor: colors.accentAction,
    },
    radioInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.accentAction,
    },
    subscribeButton: {
      backgroundColor: colors.accentAction,
      borderRadius: 12,
      width: '100%',
      height: 48,
      minHeight: 48,
      paddingVertical: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    subscribeButtonText: {
      color: colors.white,
      fontWeight: '700',
      fontSize: isNarrow ? 15 : 16,
      textAlign: 'center',
    },
    disabledButton: {
      backgroundColor: colors.border,
    },
    termsSection: {
      paddingTop: 4,
    },
    termsText: {
      fontSize: 12,
      color: colors.mutedText,
      textAlign: 'center',
      lineHeight: 18,
      paddingHorizontal: 4,
    },
  });
};

export default SubscriptionScreen;
