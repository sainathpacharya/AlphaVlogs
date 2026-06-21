import React, {useEffect} from 'react';
import {Dimensions, View} from 'react-native';
import {SafeAreaView, StatusBar, VStack, Text} from '@/components';
import {AppLogoImage} from '@/components/AppLogoImage';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import appLogo from '@/assets/png/appLogo.png';
import {useThemeColors} from '@/utils/colors';

const {width} = Dimensions.get('window');

const LOGO_SIZE = width * 0.5;
const GLOW_SIZE = LOGO_SIZE * 1.35;

const AnimatedView = Animated.createAnimatedComponent(View);

const ComingSoonScreen = () => {
  const colors = useThemeColors();
  const entranceOpacity = useSharedValue(0);
  const entranceScale = useSharedValue(0.6);
  const glowScale = useSharedValue(0.95);
  const glowOpacity = useSharedValue(0.15);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);

  useEffect(() => {
    entranceOpacity.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
    entranceScale.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
    glowScale.value = withRepeat(
      withTiming(1.1, {duration: 2500, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );
    glowOpacity.value = withRepeat(
      withTiming(0.35, {duration: 2500, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );
    textOpacity.value = withDelay(
      350,
      withTiming(1, {duration: 600, easing: Easing.out(Easing.cubic)}),
    );
    textTranslateY.value = withDelay(
      350,
      withTiming(0, {duration: 600, easing: Easing.out(Easing.cubic)}),
    );
  }, [
    entranceOpacity,
    entranceScale,
    glowOpacity,
    glowScale,
    textOpacity,
    textTranslateY,
  ]);

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: entranceOpacity.value,
    transform: [{scale: entranceScale.value}],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{scale: glowScale.value}],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{translateY: textTranslateY.value}],
  }));

  return (
    <SafeAreaView
      testID="coming-soon-screen"
      style={{flex: 1, backgroundColor: colors.primaryBackground}}>
      <StatusBar translucent={false} />
      <VStack
        testID="coming-soon-container"
        flex={1}
        justifyContent="center"
        alignItems="center"
        px="$5">
        <AnimatedView style={[{alignItems: 'center', justifyContent: 'center'}, entranceStyle]}>
          <AnimatedView
            style={[
              {
                position: 'absolute',
                width: GLOW_SIZE,
                height: GLOW_SIZE,
                borderRadius: GLOW_SIZE / 2,
                backgroundColor: colors.lightGray,
              },
              glowStyle,
            ]}
          />
          <AppLogoImage
            testID="coming-soon-logo"
            source={appLogo}
            animation="bounce"
            style={{
              width: LOGO_SIZE,
              height: LOGO_SIZE,
            }}
          />
        </AnimatedView>

        <AnimatedView style={[{marginTop: 48, alignItems: 'center'}, textStyle]}>
          <Text
            testID="coming-soon-text"
            fontSize="$2xl"
            fontWeight="$bold"
            color={colors.primaryText}
            textAlign="center">
            Coming soon
          </Text>
        </AnimatedView>

        <View style={{flexDirection: 'row', marginTop: 32, gap: 10}}>
          {[0, 1, 2].map(i => (
            <View
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.accentAction,
                opacity: 0.5 + i * 0.15,
              }}
            />
          ))}
        </View>
      </VStack>
    </SafeAreaView>
  );
};

export default ComingSoonScreen;
