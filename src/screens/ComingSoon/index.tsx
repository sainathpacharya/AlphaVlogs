import React from 'react';
import {Dimensions, View} from 'react-native';
import {SafeAreaView, StatusBar, VStack, Text} from '@/components';
import {MotiImage, MotiView} from 'moti';
import {Easing} from 'react-native-reanimated';
import appLogo from '@/assets/png/appLogo.png';
import {useThemeColors} from '@/utils/colors';

const {width} = Dimensions.get('window');

const LOGO_SIZE = width * 0.5;
const GLOW_SIZE = LOGO_SIZE * 1.35;

const ComingSoonScreen = () => {
  const colors = useThemeColors();

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
        {/* Outer wrapper: entrance animation (scale + opacity) — runs once */}
        <MotiView
          from={{opacity: 0, scale: 0.6}}
          animate={{opacity: 1, scale: 1}}
          transition={{
            type: 'timing',
            duration: 700,
            easing: Easing.out(Easing.cubic),
          }}
          style={{alignItems: 'center', justifyContent: 'center'}}>
          {/* Very subtle pulsing glow behind logo — soft shadow, not a solid circle */}
          <MotiView
            style={{
              position: 'absolute',
              width: GLOW_SIZE,
              height: GLOW_SIZE,
              borderRadius: GLOW_SIZE / 2,
              backgroundColor: colors.lightGray,
            }}
            from={{scale: 0.95, opacity: 0.15}}
            animate={{scale: 1.1, opacity: 0.35}}
            transition={{
              type: 'timing',
              duration: 2500,
              easing: Easing.inOut(Easing.ease),
              loop: true,
              repeatReverse: true,
            }}
          />
          {/* Floating + breathing + subtle rotate logo */}
          <MotiImage
            testID="coming-soon-logo"
            source={appLogo}
            style={{
              width: LOGO_SIZE,
              height: LOGO_SIZE,
            }}
            from={{
              translateY: 0,
              scale: 1,
              rotate: '0deg',
            }}
            animate={{
              translateY: [-8, 8],
              scale: [1, 1.06],
              rotate: ['-2deg', '2deg'],
            }}
            transition={{
              type: 'timing',
              duration: 2800,
              easing: Easing.inOut(Easing.ease),
              loop: true,
              repeatReverse: true,
            }}
          />
        </MotiView>

        <MotiView
          style={{marginTop: 48, alignItems: 'center'}}
          from={{opacity: 0, translateY: 20}}
          animate={{opacity: 1, translateY: 0}}
          transition={{
            type: 'timing',
            duration: 600,
            delay: 350,
            easing: Easing.out(Easing.cubic),
          }}>
          {/* "Coming soon" with subtle breathing scale */}
          <MotiView
            from={{scale: 1}}
            animate={{scale: [1, 1.03, 1]}}
            transition={{
              type: 'timing',
              duration: 2200,
              easing: Easing.inOut(Easing.ease),
              loop: true,
              repeatReverse: true,
              delay: 600,
            }}>
            <Text
              testID="coming-soon-text"
              fontSize="$2xl"
              fontWeight="$bold"
              color={colors.primaryText}
              textAlign="center">
              Coming soon
            </Text>
          </MotiView>
        </MotiView>

        {/* Decorative dots: staggered fade + scale */}
        <View style={{flexDirection: 'row', marginTop: 32, gap: 10}}>
          {[0, 1, 2].map((i) => (
            <MotiView
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.accentAction,
              }}
              from={{opacity: 0.2, scale: 0.5}}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [0.9, 1.2, 0.9],
              }}
              transition={{
                type: 'timing',
                duration: 1400,
                easing: Easing.inOut(Easing.ease),
                loop: true,
                repeatReverse: true,
                delay: i * 200,
              }}
            />
          ))}
        </View>
      </VStack>
    </SafeAreaView>
  );
};

export default ComingSoonScreen;
