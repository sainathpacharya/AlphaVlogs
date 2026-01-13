import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useThemeColors } from '@/utils/colors';

interface LoadingSpinnerProps {
  size?: number | 'small' | 'large';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color,
}) => {
  const colors = useThemeColors();
  const spinnerColor = color || colors.accentAction;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size={size} color={spinnerColor} />
    </View>
  );
};

export default LoadingSpinner;
