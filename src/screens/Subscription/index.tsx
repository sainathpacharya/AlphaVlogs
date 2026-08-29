import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {View, StyleSheet, Alert, useWindowDimensions, Linking} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  Check,
  ChevronRight,
  Crown,
  GraduationCap,
  Headphones,
  Lock,
  Play,
  Sparkles,
  Target,
} from 'lucide-react-native';
import {
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Pressable,
} from '@/components';
import {SUBSCRIPTION, STORAGE_KEYS} from '@/constants';
import {LEGAL_URLS} from '@/constants/legal';
import {useThemeColors} from '@/utils/colors';
import {subscriptionService} from '@/services/subscription-service';
import {PaymentApiError} from '@/services/payment-service';
import {canAccessPayment} from '@/utils/payment';
import {shouldUseAppleIAP} from '@/utils/platform-payment';
import {parseIapError} from '@/utils/iap-error';
import {devLog} from '@/utils/dev-log';
import {getApiBaseUrl} from '@/constants';
import {isMockMode} from '@/config/api-config';
import {useUser, useUserStore, useUserCachedStore} from '@/stores';
import {useIsMounted} from '@/hooks';
import {useLogoutMutation} from '@/hooks/api/use-auth-api';
import {InfoScreenLayout} from '@/components/InfoScreenLayout';
import {User} from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PaymentMethod {
  id: string;
  type: 'cash' | 'cheque' | 'razorpay' | 'stripe' | 'paytm' | 'apple_iap';
  name: string;
  isEnabled: boolean;
  icon?: string;
}

const PLAN_STACK_BREAKPOINT = 340;
const CONTENT_MAX_WIDTH = 600;
const NAVY = '#0F2C5C';
const GOLD = '#E8B923';

const getPaymentDisplayName = (method: PaymentMethod) => {
  if (method.type === 'razorpay') {
    return 'Razorpay';
  }
  if (method.type === 'apple_iap') {
    return 'App Store';
  }
  return method.name;
};

const buildPaymentMethods = (): PaymentMethod[] => {
  if (shouldUseAppleIAP()) {
    return [
      {
        id: 'apple_iap',
        type: 'apple_iap',
        name: 'App Store In-App Purchase',
        isEnabled: true,
        icon: '🍎',
      },
    ];
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

  return [...defaultMethods, ...mockOnlyMethods];
};

const SubscriptionScreen: React.FC = () => {
  const navigation = useNavigation();
  const colors = useThemeColors();
  const {width: screenWidth} = useWindowDimensions();
  const isMounted = useIsMounted();
  const user = useUser();
  const setUser = useUserStore(state => state.setUser);
  const setUserData = useUserCachedStore(state => state.setUserData);
  const logoutMutation = useLogoutMutation();
  const isStackedPlans = screenWidth < PLAN_STACK_BREAKPOINT;
  const isWideLayout = screenWidth >= 768;
  const styles = useMemo(
    () => getStyles(colors, screenWidth),
    [colors, screenWidth],
  );
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium'>('premium');
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<{
    id: string;
    plan: string;
    endDate?: string;
  } | null>(null);
  const [appleProductPrice, setAppleProductPrice] = useState<string | null>(null);
  const usesAppleIAP = shouldUseAppleIAP();

  const markUserSubscribed = useCallback(
    async (current: User) => {
      const next: User = {
        ...current,
        isSubscribed: true,
        subscriptionStatus: 'active',
      };
      setUser(next);
      setUserData(next);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(next));
      return next;
    },
    [setUser, setUserData],
  );

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        const subscription = await subscriptionService.getStudentSubscription(user.id);
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

        const platformMethods = buildPaymentMethods();
        const finalMethods =
          methods.length > 0 && !usesAppleIAP
            ? methods.filter(
                m =>
                  m.type === 'razorpay' ||
                  (isMockMode() && (m.type === 'cash' || m.type === 'cheque')),
              )
            : platformMethods;
        setPaymentMethods(finalMethods);

        const defaultMethod = (finalMethods as PaymentMethod[]).find(
          m => m?.type === (usesAppleIAP ? 'apple_iap' : 'razorpay'),
        );
        if (defaultMethod) {
          setSelectedPaymentMethod(defaultMethod.id);
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
  }, [user?.id, usesAppleIAP]);

  useEffect(() => {
    if (!usesAppleIAP) {
      return undefined;
    }

    let cancelled = false;

    const loadAppleProduct = async () => {
      try {
        const {iapService} = require('@/services/iap-service');
        const product = await iapService.getPremiumSubscription();
        if (!cancelled && product?.localizedPrice) {
          setAppleProductPrice(product.localizedPrice);
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Error loading App Store product:', error);
        }
      }
    };

    loadAppleProduct();
    return () => {
      cancelled = true;
    };
  }, [usesAppleIAP]);

  const loadSubscriptionData = useCallback(async () => {
    if (!user?.id) {
      return;
    }
    try {
      if (isMounted.current) {
        setIsLoading(true);
      }

      const subscription = await subscriptionService.getStudentSubscription(user.id);
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

      const platformMethods = buildPaymentMethods();
      const finalMethods =
        methods.length > 0 && !usesAppleIAP
          ? methods.filter(
              m =>
                m.type === 'razorpay' ||
                (isMockMode() && (m.type === 'cash' || m.type === 'cheque')),
            )
          : platformMethods;
      setPaymentMethods(finalMethods);

      const defaultMethod = (finalMethods as PaymentMethod[]).find(
        m => m?.type === (usesAppleIAP ? 'apple_iap' : 'razorpay'),
      );
      if (defaultMethod) {
        setSelectedPaymentMethod(defaultMethod.id);
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
  }, [user?.id, isMounted, usesAppleIAP]);

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

      if (paymentMethod.type === 'apple_iap') {
        devLog('Subscription.handleSubscribe apple_iap', {
          apiBaseUrl: getApiBaseUrl(),
          userId: user.id,
        });
        try {
          const result = await subscriptionService.completeAppleCheckout(user);

          if (!isMounted.current) {
            return;
          }

          if (result.success && result.isSubscribed === true) {
            await markUserSubscribed(user);
            const refreshed =
              await subscriptionService.getStudentSubscription(user.id);
            if (isMounted.current && refreshed) {
              setCurrentSubscription(refreshed);
              setSelectedPlan('premium');
            }

            Alert.alert(
              '✅ Subscription Successful',
              'Welcome to Alpha Vlogs Premium! You now have access to all quizzes and premium features.',
              [
                {
                  text: 'Continue',
                  onPress: () => {
                    void loadSubscriptionData();
                    navigation.goBack();
                  },
                },
              ],
            );
          } else {
            Alert.alert(
              '❌ Payment Failed',
              'Your App Store purchase could not be verified. Premium was not unlocked. Please try again or contact support.',
            );
          }
        } catch (appleError: unknown) {
          if (__DEV__) {
            const parsed = parseIapError(appleError);
            devLog('Apple IAP payment error', {
              code: parsed.code,
              message: parsed.message,
              cancelled: parsed.cancelled,
            });
          }

          if (!isMounted.current) {
            return;
          }

          if (appleError instanceof PaymentApiError) {
            if (appleError.statusCode === 401) {
              handleSessionExpired(appleError.message);
              return;
            }
            if (appleError.statusCode === 403) {
              Alert.alert(
                'Not authorized',
                'Subscription is only available for student accounts.',
              );
              return;
            }
            if (appleError.statusCode === 409) {
              Alert.alert(
                'Purchase already linked',
                appleError.message ||
                  'This App Store purchase is already linked to another student account.',
              );
              return;
            }
            if (appleError.statusCode === 422) {
              Alert.alert(
                'Verification failed',
                appleError.message ||
                  'Apple rejected this purchase receipt. Premium was not unlocked.',
              );
              return;
            }
            Alert.alert('Payment Error', appleError.message);
            return;
          }

          const parsed = parseIapError(appleError);
          Alert.alert(
            parsed.cancelled ? 'Payment Cancelled' : 'Payment Error',
            parsed.userMessage,
          );
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
            await markUserSubscribed(user);
            const refreshed =
              await subscriptionService.getStudentSubscription(user.id);
            if (isMounted.current && refreshed) {
              setCurrentSubscription(refreshed);
              setSelectedPlan('premium');
            }

            Alert.alert(
              '✅ Subscription Successful',
              `Welcome to Alpha Vlogs Premium! You now have access to all quizzes and premium features.\n\nPayment ID: ${result.paymentId}`,
              [
                {
                  text: 'Continue',
                  onPress: () => {
                    void loadSubscriptionData();
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
        await markUserSubscribed(user);
        Alert.alert(
          '✅ Subscription Successful',
          `Welcome to Alpha Vlogs Premium!\n\nTransaction ID: ${(paymentResult as { transactionId?: string }).transactionId ?? 'N/A'}`,
          [
            {
              text: 'Continue',
              onPress: () => {
                void loadSubscriptionData();
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
    if (usesAppleIAP) {
      Alert.alert(
        'Manage Subscription',
        'Premium subscriptions purchased through the App Store are managed in your Apple ID subscription settings.',
        [
          {text: 'Not now', style: 'cancel'},
          {
            text: 'Open Settings',
            onPress: () => {
              void Linking.openURL('https://apps.apple.com/account/subscriptions');
            },
          },
        ],
      );
      return;
    }

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

  const handleRestorePurchases = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to restore purchases.');
      return;
    }

    if (!canAccessPayment(user)) {
      Alert.alert(
        'Not available',
        'Restore purchases is only available for student accounts.',
      );
      return;
    }

    try {
      if (isMounted.current) {
        setIsLoading(true);
      }

      const result = await subscriptionService.restoreApplePurchases();

      if (!isMounted.current) {
        return;
      }

      if (result.success && result.isSubscribed === true) {
        await markUserSubscribed(user);
        await loadSubscriptionData();
        Alert.alert(
          'Purchases Restored',
          'Your premium subscription has been restored.',
        );
      } else {
        Alert.alert(
          'No Purchases Found',
          'We could not verify an active premium subscription for this Apple ID. Premium was not unlocked.',
        );
      }
    } catch (error: unknown) {
      if (__DEV__) {
        const parsed = parseIapError(error);
        devLog('Apple IAP restore error', {
          code: parsed.code,
          message: parsed.message,
        });
      }
      if (!isMounted.current) {
        return;
      }

      if (error instanceof PaymentApiError) {
        if (error.statusCode === 401) {
          handleSessionExpired(error.message);
          return;
        }
        if (error.statusCode === 403) {
          Alert.alert(
            'Not authorized',
            'Restore purchases is only available for student accounts.',
          );
          return;
        }
        if (error.statusCode === 409) {
          Alert.alert(
            'Purchase already linked',
            error.message ||
              'This App Store purchase is already linked to another student account.',
          );
          return;
        }
        if (error.statusCode === 422) {
          Alert.alert(
            'Verification failed',
            error.message ||
              'Apple rejected this purchase receipt. Premium was not unlocked.',
          );
          return;
        }
        Alert.alert('Restore Failed', error.message);
        return;
      }

      const parsed = parseIapError(error);
      Alert.alert(
        parsed.cancelled ? 'Restore Cancelled' : 'Restore Failed',
        parsed.userMessage,
      );
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const isCurrentPremium = currentSubscription?.plan === 'premium';
  const premiumPriceLabel = usesAppleIAP
    ? `${appleProductPrice ?? '…'} / year`
    : `₹${SUBSCRIPTION.PRICING.PREMIUM_ANNUAL} / year`;

  const renderPlanCard = (plan: 'free' | 'premium', isSelected: boolean) => {
    const isPremium = plan === 'premium';
    const isCurrentPlan = isPremium ? isCurrentPremium : !isCurrentPremium;
    const features =
      SUBSCRIPTION.FEATURES[
        plan.toUpperCase() as keyof typeof SUBSCRIPTION.FEATURES
      ];
    const PlanIcon = isPremium ? Crown : GraduationCap;

    return (
      <Pressable
        testID={`subscription-plan-card-${plan}`}
        onPress={() => setSelectedPlan(plan)}
        enableRipple={false}
        style={[
          styles.planCard,
          isStackedPlans && styles.planCardStacked,
          isPremium && styles.planCardPremiumPad,
          isSelected &&
            (isPremium ? styles.selectedPremiumCard : styles.selectedFreeCard),
        ]}>
        {isPremium && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularBadgeText}>Most Popular</Text>
          </View>
        )}

        <VStack space="sm" flex={1} justifyContent="space-between">
          <VStack space="sm">
            <View
              style={[
                styles.planIconCircle,
                isPremium ? styles.planIconCirclePremium : styles.planIconCircleFree,
              ]}>
              <PlanIcon
                size={22}
                color={isPremium ? colors.accentAction : colors.mutedText}
                fill={isPremium ? colors.accentAction : 'transparent'}
                strokeWidth={2}
              />
            </View>

            <VStack space="xs">
              <Text
                testID={`subscription-plan-title-${plan}`}
                style={[
                  styles.planTitle,
                  isSelected && isPremium && styles.selectedPremiumTitle,
                ]}>
                {isPremium ? 'Premium Plan' : 'Free Plan'}
              </Text>
              <Text style={styles.planSubtitle}>
                {isPremium
                  ? 'Unlock everything you need.'
                  : 'Get started with the basics.'}
              </Text>
            </VStack>

            <VStack testID={`subscription-plan-features-${plan}`} space="xs">
              {features.map((feature, index) => (
                <HStack
                  key={index}
                  space="sm"
                  alignItems="flex-start"
                  style={styles.featureRow}>
                  <View
                    testID={`subscription-plan-checkmark-${plan}-${index}`}
                    style={[
                      styles.checkmark,
                      isPremium && styles.checkmarkPremium,
                    ]}>
                    <Check
                      size={10}
                      color={isPremium ? colors.white : colors.mutedText}
                      strokeWidth={3}
                    />
                  </View>
                  <Text
                    testID={`subscription-plan-feature-${plan}-${index}`}
                    style={styles.featureText}>
                    {feature}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </VStack>

          {isPremium ? (
            <View style={styles.priceBox}>
              <Text
                testID={`subscription-plan-price-${plan}`}
                style={styles.priceText}>
                {premiumPriceLabel}
              </Text>
              <Text style={styles.priceHint}>Best value for serious learners</Text>
            </View>
          ) : (
            <View
              style={[
                styles.currentPlanPill,
                !isCurrentPlan && styles.currentPlanPillInactive,
              ]}>
              <Text style={styles.currentPlanPillText}>
                {isCurrentPlan ? 'Current Plan' : 'Free'}
              </Text>
            </View>
          )}
        </VStack>
      </Pressable>
    );
  };

  const renderPaymentMethod = (method: PaymentMethod) => {
    const isSelected = selectedPaymentMethod === method.id;
    const isApple = method.type === 'apple_iap';

    return (
      <Pressable
        key={method.id}
        testID={`subscription-payment-method-${method.id}`}
        onPress={() => setSelectedPaymentMethod(method.id)}
        enableRipple={false}
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
              isApple && styles.paymentIconApple,
              !method.isEnabled && styles.disabledIcon,
            ]}>
            <Text style={styles.paymentIconEmoji}>
              {isApple ? '' : method.icon ?? '💳'}
            </Text>
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
            {method.type === 'apple_iap' && method.isEnabled && (
              <Text style={styles.paymentMethodHint}>
                Billed through your Apple ID
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
  const subscribeDisabled = isLoading || !selectedPaymentMethod;
  const highlights = [
    {key: 'video', label: 'Premium Video Content', Icon: Play},
    {key: 'quiz', label: 'Unlimited Quiz Access', Icon: Target},
    {key: 'support', label: 'Priority Customer Support', Icon: Headphones},
  ] as const;

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
            <View testID="subscription-icon" style={styles.heroIconWrap}>
              <View style={styles.sparkleTop}>
                <Sparkles size={14} color={GOLD} />
              </View>
              <View style={styles.crownCircle}>
                <Crown size={40} color={GOLD} fill={GOLD} strokeWidth={1.5} />
              </View>
              <View style={styles.sparkleBottom}>
                <Sparkles size={12} color={GOLD} />
              </View>
            </View>
            <Text testID="subscription-header-title" style={styles.headerTitle}>
              Unlock Your Full Potential
            </Text>
            <Text
              testID="subscription-header-subtitle"
              style={styles.headerSubtitle}>
              Go Premium and get unlimited access to all quizzes and exclusive
              content.
            </Text>
          </VStack>

          {isCurrentPremium && currentSubscription && (
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
                    You're on Premium
                  </Text>
                  {currentSubscription.endDate && (
                    <Text
                      testID="subscription-expiry-date"
                      style={styles.expiryText}>
                      Renews{' '}
                      {new Date(currentSubscription.endDate).toLocaleDateString()}
                    </Text>
                  )}
                </VStack>
                <Button
                  testID="subscription-cancel-button"
                  onPress={handleCancelSubscription}
                  style={styles.manageButton}>
                  <Text
                    testID="subscription-cancel-text"
                    style={styles.manageButtonText}>
                    {usesAppleIAP ? 'Manage' : 'Cancel'}
                  </Text>
                </Button>
              </HStack>
            </Box>
          )}

          <VStack testID="subscription-plan-selection" space="md">
            <HStack
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              space="sm">
              <Text testID="subscription-plan-title" style={styles.sectionTitle}>
                Choose Your Plan
              </Text>
              <View style={styles.smarterBadge}>
                <Text style={styles.smarterBadgeText}>✨ Start learning smarter</Text>
              </View>
            </HStack>
            <PlanContainer
              space="md"
              alignItems={isStackedPlans ? 'stretch' : 'stretch'}
              style={isStackedPlans ? undefined : styles.planRow}>
              {renderPlanCard('free', selectedPlan === 'free')}
              {renderPlanCard('premium', selectedPlan === 'premium')}
            </PlanContainer>
          </VStack>

          <HStack style={styles.highlightsRow} alignItems="stretch">
            {highlights.map((item, index) => (
              <React.Fragment key={item.key}>
                {index > 0 && <View style={styles.highlightDivider} />}
                <VStack flex={1} alignItems="center" space="xs" style={styles.highlightItem}>
                  <View style={styles.highlightIcon}>
                    <item.Icon size={18} color={colors.accentAction} strokeWidth={2.2} />
                  </View>
                  <Text style={styles.highlightLabel}>{item.label}</Text>
                </VStack>
              </React.Fragment>
            ))}
          </HStack>

          {selectedPlan === 'premium' && (
            <VStack testID="subscription-payment-methods" space="md">
              <HStack alignItems="center" justifyContent="space-between">
                <Text
                  testID="subscription-payment-title"
                  style={styles.sectionTitle}>
                  Payment Method
                </Text>
                <HStack space="xs" alignItems="center">
                  <Lock size={12} color={colors.mutedText} />
                  <Text style={styles.secureHint}>Secure & encrypted</Text>
                </HStack>
              </HStack>
              <VStack space="sm">
                {paymentMethods.map(renderPaymentMethod)}
              </VStack>
            </VStack>
          )}

          {selectedPlan === 'premium' && canAccessPayment(user) && (
            <Pressable
              testID="subscription-subscribe-button"
              onPress={handleSubscribe}
              disabled={subscribeDisabled}
              enableRipple={false}
              style={[
                styles.subscribeButton,
                subscribeDisabled && styles.disabledButtonWrap,
              ]}>
                <HStack space="sm" alignItems="center" justifyContent="center">
                  {usesAppleIAP && !isLoading && (
                    <Text style={styles.subscribeAppleMark}></Text>
                  )}
                  <Text
                    testID="subscription-subscribe-text"
                    style={styles.subscribeButtonText}>
                    {isLoading
                      ? 'Processing...'
                      : usesAppleIAP
                        ? 'Subscribe with Apple'
                        : 'Subscribe Now'}
                  </Text>
                  {!isLoading && (
                    <ChevronRight size={18} color={colors.white} strokeWidth={2.5} />
                  )}
                </HStack>
            </Pressable>
          )}

          {usesAppleIAP && (
            <Text style={styles.cancelAnytimeText}>
              You can cancel anytime from your Apple ID settings.
            </Text>
          )}

          {usesAppleIAP && canAccessPayment(user) && (
            <Pressable
              testID="subscription-restore-button"
              onPress={handleRestorePurchases}
              disabled={isLoading}>
              <Text
                testID="subscription-restore-text"
                style={styles.restoreButtonText}>
                Restore Purchases
              </Text>
            </Pressable>
          )}

          <VStack testID="subscription-terms" space="sm" style={styles.termsSection}>
            <Text testID="subscription-terms-text-1" style={styles.termsText}>
              By subscribing, you agree to our{' '}
              <Text
                testID="subscription-terms-link"
                style={styles.termsLink}
                onPress={() => void Linking.openURL(LEGAL_URLS.termsOfService)}>
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text
                testID="subscription-privacy-link"
                style={styles.termsLink}
                onPress={() => void Linking.openURL(LEGAL_URLS.privacyPolicy)}>
                Privacy Policy
              </Text>
              .
            </Text>
            <Text testID="subscription-terms-text-2" style={styles.termsText}>
              {usesAppleIAP
                ? 'Subscription auto-renews annually unless cancelled at least 24 hours before the end of the current period. Manage or cancel in your Apple ID subscription settings.'
                : 'Subscription will auto-renew annually. Cancel anytime in your account settings.'}
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
      paddingHorizontal: isNarrow ? 4 : 8,
      paddingTop: 8,
    },
    heroIconWrap: {
      width: 96,
      height: 96,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    crownCircle: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: '#FFF6D8',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: GOLD,
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.28,
      shadowRadius: 12,
      elevation: 4,
    },
    sparkleTop: {
      position: 'absolute',
      top: 4,
      right: 8,
    },
    sparkleBottom: {
      position: 'absolute',
      bottom: 8,
      left: 6,
    },
    headerTitle: {
      fontSize: isWide ? 28 : isNarrow ? 22 : 24,
      fontWeight: '800',
      color: NAVY,
      textAlign: 'center',
      letterSpacing: -0.3,
    },
    headerSubtitle: {
      fontSize: isNarrow ? 14 : 15,
      color: colors.mutedText,
      textAlign: 'center',
      lineHeight: isNarrow ? 20 : 22,
      paddingHorizontal: 12,
    },
    currentSubscriptionCard: {
      backgroundColor: colors.accentBackground,
      padding: isNarrow ? 14 : 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#BFD9FF',
    },
    currentPlanInfo: {
      minWidth: 0,
      flexShrink: 1,
    },
    currentPlanText: {
      fontSize: isNarrow ? 15 : 16,
      fontWeight: '700',
      color: NAVY,
    },
    expiryText: {
      fontSize: 13,
      color: colors.mutedText,
      marginTop: 4,
    },
    manageButton: {
      backgroundColor: NAVY,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 10,
      flexShrink: 0,
    },
    manageButtonText: {
      color: colors.white,
      fontWeight: '700',
      fontSize: 13,
    },
    sectionTitle: {
      fontSize: isNarrow ? 17 : 18,
      fontWeight: '700',
      color: NAVY,
    },
    smarterBadge: {
      backgroundColor: '#EEE8FF',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
    },
    smarterBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#5B4B8A',
    },
    planRow: {
      width: '100%',
    },
    planCard: {
      flex: isNarrow ? undefined : 1,
      width: isNarrow ? '100%' : undefined,
      minWidth: isNarrow ? undefined : 0,
      backgroundColor: colors.cardBackground,
      padding: isNarrow ? 14 : 16,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: colors.border,
      minHeight: isNarrow ? undefined : 268,
      overflow: 'visible',
    },
    planCardStacked: {
      width: '100%',
    },
    planCardPremiumPad: {
      paddingTop: 20,
    },
    selectedFreeCard: {
      borderColor: colors.accentAction,
    },
    selectedPremiumCard: {
      borderColor: colors.accentAction,
      backgroundColor: '#F7FBFF',
      shadowColor: colors.accentAction,
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.18,
      shadowRadius: 14,
      elevation: 6,
    },
    popularBadge: {
      position: 'absolute',
      top: -10,
      right: 12,
      backgroundColor: NAVY,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      zIndex: 2,
    },
    popularBadgeText: {
      color: colors.white,
      fontSize: 10,
      fontWeight: '700',
    },
    planIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    planIconCircleFree: {
      backgroundColor: '#F1F3F5',
    },
    planIconCirclePremium: {
      backgroundColor: colors.accentBackground,
    },
    planTitle: {
      fontSize: isNarrow ? 16 : 17,
      fontWeight: '800',
      color: NAVY,
    },
    selectedPremiumTitle: {
      color: NAVY,
    },
    planSubtitle: {
      fontSize: 12,
      color: colors.mutedText,
      lineHeight: 16,
    },
    featureRow: {
      width: '100%',
    },
    checkmark: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: '#E9ECEF',
      marginTop: 1,
      flexShrink: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkmarkPremium: {
      backgroundColor: colors.accentAction,
    },
    featureText: {
      flex: 1,
      flexShrink: 1,
      fontSize: isNarrow ? 12 : 13,
      color: colors.primaryText,
      lineHeight: 18,
    },
    priceBox: {
      marginTop: 8,
      backgroundColor: colors.accentBackground,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 10,
      alignItems: 'center',
    },
    priceText: {
      fontSize: isNarrow ? 16 : 18,
      fontWeight: '800',
      color: NAVY,
    },
    priceHint: {
      fontSize: 10,
      color: colors.mutedText,
      marginTop: 2,
      textAlign: 'center',
    },
    currentPlanPill: {
      marginTop: 8,
      backgroundColor: '#EEF1F4',
      borderRadius: 10,
      paddingVertical: 10,
      alignItems: 'center',
    },
    currentPlanPillInactive: {
      opacity: 0.7,
    },
    currentPlanPillText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.mutedText,
    },
    highlightsRow: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 14,
      paddingHorizontal: 6,
    },
    highlightItem: {
      paddingHorizontal: 6,
    },
    highlightDivider: {
      width: 1,
      backgroundColor: colors.border,
      marginVertical: 4,
    },
    highlightIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.accentBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    highlightLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: NAVY,
      textAlign: 'center',
      lineHeight: 14,
    },
    paymentMethodCard: {
      backgroundColor: colors.cardBackground,
      padding: isNarrow ? 14 : 16,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.border,
    },
    selectedPaymentMethod: {
      borderColor: colors.accentAction,
      backgroundColor: '#F7FBFF',
    },
    paymentIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: '#F1F3F5',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    paymentIconApple: {
      backgroundColor: '#111111',
    },
    paymentIconEmoji: {
      fontSize: 18,
      color: colors.white,
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
      fontWeight: '700',
      color: NAVY,
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
    secureHint: {
      fontSize: 11,
      color: colors.mutedText,
      fontWeight: '600',
    },
    subscribeButton: {
      borderRadius: 14,
      width: '100%',
      height: 54,
      minHeight: 54,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1577F0',
    },
    subscribeButtonText: {
      color: colors.white,
      fontWeight: '800',
      fontSize: isNarrow ? 15 : 16,
      textAlign: 'center',
    },
    subscribeAppleMark: {
      color: colors.white,
      fontSize: 20,
      fontWeight: '700',
      marginTop: -2,
    },
    disabledButtonWrap: {
      opacity: 0.65,
    },
    cancelAnytimeText: {
      fontSize: 12,
      color: colors.mutedText,
      textAlign: 'center',
    },
    restoreButtonText: {
      color: colors.accentAction,
      fontWeight: '600',
      fontSize: 14,
      textAlign: 'center',
      textDecorationLine: 'underline',
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
    termsLink: {
      color: colors.accentAction,
      textDecorationLine: 'underline',
      fontWeight: '600',
    },
  });
};

export default SubscriptionScreen;
