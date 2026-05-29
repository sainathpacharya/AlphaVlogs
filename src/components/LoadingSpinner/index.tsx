import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useThemeColors } from '@/utils/colors';

interface LoadingSpinnerProps {
  size?: number | 'small' | 'large';
  color?: string;
  testID?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color,
  testID,
}) => {
  const colors = useThemeColors();
  const spinnerColor = color || colors.accentAction;

  return (
    <View testID={testID} style={{ alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size={size} color={spinnerColor} />
    </View>
  );
};

export default LoadingSpinner;
