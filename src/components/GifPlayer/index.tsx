import React, {useState, useRef} from 'react';
import {View, StyleSheet, Alert, Dimensions} from 'react-native';
import FastImage from 'react-native-fast-image';
import {
  Box,
  Text,
  Button,
  VStack,
  HStack,
  Progress,
  // Spinner,
} from '@/components';
import {useThemeColors} from '@/utils/colors';

interface GifPlayerProps {
  gifUrl: string;
  title?: string;
  description?: string;
  width?: number | string;
  height?: number | string;
  autoPlay?: boolean;
  loop?: boolean;
  showControls?: boolean;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: string) => void;
}

const GifPlayerComponent: React.FC<GifPlayerProps> = ({
  gifUrl,
  title,
  description,
  width = '100%',
  height = 200,
  autoPlay = true,
  loop = true,
  showControls = true,
  onLoadStart,
  onLoadEnd,
  onError,
}) => {
  const colors = useThemeColors();
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [hasError, setHasError] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
    setLoadProgress(0);
    onLoadStart?.();
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    setLoadProgress(100);
    onLoadEnd?.();
  };

  const handleError = (error: any) => {
    console.error('GIF Load Error:', error);
    setIsLoading(false);
    setHasError(true);
    onError?.(error.message || 'Failed to load GIF');
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const restartGif = () => {
    // Force reload by changing the key
    setLoadProgress(0);
    setIsPlaying(true);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getImageDimensions = () => {
    const screenWidth = Dimensions.get('window').width;
    const maxWidth = screenWidth - 32; // Account for padding

    if (typeof width === 'number') {
      return {
        width: Math.min(width, maxWidth),
        height: typeof height === 'number' ? height : 200,
      };
    }

    return {
      width: maxWidth,
      height: typeof height === 'number' ? height : 200,
    };
  };

  const dimensions = getImageDimensions();

  return (
    <VStack space="md" style={styles.container}>
      {title && (
        <Text size="lg" fontWeight="bold" color={colors.primaryText}>
          {title}
        </Text>
      )}

      <Box
        style={[
          styles.gifContainer,
          {
            width: dimensions.width,
            height: dimensions.height,
            backgroundColor: colors.secondaryBackground,
          },
        ]}>
        {isLoading && (
          <VStack
            space="sm"
            style={[
              styles.loadingContainer,
              {backgroundColor: colors.secondaryBackground},
            ]}>
            <Text size="lg" color={colors.accentAction}>
              ⏳
            </Text>
            <Text size="sm" color={colors.secondaryText}>
              Loading GIF...
            </Text>
            {loadProgress > 0 && (
              <VStack space="xs" style={styles.progressContainer}>
                <Text size="xs" color={colors.secondaryText}>
                  {loadProgress}%
                </Text>
                <Progress value={loadProgress} size="sm" />
              </VStack>
            )}
          </VStack>
        )}

        {hasError ? (
          <VStack
            space="sm"
            style={[
              styles.errorContainer,
              {backgroundColor: colors.secondaryBackground},
            ]}>
            <Text size="md" color={colors.danger} textAlign="center">
              Failed to load GIF
            </Text>
            <Text size="sm" color={colors.secondaryText} textAlign="center">
              Please check your internet connection and try again
            </Text>
            <Button size="sm" variant="outline" onPress={restartGif}>
              <Text color={colors.accentAction}>Retry</Text>
            </Button>
          </VStack>
        ) : (
          <FastImage
            source={{
              uri: gifUrl,
              priority: FastImage.priority.normal,
            }}
            style={[
              styles.gifImage,
              {
                width: dimensions.width,
                height: dimensions.height,
                opacity: isPlaying ? 1 : 0.5,
              },
            ]}
            resizeMode={FastImage.resizeMode.contain}
            onLoadStart={handleLoadStart}
            onLoad={handleLoadEnd}
            onError={() => handleError('Failed to load GIF')}
          />
        )}
      </Box>

      {description && (
        <Text size="sm" color={colors.secondaryText}>
          {description}
        </Text>
      )}

      {showControls && !hasError && (
        <HStack space="sm" justifyContent="center">
          <Button
            size="sm"
            variant="outline"
            onPress={togglePlayPause}
            isDisabled={isLoading}>
            <Text color={colors.accentAction}>
              {isPlaying ? 'Pause' : 'Play'}
            </Text>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onPress={restartGif}
            isDisabled={isLoading}>
            <Text color={colors.accentAction}>Restart</Text>
          </Button>
        </HStack>
      )}

      {/* GIF Info */}
      <Box
        style={[
          styles.infoContainer,
          {backgroundColor: colors.cardBackground},
        ]}>
        <VStack space="xs">
          <Text size="xs" color={colors.secondaryText}>
            <Text fontWeight="semibold">URL:</Text> {gifUrl}
          </Text>
          <Text size="xs" color={colors.secondaryText}>
            <Text fontWeight="semibold">Status:</Text>{' '}
            {isPlaying ? 'Playing' : 'Paused'}
          </Text>
          <Text size="xs" color={colors.secondaryText}>
            <Text fontWeight="semibold">Loop:</Text>{' '}
            {loop ? 'Enabled' : 'Disabled'}
          </Text>
        </VStack>
      </Box>
    </VStack>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  gifContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: 'relative',
  },
  gifImage: {
    borderRadius: 8,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    padding: 16,
  },
  progressContainer: {
    width: '80%',
  },
  infoContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
});

export default GifPlayerComponent;
