import { Box } from "@/components";
import { FC, useEffect } from "react";
import {
  AnimatableNumericValue,
  DimensionValue,
  StyleSheet,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface SkeletonProps {
  width?: DimensionValue | string;
  height?: DimensionValue | string;
  rounded?: AnimatableNumericValue | string;
}

const Skeleton: FC<SkeletonProps> = ({
  width = "100%",
  height = 14,
  rounded,
}) => {
  const translateX = useSharedValue(-200);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(200, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1,
      true
    );
  }, [translateX]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: translateX.value,
        },
      ],
    };
  });

  return (
    <Box
      w={width as DimensionValue}
      h={height as DimensionValue}
      rounded={rounded as AnimatableNumericValue}
      style={{ ...styles.placeholder }}
    >
      <Animated.View style={[styles.gradientContainer, animatedStyle]}>
        <LinearGradient
          colors={["#eee", "#ddd", "#eee"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </Box>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: "#eee",
    overflow: "hidden",
  },
  gradientContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
  },
  gradient: {
    flex: 1,
    width: "200%", // Adjust this to ensure the gradient covers the whole width
  },
});

export default Skeleton;
