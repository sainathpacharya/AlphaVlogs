import { StyleSheet, Dimensions } from 'react-native';
import colors from './colors';

const { width, height } = Dimensions.get('window');

// Common dimensions
const DIMENSIONS = {
  screenWidth: width,
  screenHeight: height,
  cardWidth: (width - 60) / 2,
  cardHeight: 180,
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    xlarge: 20,
    round: 25,
    circle: 40,
  },
  padding: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  margin: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    title: 28,
  },
  iconSize: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
    xxl: 60,
    xxxl: 80,
  },
};

// Common styles
const commonStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
  },
  safeContainer: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
    paddingTop: 50,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: colors.primaryBackground,
  },

  // Card styles
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: DIMENSIONS.borderRadius.medium,
    padding: DIMENSIONS.padding.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHighlighted: {
    backgroundColor: colors.cardBackground,
    borderRadius: DIMENSIONS.borderRadius.medium,
    padding: DIMENSIONS.padding.md,
    borderWidth: 2,
    borderColor: colors.accentAction,
  },
  cardPremium: {
    backgroundColor: colors.cardBackground,
    borderRadius: DIMENSIONS.borderRadius.medium,
    padding: DIMENSIONS.padding.md,
    borderWidth: 2,
    borderColor: colors.success,
  },

  // Text styles
  text: {
    color: colors.primaryText,
    fontSize: DIMENSIONS.fontSize.md,
    fontFamily: 'System',
  },
  textTitle: {
    color: colors.primaryText,
    fontSize: DIMENSIONS.fontSize.title,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textHeading: {
    color: colors.primaryText,
    fontSize: DIMENSIONS.fontSize.xxl,
    fontWeight: '600',
  },
  textSubtitle: {
    color: colors.mutedText,
    fontSize: DIMENSIONS.fontSize.lg,
    textAlign: 'center',
  },
  textWhite: {
    color: colors.white,
  },
  textLarge: {
    fontSize: DIMENSIONS.fontSize.lg,
  },
  textBold: {
    fontWeight: 'bold',
  },
  textCenter: {
    textAlign: 'center',
  },

  // Button styles
  button: {
    backgroundColor: colors.accentAction,
    borderRadius: DIMENSIONS.borderRadius.medium,
    padding: DIMENSIONS.padding.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.border,
    opacity: 0.6,
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: DIMENSIONS.fontSize.md,
    fontWeight: 'bold',
  },

  // Input styles
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: DIMENSIONS.borderRadius.medium,
    padding: DIMENSIONS.padding.md,
    color: colors.inputText,
    fontSize: DIMENSIONS.fontSize.md,
  },
  inputFocused: {
    borderColor: colors.accentAction,
  },
  inputError: {
    borderColor: colors.danger,
  },

  // Progress styles
  progressContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: DIMENSIONS.borderRadius.medium,
    padding: DIMENSIONS.padding.md,
    marginVertical: DIMENSIONS.margin.sm,
  },
  progressTitle: {
    color: colors.primaryText,
    fontSize: DIMENSIONS.fontSize.md,
    fontWeight: '600',
    marginBottom: DIMENSIONS.margin.sm,
  },
  progressText: {
    color: colors.mutedText,
    fontSize: DIMENSIONS.fontSize.sm,
    textAlign: 'center',
    marginTop: DIMENSIONS.margin.sm,
  },

  // Warning styles
  warningCard: {
    backgroundColor: colors.warning,
    borderRadius: DIMENSIONS.borderRadius.medium,
    padding: DIMENSIONS.padding.md,
    marginVertical: DIMENSIONS.margin.sm,
  },
  warningTitle: {
    color: colors.white,
    fontSize: DIMENSIONS.fontSize.md,
    fontWeight: 'bold',
    marginBottom: DIMENSIONS.margin.sm,
  },
  warningText: {
    color: colors.white,
    fontSize: DIMENSIONS.fontSize.sm,
    lineHeight: 20,
  },

  // Lottie styles
  lottie: {
    width: 120,
    height: 120,
  },
  lottieSmall: {
    width: 40,
    height: 40,
  },
});

// Screen-specific styles
const screenStyles = {
  dashboard: {
    subscriptionBanner: {
      backgroundColor: colors.cardBackground,
      padding: DIMENSIONS.padding.md,
      borderRadius: DIMENSIONS.borderRadius.medium,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: DIMENSIONS.margin.md,
    },
    subscriptionTitle: {
      color: colors.primaryText,
      fontSize: DIMENSIONS.fontSize.xl,
      fontWeight: 'bold',
    },
    subscriptionSubtitle: {
      color: colors.mutedText,
      fontSize: DIMENSIONS.fontSize.md,
    },
    subscribeButton: {
      backgroundColor: colors.accentAction,
      paddingHorizontal: DIMENSIONS.padding.md,
      paddingVertical: DIMENSIONS.padding.sm,
      borderRadius: DIMENSIONS.borderRadius.medium,
    },
    subscribeButtonText: {
      color: colors.buttonText,
      fontSize: DIMENSIONS.fontSize.md,
      fontWeight: 'bold',
    },
  },
  videoUpload: {
    guidelinesCard: {
      backgroundColor: colors.cardBackground,
      padding: DIMENSIONS.padding.md,
      borderRadius: DIMENSIONS.borderRadius.medium,
      borderWidth: 1,
      borderColor: colors.border,
      marginVertical: DIMENSIONS.margin.sm,
    },
    guidelinesTitle: {
      color: colors.primaryText,
      fontSize: DIMENSIONS.fontSize.lg,
      fontWeight: 'bold',
      marginBottom: DIMENSIONS.margin.sm,
    },
    guidelineText: {
      color: colors.primaryText,
      fontSize: DIMENSIONS.fontSize.sm,
      lineHeight: 20,
    },
    selectVideoCard: {
      backgroundColor: colors.cardBackground,
      padding: DIMENSIONS.padding.lg,
      borderRadius: DIMENSIONS.borderRadius.medium,
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: 'dashed',
      alignItems: 'center',
      marginVertical: DIMENSIONS.margin.sm,
    },
    selectVideoIcon: {
      width: 60,
      height: 60,
      marginBottom: DIMENSIONS.margin.sm,
    },
    selectVideoTitle: {
      color: colors.primaryText,
      fontSize: DIMENSIONS.fontSize.lg,
      fontWeight: 'bold',
      marginBottom: DIMENSIONS.margin.xs,
    },
    selectVideoSubtitle: {
      color: colors.mutedText,
      fontSize: DIMENSIONS.fontSize.sm,
      textAlign: 'center',
    },
    selectedVideoCard: {
      backgroundColor: colors.cardBackground,
      padding: DIMENSIONS.padding.md,
      borderRadius: DIMENSIONS.borderRadius.medium,
      borderWidth: 1,
      borderColor: colors.success,
      marginVertical: DIMENSIONS.margin.sm,
    },
    selectedVideoTitle: {
      color: colors.primaryText,
      fontSize: DIMENSIONS.fontSize.md,
      fontWeight: 'bold',
      marginBottom: DIMENSIONS.margin.sm,
    },
    videoInfo: {
      color: colors.mutedText,
      fontSize: DIMENSIONS.fontSize.sm,
    },
    uploadButton: {
      backgroundColor: colors.accentAction,
      paddingVertical: DIMENSIONS.padding.md,
      borderRadius: DIMENSIONS.borderRadius.medium,
      marginTop: DIMENSIONS.margin.md,
    },
  },
};

export { commonStyles, screenStyles, DIMENSIONS };
export default commonStyles;
