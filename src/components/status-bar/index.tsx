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
  testID?: string;
};

/**
 * Status bar for the app's light-only theme unless overridden via props.
 * On iOS, native-stack screen options control the status bar (Info.plist must use
 * UIViewControllerBasedStatusBarAppearance = YES). React Native's StatusBar API
 * conflicts with that and is Android-only here.
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

  if (Platform.OS === 'ios') {
    return null;
  }

  return (
    <>
      <RNStatusBar
        barStyle={resolvedBarStyle}
        backgroundColor={resolvedBackground}
        translucent={translucent}
        {...rest}
      />
      {!translucent && (
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
