import React, {useRef} from 'react';
import {
  View,
  Pressable,
  PressableProps,
  GestureResponderEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

interface RippleEffectProps extends PressableProps {
  children: React.ReactNode;
  rippleColor?: string;
  rippleOpacity?: number;
  rippleDuration?: number;
  disabled?: boolean;
}

export const RippleEffect: React.FC<RippleEffectProps> = ({
  children,
  rippleColor = 'rgba(255, 255, 255, 0.3)',
  rippleOpacity = 0.3,
  rippleDuration = 300,
  disabled = false,
  onPressIn,
  onPressOut,
  style,
  ...props
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rippleRef = useRef<View>(null);

  const handlePressIn = (event: GestureResponderEvent) => {
    if (disabled) {return;}

    // Set ripple position and size
    scale.value = withSequence(
      withTiming(1, {duration: rippleDuration / 2}),
      withTiming(0, {duration: rippleDuration / 2}),
    );
    opacity.value = withSequence(
      withTiming(rippleOpacity, {duration: rippleDuration / 2}),
      withTiming(0, {duration: rippleDuration / 2}),
    );

    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    if (disabled) {return;}

    // Ensure ripple completes even if press is released early
    scale.value = withTiming(0, {duration: rippleDuration / 2});
    opacity.value = withTiming(0, {duration: rippleDuration / 2});

    onPressOut?.(event);
  };

  const animatedRippleStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: scale.value}],
      opacity: opacity.value,
    };
  });

  return (
    <Pressable
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        typeof style === 'function' ? style({pressed: false}) : style,
        {overflow: 'hidden'},
      ]}>
      {children}
      <Animated.View
        ref={rippleRef}
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: rippleColor,
            borderRadius: 9999, // Circular ripple
            transform: [{scale: 0}],
          },
          animatedRippleStyle,
        ]}
        pointerEvents="none"
      />
    </Pressable>
  );
};

export default RippleEffect;
