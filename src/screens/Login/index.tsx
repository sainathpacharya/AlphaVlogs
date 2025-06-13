import React, {useState, useRef} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  VStack,
  Input,
  InputField,
  Button,
  Text,
  Pressable,
  StatusBar,
  Box,
  useToast,
} from '../../components';
import {MotiImage} from 'moti';
import {Easing} from 'react-native-reanimated';
import ConfettiCannon from 'react-native-confetti-cannon';
import appLogo from '../../assets/png/appLogo.png';
import colors from '../../utils/colors';
import {Phone, XCircle} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const LoginScreen = ({navigation}: any) => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<{mobile?: string; otp?: string}>({});
  const [isMobileFocused, setIsMobileFocused] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const otpRef = useRef<any>(null);
  const toast = useToast();

  const isMobileValid = mobile.length === 10 && /^\d{10}$/.test(mobile);

  const validate = () => {
    const newErrors: typeof errors = {};
    let valid = true;

    if (!isMobileValid) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
      valid = false;
    }

    if (!otp || otp.length < 4) {
      newErrors.otp = 'Enter a valid OTP';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = () => {
    if (validate()) {
      toast.show({
        placement: 'top',
        render: () => (
          <Box
            bg={colors.success}
            p="$4"
            borderRadius="$md"
            shadowColor={colors.shadow}
            shadowOffset={{width: 0, height: 2}}
            shadowOpacity={0.3}
            shadowRadius={4}>
            <Text color={colors.white} fontWeight="$bold" mb="$2">
              ✅ Success
            </Text>
            <Text color={colors.white}>
              Mobile: {mobile}
              {'\n'}OTP: {otp}
            </Text>
          </Box>
        ),
      });

      setShowConfetti(true);

      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{name: 'Dashboard'}],
        });
      }, 1500);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Signup');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{flex: 1, backgroundColor: colors.primaryBackground}}>
      <StatusBar
        backgroundColor={colors.primaryBackground}
        barStyle="light-content"
      />

      <VStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        px="$5"
        space="lg">
        {/* ✅ Animated Logo */}
        <MotiImage
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
          fontSize="$3xl"
          fontWeight="$bold"
          mb="$5"
          color={colors.primaryText}>
          Login
        </Text>

        {/* ✅ Mobile Input with icon and clear */}
        <Input
          w="$full"
          size="lg"
          variant="outline"
          borderColor={colors.accentAction}
          bg={colors.primaryBackground}
          isInvalid={!!errors.mobile}>
          <Box pl="$3" justifyContent="center" height="100%">
            <Phone size={20} color={colors.accentAction} />
          </Box>
          <InputField
            placeholder="Enter Mobile Number"
            keyboardType="number-pad"
            maxLength={10}
            value={mobile}
            editable={!isMobileValid || otp.length === 0}
            onChangeText={val => {
              if (!isMobileValid || otp.length === 0) {
                setMobile(val.trim());
                if (otp.length > 0) setOtp('');
                if (errors.mobile) setErrors(prev => ({...prev, mobile: ''}));
              }
            }}
            placeholderTextColor={colors.mutedText}
            onFocus={() => setIsMobileFocused(true)}
            onBlur={() => setIsMobileFocused(false)}
            returnKeyType="next"
            onSubmitEditing={() => otpRef.current?.focus()}
          />
          {mobile?.length > 0 &&
            isMobileFocused &&
            (!isMobileValid || otp.length === 0) && (
              <TouchableOpacity
                onPress={() => setMobile('')}
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
          <Text color={colors.danger} mt="$2">
            {errors.mobile}
          </Text>
        )}

        {/* ✅ OTP */}
        {isMobileValid && (
          <>
            <Input
              w="$full"
              size="lg"
              variant="outline"
              borderColor={colors.accentAction}
              bg={colors.primaryBackground}
              isInvalid={!!errors.otp}
              mt="$4">
              <InputField
                ref={otpRef}
                placeholder="Enter OTP"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={val => {
                  setOtp(val.trim());
                  if (errors.otp) setErrors(prev => ({...prev, otp: ''}));
                }}
                placeholderTextColor={colors.mutedText}
                returnKeyType="done"
              />
            </Input>
            {errors.otp && (
              <Text color={colors.danger} mt="$2">
                {errors.otp}
              </Text>
            )}
          </>
        )}

        {/* ✅ Login Button */}
        <Button
          onPress={handleLogin}
          isDisabled={!isMobileValid || !otp}
          w="$full"
          size="lg"
          borderRadius="$md"
          mt="$6"
          bg={colors.accentAction}
          opacity={!isMobileValid || !otp ? 0.6 : 1}>
          <Text color={colors.primaryBackground} fontWeight="$bold">
            Login
          </Text>
        </Button>

        {/* ✅ Register Prompt */}
        <Box flexDirection="row" mt="$5">
          <Text color={colors.primaryText}>Not registered? </Text>
          <Pressable onPress={handleRegister} $pressed={{opacity: 0.6}}>
            <Text color={colors.accentAction} fontWeight="$semibold">
              Register
            </Text>
          </Pressable>
        </Box>
      </VStack>

      {/* ✅ Confetti Cannon 🎉 */}
      {showConfetti && (
        <ConfettiCannon
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
