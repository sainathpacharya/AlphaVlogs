// Mock useThemeColors hook
const useThemeColors = jest.fn(() => ({
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
  accentSuccess: '#28A745',
  accentWarning: '#FFC107',
  accentDanger: '#DC3545',
  accentInfo: '#17A2B8',

  // Borders
  border: '#DEE2E6',
  borderLight: '#E9ECEF',
  borderDark: '#ADB5BD',

  // Status colors
  success: '#28A745',
  warning: '#FFC107',
  danger: '#DC3545',
  info: '#17A2B8',

  // Other
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
}));

module.exports = {
  useThemeColors,
};
