import React from 'react';
import {useColorScheme, type StatusBarStyle} from 'react-native';

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

// Dark theme colors
const darkColors = {
  // Backgrounds
  primaryBackground: '#1A1A1A',
  secondaryBackground: '#2D2D2D',
  cardBackground: '#2D2D2D',

  // Primary Colors
  primaryText: '#FFFFFF',
  secondaryText: '#B0B0B0',
  mutedText: '#B0B0B0',
  inputBackground: '#2D2D2D',
  inputText: '#FFFFFF',
  inputBorder: '#404040',

  // Accents
  accentAction: '#0A84FF',
  accentBackground: '#1E3A8A',
  link: '#0A84FF',
  buttonBackground: '#0A84FF',
  buttonText: '#FFFFFF',
  highlight: '#0A84FF',

  subscriptionCta: '#F97316',
  subscriptionCtaText: '#FFFFFF',

  // Status
  danger: '#FF453A',
  warning: '#FF9F0A',
  success: '#30D158',
  info: '#64D2FF',

  // Miscellaneous
  white: '#FFFFFF',
  black: '#000000',
  gray: '#8E8E93',
  lightGray: '#3A3A3C',
  darkGray: '#1C1C1E',
  border: '#404040',
  shadow: 'rgba(0, 0, 0, 0.3)',
  transparent: 'rgba(0, 0, 0, 0.0)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  modalBackground: 'rgba(0, 0, 0, 0.7)',
  modalText: '#FFFFFF',
  toastBackground: '#2D2D2D',
  toastText: '#FFFFFF',
  badgeBackground: '#FF453A',
  badgeText: '#FFFFFF',
  mutedBackground: '#3A3A3C',
};

export type AppColorScheme = 'light' | 'dark';

/** Resolves light/dark from the device appearance (iOS/Android system setting). */
export const useAppColorScheme = (): AppColorScheme => {
  const scheme = useColorScheme();
  return scheme === 'dark' ? 'dark' : 'light';
};

// Hook to get theme-aware colors (follows device light/dark mode)
export const useThemeColors = () => {
  const theme = useAppColorScheme();

  return React.useMemo(() => {
    const baseColors = theme === 'dark' ? darkColors : lightColors;
    return {
      ...baseColors,
      text: baseColors.primaryText,
      textSecondary: baseColors.secondaryText,
      background: baseColors.primaryBackground,
      backgroundSecondary: baseColors.secondaryBackground,
      primary: baseColors.accentAction,
    };
  }, [theme]);
};

/** Status bar icon style + background aligned with the active color scheme. */
export const useStatusBarConfig = () => {
  const colors = useThemeColors();
  const theme = useAppColorScheme();
  const isDark = theme === 'dark';

  return React.useMemo(
    () => ({
      barStyle: (isDark ? 'light-content' : 'dark-content') as StatusBarStyle,
      backgroundColor: colors.primaryBackground,
      navigationStatusBarStyle: (isDark ? 'light' : 'dark') as 'light' | 'dark',
    }),
    [colors.primaryBackground, isDark],
  );
};

// Default export for backward compatibility (light theme for now)
const colors = lightColors;
export default colors;
