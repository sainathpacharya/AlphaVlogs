import React from 'react';
import {
  Platform,
  StatusBar as RNStatusBar,
  StatusBarProps,
  View,
} from 'react-native';
import {useStatusBarConfig} from '@/utils/colors';

export type AppStatusBarProps = StatusBarProps & {
  backgroundColor?: string;
};

/**
 * Status bar that follows device light/dark mode unless overridden via props.
 */
export const StatusBar: React.FC<AppStatusBarProps> = ({
  barStyle: barStyleProp,
  backgroundColor: backgroundColorProp,
  translucent = false,
  ...rest
}) => {
  const {barStyle, backgroundColor} = useStatusBarConfig();
  const resolvedBarStyle = barStyleProp ?? barStyle;
  const resolvedBackground = backgroundColorProp ?? backgroundColor;

  return (
    <>
      <RNStatusBar
        barStyle={resolvedBarStyle}
        backgroundColor={resolvedBackground}
        translucent={translucent}
        {...rest}
      />
      {Platform.OS === 'android' && !translucent && (
        <View
          style={{
            height: RNStatusBar.currentHeight ?? 24,
            backgroundColor: resolvedBackground,
          }}
        />
      )}
    </>
  );
};
