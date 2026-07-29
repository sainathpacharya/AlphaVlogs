import React from 'react';
import {type StatusBarStyle} from 'react-native';

// Light theme colors (exported for screens that force light theme, e.g. Login)
export const lightColors = {
  // Backgrounds
  primaryBackground: '#FFFFFF',
  secondaryBackground: '#F8F9FA',
  cardBackground: '#FFFFFF',

  // Primary Colors
  primaryText: '#1A1A1A',
  secondaryText: '#6C757D',
  mutedText: '#6C757D',
  inputBackground: '#FFFFFF',
  inputText: '#1A1A1A',
  inputBorder: '#DEE2E6',

  // Accents
  accentAction: '#007AFF',
  accentBackground: '#E3F2FD',
  link: '#007AFF',
  buttonBackground: '#007AFF',
  buttonText: '#FFFFFF',
  highlight: '#007AFF',

  // Premium / subscribe CTA (warm orange — distinct from primary blue actions)
  subscriptionCta: '#EA580C',
  subscriptionCtaText: '#FFFFFF',

  // Status
  danger: '#DC3545',
  warning: '#FFC107',
  success: '#28A745',
  info: '#17A2B8',

  // Miscellaneous
  white: '#FFFFFF',
  black: '#000000',
  gray: '#6C757D',
  lightGray: '#F8F9FA',
  darkGray: '#343A40',
  border: '#DEE2E6',
  shadow: 'rgba(0, 0, 0, 0.1)',
  transparent: 'rgba(0, 0, 0, 0.0)',
  overlay: 'rgba(0, 0, 0, 0.3)',
  modalBackground: 'rgba(0, 0, 0, 0.6)',
  modalText: '#1A1A1A',
  toastBackground: '#333333',
  toastText: '#FFFFFF',
  badgeBackground: '#FF6B6B',
  badgeText: '#FFFFFF',
  mutedBackground: '#F8F9FA',
};

export type AppColorScheme = 'light' | 'dark';

/** App is light-only; ignore device dark mode. */
export const useAppColorScheme = (): AppColorScheme => 'light';

/** Hook to get app colors (always light theme). */
export const useThemeColors = () => {
  return React.useMemo(
    () => ({
      ...lightColors,
      text: lightColors.primaryText,
      textSecondary: lightColors.secondaryText,
      background: lightColors.primaryBackground,
      backgroundSecondary: lightColors.secondaryBackground,
      primary: lightColors.accentAction,
    }),
    [],
  );
};

/** Status bar icon style + background for light theme. */
export const useStatusBarConfig = () => {
  const colors = useThemeColors();

  return React.useMemo(
    () => ({
      barStyle: 'dark-content' as StatusBarStyle,
      backgroundColor: colors.primaryBackground,
      navigationStatusBarStyle: 'dark' as 'light' | 'dark',
    }),
    [colors.primaryBackground],
  );
};

// Default export for backward compatibility (light theme for now)
const colors = lightColors;
export default colors;
