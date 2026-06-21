import React, {useEffect, useMemo} from 'react';
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export type AppLogoAnimation = 'spring-in' | 'bounce';

type AppLogoImageProps = {
  source: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
  testID?: string;
  animation?: AppLogoAnimation;
};

export function AppLogoImage({
  source,
  style,
  testID,
  animation = 'spring-in',
}: AppLogoImageProps) {
  const AnimatedImage = useMemo(
    () => Animated.createAnimatedComponent(Image),
    [],
  );
  const opacity = useSharedValue(animation === 'spring-in' ? 0 : 1);
  const scale = useSharedValue(animation === 'spring-in' ? 0.5 : 1);
  const translateY = useSharedValue(animation === 'spring-in' ? -100 : 0);
  const rotate = useSharedValue(animation === 'spring-in' ? -10 : 0);
  const bounceY = useSharedValue(0);

  useEffect(() => {
    if (animation === 'spring-in') {
      const springConfig = {damping: 15, stiffness: 40, mass: 1.2};
      opacity.value = withDelay(300, withSpring(1, springConfig));
      scale.value = withDelay(300, withSpring(1, springConfig));
      translateY.value = withDelay(300, withSpring(0, springConfig));
      rotate.value = withDelay(300, withSpring(0, springConfig));
      return;
    }

    bounceY.value = withRepeat(
      withTiming(-10, {duration: 2000, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );
  }, [animation, opacity, scale, translateY, rotate, bounceY]);

  const animatedStyle = useAnimatedStyle(() => {
    if (animation === 'bounce') {
      return {transform: [{translateY: bounceY.value}]};
    }

    return {
      opacity: opacity.value,
      transform: [
        {scale: scale.value},
        {translateY: translateY.value},
        {rotate: `${rotate.value}deg`},
      ],
    };
  });

  return (
    <AnimatedImage
      testID={testID}
      source={source}
      resizeMode="contain"
      style={[style, animatedStyle]}
    />
  );
}
