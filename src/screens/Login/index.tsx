import React, {useState, useRef, useEffect} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  VStack,
  HStack,
  Input,
  InputField,
  Button,
  Text,
  Pressable,
  StatusBar,
  Box,
} from '../../components';
import {MotiImage} from 'moti';
import {Easing} from 'react-native-reanimated';
import ConfettiCannon from 'react-native-confetti-cannon';
import OTPTextInput from 'react-native-otp-textinput';
import appLogo from '../../assets/png/appLogo.png';
import {useThemeColors} from '../../utils/colors';
import {Phone, XCircle} from 'lucide-react-native';
import authService from '../../services/auth-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '@/constants';
import {useUserStore} from '../../stores';

const {width} = Dimensions.get('window');

const LoginScreen = ({navigation, setIsLoggedIn}: any) => {
  const colors = useThemeColors();
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<{mobile?: string; otp?: string}>({});
  const [isMobileFocused, setIsMobileFocused] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const otpRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  const otpTextStyle = {
    fontSize: 18,
    fontWeight: '600' as const,
    backgroundColor: colors.transparent,
    color: colors.inputText,
  };

  const isMobileValid = mobile.length === 10 && /^\d{10}$/.test(mobile);

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
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

  // Timer effect
  useEffect(() => {
    if (otpTimer > 0) {
      timerRef.current = setTimeout(() => {
        setOtpTimer(otpTimer - 1);
      }, 1000);
    } else if (otpTimer === 0 && !canResendOtp) {
      setCanResendOtp(true);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [otpTimer, canResendOtp]);

  const startOtpTimer = () => {
    setOtpTimer(60);
    setCanResendOtp(false);
  };

  const handleResendOtp = async () => {
    if (canResendOtp) {
      try {
        setIsLoading(true);
        setOtp('');
        if (errors.otp) setErrors(prev => ({...prev, otp: ''}));
        if (otpRef.current) {
          otpRef.current.clear();
        }

        const response = await authService.sendOTP({mobile, type: 'login'});
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
      } catch (error) {
        Alert.alert(
          '❌ Network Error',
          'Unable to resend OTP. Please try again.',
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    let valid = true;

    console.log(
      'Validating - Mobile:',
      mobile,
      'OTP:',
      otp,
      'OTP Length:',
      otp.length,
    );

    if (!isMobileValid) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
      valid = false;
    }

    // For verify step, require OTP
    if (isOtpSent) {
      if (!otp || otp.trim().length < 6) {
        newErrors.otp = `Please enter the complete 6-digit OTP${otp.trim().length > 0 ? ` (${otp.trim().length}/6 digits entered)` : ''}`;
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) {
      const errorMessages = [] as string[];
      if (errors.mobile) errorMessages.push(`Mobile: ${errors.mobile}`);
      if (errors.otp) errorMessages.push(`OTP: ${errors.otp}`);
      Alert.alert(
        '❌ Validation Failed',
        errorMessages.join('\n') || 'Please check your inputs.',
      );
      return;
    }

    try {
      setIsLoading(true);
      if (!isOtpSent) {
        // Step 1: Send OTP
        const response = await authService.sendOTP({mobile, type: 'login'});
        if (response.success) {
          setIsOtpSent(true);
          startOtpTimer();
          Alert.alert('✅ OTP Sent', `OTP has been sent to +91 ${mobile}.`);
          // OTP input will auto-focus when isOtpSent becomes true
        } else {
          Alert.alert(
            '❌ Failed to Send OTP',
            response.error || 'Please try again.',
          );
        }
      } else {
        // Step 2: Verify OTP
        const response = await authService.verifyOTP({mobile, otp});
        if (response.success && response.data) {
          const {user, tokens} = response.data;

          // Persist tokens and user
          await AsyncStorage.setItem(
            STORAGE_KEYS.AUTH_TOKENS,
            JSON.stringify(tokens),
          );
          await AsyncStorage.setItem(
            STORAGE_KEYS.USER_DATA,
            JSON.stringify(user),
          );

          const {setUser, setAuthenticated} = useUserStore.getState();
          setUser(user || null);
          setAuthenticated(true);

          Alert.alert(
            '✅ Login Successful',
            `Welcome ${user?.firstName || ''}!`,
            [
              {
                text: 'Continue',
                style: 'default',
                onPress: () => {
                  setShowConfetti(true);
                  setTimeout(() => setIsLoggedIn(true), 800);
                },
              },
            ],
          );
        } else {
          Alert.alert(
            '❌ Verification Failed',
            response.error || 'Please request a new OTP.',
          );
        }
      }
    } catch (error: any) {
      // This catch block should rarely be hit now since verifyOTP returns error responses
      // But keep it as a safety net for unexpected errors
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Please check your connection and try again.';
      Alert.alert('❌ Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Signup');
  };

  const handleOtpChange = (text: string) => {
    console.log('OTP changed to:', text, 'Length:', text.length);
    setOtp(text);
    if (errors.otp) setErrors(prev => ({...prev, otp: ''}));
  };

  return (
    <KeyboardAvoidingView
      testID="login-screen"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{flex: 1, backgroundColor: colors.primaryBackground}}>
      <StatusBar
        backgroundColor={colors.primaryBackground}
        barStyle={
          colors.primaryBackground === '#FFFFFF'
            ? 'dark-content'
            : 'light-content'
        }
      />

      <VStack
        testID="login-container"
        flex={1}
        justifyContent="center"
        alignItems="center"
        px="$5"
        space="lg">
        {/* ✅ Animated Logo */}
        <MotiImage
          testID="login-logo"
          source={appLogo}
          style={{
            width: width,
            height: width * 0.2,
            marginBottom: 30,
          }}
          from={{translateY: 0}}
          animate={{translateY: -10}}
          transition={{
            type: 'timing',
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            loop: true,
            repeatReverse: true,
          }}
        />

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
          isInvalid={!!errors.mobile}>
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
              if (otp.length > 0) setOtp('');
              if (errors.mobile) setErrors(prev => ({...prev, mobile: ''}));
            }}
            placeholderTextColor={colors.mutedText}
            color={colors.inputText}
            onFocus={() => setIsMobileFocused(true)}
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
                fontSize="$md"
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
          onPress={handleLogin}
          isDisabled={
            isLoading ||
            (!isOtpSent
              ? !isMobileValid
              : !isMobileValid || !otp || otp.length < 6)
          }
          w="$full"
          size="lg"
          borderRadius="$md"
          mt="$6"
          bg={colors.accentAction}
          opacity={
            isLoading ||
            (!isOtpSent
              ? !isMobileValid
              : !isMobileValid || !otp || otp.length < 6)
              ? 0.6
              : 1
          }>
          <Text
            testID="login-submit-text"
            color={colors.white}
            fontWeight="$bold">
            {isLoading
              ? isOtpSent
                ? 'Verifying...'
                : 'Sending OTP...'
              : isOtpSent
                ? 'Verify OTP'
                : 'Send OTP'}
          </Text>
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
