import React, {useState, useRef, useEffect, useCallback, useMemo} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  VStack,
  HStack,
  Input,
  InputField,
  Button,
  ButtonText,
  Text,
  Pressable,
  StatusBar,
  Box,
} from '../../components';
import {AppLogoImage} from '../../components/AppLogoImage';
import ConfettiCannon from 'react-native-confetti-cannon';
import OTPTextInput from 'react-native-otp-textinput';
import appLogo from '../../assets/png/appLogo.png';
import {useThemeColors} from '../../utils/colors';
import {Phone, XCircle} from 'lucide-react-native';
import {useSendOtpMutation, useVerifyOtpMutation, useIsMounted} from '@/hooks';
import {useUserCachedStore} from '@/stores';
import {devLog} from '@/utils/dev-log';
import {getApiBaseUrl} from '@/constants';

const {width} = Dimensions.get('window');

// Memoized logo so parent re-renders (e.g. timer) don't stutter the animation
const LoginLogo = React.memo(function LoginLogo() {
  const logoSize = useMemo(() => width * 0.42, []);
  return (
    <AppLogoImage
      testID="login-logo"
      source={appLogo}
      animation="bounce"
      style={{
        width: logoSize,
        height: logoSize,
        marginBottom: 16,
      }}
    />
  );
});

interface LoginScreenProps {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
}

const LoginScreen = ({navigation}: LoginScreenProps) => {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<{mobile?: string; otp?: string}>({});
  const [isMobileFocused, setIsMobileFocused] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const sendOtpMutation = useSendOtpMutation();
  const verifyOtpMutation = useVerifyOtpMutation();
  const isMounted = useIsMounted();
  const isLoading = sendOtpMutation.isPending || verifyOtpMutation.isPending;
  const otpRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const otpTextStyle = useMemo(
    () => ({
      fontSize: 18,
      fontWeight: '600' as const,
      backgroundColor: colors.transparent,
      color: colors.inputText,
    }),
    [colors.transparent, colors.inputText],
  );

  const isMobileValid = /^[6-9]\d{9}$/.test(mobile);

  // Cleanup timer on component unmount only (ref-based timer avoids effect per tick)
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Reset OTP flow if mobile changes significantly
  useEffect(() => {
    if (!isMobileValid) {
      setIsOtpSent(false);
      setOtp('');
    }
  }, [isMobileValid]);

  // Keep OTP fields above the keyboard once the pin UI appears
  useEffect(() => {
    if (!isOtpSent) {
      return;
    }
    const id = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({animated: true});
    }, Platform.OS === 'android' ? 180 : 80);
    return () => clearTimeout(id);
  }, [isOtpSent]);

  const startOtpTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setOtpTimer(60);
    setCanResendOtp(false);
    timerRef.current = setInterval(() => {
      if (!isMounted.current) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return;
      }
      setOtpTimer(prev => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          if (isMounted.current) {
            setCanResendOtp(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [isMounted]);

  const handleResendOtp = async () => {
    if (!canResendOtp) {
      return;
    }

    setOtp('');
    if (errors.otp) {
      setErrors(prev => ({...prev, otp: ''}));
    }
    if (otpRef.current) {
      otpRef.current.clear();
    }

    try {
      const response = await sendOtpMutation.mutateAsync({mobile, type: 'login'});
      if (!isMounted.current) {
        return;
      }
      if (response.success) {
        Alert.alert(
          '✅ OTP Resent Successfully',
          `New OTP has been sent to +91 ${mobile}. Please check your messages.`,
          [{text: 'OK', style: 'default'}],
        );
        startOtpTimer();
        setIsOtpSent(true);
      } else {
        Alert.alert(
          '❌ Failed to Resend OTP',
          response.error || 'Please try again.',
        );
      }
    } catch {
      if (isMounted.current) {
        Alert.alert(
          '❌ Network Error',
          'Unable to resend OTP. Please try again.',
        );
      }
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    const errorMessages: string[] = [];

    if (!isMobileValid) {
      newErrors.mobile = 'Enter a valid 10-digit mobile (starts with 6–9)';
      errorMessages.push(`Mobile: ${newErrors.mobile}`);
    }

    if (isOtpSent) {
      if (!otp || otp.trim().length < 6) {
        newErrors.otp = `Please enter the complete 6-digit OTP${otp.trim().length > 0 ? ` (${otp.trim().length}/6 digits entered)` : ''}`;
        errorMessages.push(`OTP: ${newErrors.otp}`);
      }
    }

    setErrors(newErrors);
    return {
      valid: errorMessages.length === 0,
      errorMessages,
    };
  };

  const handleSendOtp = async () => {
    if (!isMobileValid) {
      setErrors({mobile: 'Enter a valid 10-digit mobile (starts with 6–9)'});
      Alert.alert('❌ Invalid mobile', 'Enter a valid 10-digit mobile starting with 6–9.');
      return;
    }

    devLog('Login.handleSendOtp tapped', { mobile, apiBaseUrl: getApiBaseUrl() });

    try {
      const response = await sendOtpMutation.mutateAsync({mobile, type: 'login'});
      if (!isMounted.current) {
        return;
      }
      if (response.success) {
        setIsOtpSent(true);
        startOtpTimer();
        Alert.alert('✅ OTP Sent', `OTP has been sent to +91 ${mobile}.`);
      } else {
        Alert.alert(
          '❌ Failed to Send OTP',
          response.error || 'Please try again.',
        );
      }
    } catch {
      if (isMounted.current) {
        Alert.alert(
          '❌ Network Error',
          'Unable to send OTP. Please try again.',
        );
      }
    }
  };

  const handleLogin = async () => {
    const {valid, errorMessages} = validate();
    if (!valid) {
      Alert.alert(
        '❌ Validation Failed',
        errorMessages.join('\n') || 'Please check your inputs.',
      );
      return;
    }

    try {
      const response = await verifyOtpMutation.mutateAsync({mobile, otp});
      if (!isMounted.current) {
        return;
      }
      if (response.success && response.data) {
        if (response.data.selectionRequired && response.data.profiles?.length) {
          useUserCachedStore.getState().setLinkedProfiles(response.data.profiles);
          navigation.navigate('ProfileSelection', {
            mobile,
            otp: otp.trim(),
            profiles: response.data.profiles,
          });
          return;
        }

        const user = response.data.user;
        if (user) {
          Alert.alert(
            '✅ Login Successful',
            `Welcome ${user.firstName || 'User'}!`,
            [
              {
                text: 'Continue',
                style: 'default',
                onPress: () => setShowConfetti(true),
              },
            ],
          );
          return;
        }

        Alert.alert('❌ Verification Failed', 'Unexpected response from server.');
      } else {
        Alert.alert('❌ Verification Failed', response.error || 'Please request a new OTP.');
      }
    } catch (error: unknown) {
      if (!isMounted.current) {
        return;
      }
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Please check your connection and try again.';
      Alert.alert('❌ Error', errorMessage);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Signup');
  };

  const handleOtpChange = (text: string) => {
    setOtp(text);
    if (errors.otp) {
      setErrors(prev => ({...prev, otp: ''}));
    }
  };

  const scrollFocusedFieldIntoView = useCallback(() => {
    // Physical Android keyboards (with suggestion bar) need a beat before layout settles
    requestAnimationFrame(() => {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({animated: true});
      }, Platform.OS === 'android' ? 120 : 0);
    });
  }, []);

  return (
    <KeyboardAvoidingView
      testID="login-screen"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      style={{flex: 1, backgroundColor: colors.primaryBackground}}>
      <StatusBar translucent={false} />

      <ScrollView
        ref={scrollViewRef}
        testID="login-scroll-view"
        style={{flex: 1}}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 20,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 160,
        }}>
        <VStack
          testID="login-container"
          alignItems="center"
          space="lg"
          w="$full">
          {/* ✅ Animated Logo (memoized to avoid stutter when timer/state updates) */}
          <LoginLogo />

          <Text
            testID="login-title"
            fontSize="$3xl"
            fontWeight="$bold"
            mb="$5"
            color={colors.primaryText}>
            Login
          </Text>

          {/* ✅ Mobile Input with icon and clear */}
          <Input
            testID="login-mobile-input"
            w="$full"
            size="lg"
            variant="outline"
            borderColor={colors.accentAction}
            bg={colors.primaryBackground}
            isInvalid={!!errors.mobile}
            style={{
              elevation: 0,
              shadowColor: 'transparent',
              shadowOffset: {width: 0, height: 0},
              shadowOpacity: 0,
              shadowRadius: 0,
            }}>
            <Box
              testID="login-mobile-icon"
              pl="$3"
              justifyContent="center"
              height="100%">
              <Phone size={20} color={colors.accentAction} />
            </Box>
            <InputField
              testID="login-mobile-field"
              placeholder="Enter Mobile Number"
              keyboardType="number-pad"
              maxLength={10}
              value={mobile}
              editable={true}
              onChangeText={val => {
                // Remove all non-digit characters and limit to 10 digits
                const digits = val.replace(/\D/g, '').slice(0, 10);
                setMobile(digits);
                if (otp.length > 0) {
                  setOtp('');
                }
                if (errors.mobile) {
                  setErrors(prev => ({...prev, mobile: ''}));
                }
              }}
              placeholderTextColor={colors.mutedText}
              color={colors.inputText}
              onFocus={() => {
                setIsMobileFocused(true);
                scrollFocusedFieldIntoView();
              }}
              onBlur={() => setIsMobileFocused(false)}
              returnKeyType="next"
              onSubmitEditing={() => {
                // Focus will be handled by autoFocus on OTP input
              }}
            />
            {mobile?.length > 0 && isMobileFocused && (
              <TouchableOpacity
                testID="login-mobile-clear"
                onPress={() => {
                  setMobile('');
                  setIsOtpSent(false);
                  setOtp('');
                  if (otpRef.current) {
                    otpRef.current.clear();
                  }
                }}
                style={{
                  position: 'absolute',
                  right: 15,
                  top: '50%',
                  transform: [{translateY: -10}],
                }}>
                <XCircle size={20} color={colors.accentAction} />
              </TouchableOpacity>
            )}
          </Input>
          {errors.mobile && (
            <Text testID="login-mobile-error" color={colors.danger} mt="$2">
              {errors.mobile}
            </Text>
          )}

          {/* ✅ OTP Pin View - shown after OTP is sent */}
          {isOtpSent && (
            <>
              <Box testID="login-otp-container" w="$full" mt="$4">
                <Text
                  testID="login-otp-label"
                  color={colors.primaryText}
                  fontSize={16}
                  fontWeight="$medium"
                  mb="$3"
                  textAlign="center">
                  Enter OTP
                </Text>
                <OTPTextInput
                  testID="login-otp-input"
                  ref={otpRef}
                  inputCount={6}
                  handleTextChange={handleOtpChange}
                  keyboardType="number-pad"
                  tintColor={colors.accentAction}
                  offTintColor={colors.mutedText}
                  defaultValue=""
                  autoFocus={true}
                  textInputStyle={otpTextStyle}
                  containerStyle={{
                    backgroundColor: colors.transparent,
                  }}
                />

                {/* Timer and Resend Section */}
                <HStack
                  testID="login-otp-timer-container"
                  justifyContent="center"
                  alignItems="center"
                  mt="$4"
                  space="md">
                  {otpTimer > 0 ? (
                    <Text
                      testID="login-otp-timer"
                      color={colors.mutedText}
                      fontSize="$sm"
                      textAlign="center">
                      Resend OTP in {otpTimer}s
                    </Text>
                  ) : (
                    <HStack space="sm" alignItems="center">
                      <Text
                        testID="login-otp-resend-label"
                        color={colors.mutedText}
                        fontSize="$sm">
                        Didn't receive OTP?
                      </Text>
                      <Pressable
                        testID="login-otp-resend-button"
                        onPress={handleResendOtp}
                        $pressed={{opacity: 0.6}}>
                        <Text
                          testID="login-otp-resend-text"
                          color={colors.accentAction}
                          fontSize="$sm"
                          fontWeight="$semibold"
                          textDecorationLine="underline">
                          Resend OTP
                        </Text>
                      </Pressable>
                    </HStack>
                  )}
                </HStack>
              </Box>
              {errors.otp && (
                <Text
                  testID="login-otp-error"
                  color={colors.danger}
                  mt="$2"
                  textAlign="center">
                  {errors.otp}
                </Text>
              )}
            </>
          )}

          {/* ✅ Send/Verify Button */}
          <Button
            testID="login-submit-button"
            onPress={isOtpSent ? handleLogin : handleSendOtp}
            isDisabled={isLoading}
            w="$full"
            size="lg"
            borderRadius={6}
            mt="$6"
            bg={colors.accentAction}
            opacity={isLoading ? 0.6 : 1}
            style={{
              elevation: 0,
              shadowColor: 'transparent',
              shadowOffset: {width: 0, height: 0},
              shadowOpacity: 0,
              shadowRadius: 0,
            }}>
            <ButtonText
              testID="login-submit-text"
              color={colors.white}
              fontWeight="$bold"
              textAlign="center"
              style={{width: '100%'}}>
              {isLoading
                ? isOtpSent
                  ? 'Verifying...'
                  : 'Sending OTP...'
                : isOtpSent
                  ? 'Verify OTP'
                  : 'Send OTP'}
            </ButtonText>
          </Button>

          {/* ✅ Register Prompt */}
          <Box testID="login-register-container" flexDirection="row" mt="$5">
            <Text testID="login-register-label" color={colors.primaryText}>
              Not registered?{' '}
            </Text>
            <Pressable
              testID="login-register-button"
              onPress={handleRegister}
              $pressed={{opacity: 0.6}}>
              <Text
                testID="login-register-text"
                color={colors.accentAction}
                fontWeight="$semibold">
                Register
              </Text>
            </Pressable>
          </Box>
        </VStack>
      </ScrollView>

      {/* ✅ Confetti Cannon 🎉 */}
      {showConfetti && (
        <ConfettiCannon
          testID="login-confetti"
          count={70}
          origin={{x: width / 2, y: 0}}
          fadeOut={true}
          explosionSpeed={350}
          fallSpeed={3000}
          onAnimationEnd={() => setShowConfetti(false)}
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
