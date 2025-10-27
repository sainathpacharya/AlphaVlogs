import React, {useRef, useState} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import {Box, Text, Button, VStack, HStack} from '@/components';
import {useThemeColors} from '@/utils/colors';

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
  description?: string;
  height?: number;
  width?: number;
  autoplay?: boolean;
  showControls?: boolean;
  onReady?: () => void;
  onError?: (error: string) => void;
  onStateChange?: (state: string) => void;
}

const YouTubePlayerComponent: React.FC<YouTubePlayerProps> = ({
  videoId,
  title,
  description,
  height = 200,
  width = '100%',
  autoplay = false,
  showControls = true,
  onReady,
  onError,
  onStateChange,
}) => {
  const colors = useThemeColors();
  const playerRef = useRef<any>(null);
  const [playing, setPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const handleReady = () => {
    setIsReady(true);
    onReady?.();
  };

  const handleError = (error: string) => {
    console.error('YouTube Player Error:', error);
    onError?.(error);
    Alert.alert('Video Error', 'Failed to load video. Please try again.');
  };

  const handleStateChange = (state: string) => {
    setPlaying(state === 'playing');
    onStateChange?.(state);
  };

  const togglePlayPause = () => {
    setPlaying(!playing);
  };

  const seekTo = (seconds: number) => {
    playerRef.current?.seekTo(seconds, true);
  };

  return (
    <VStack space="md" style={styles.container}>
      {title && (
        <Text size="lg" fontWeight="bold" color={colors.primaryText}>
          {title}
        </Text>
      )}

      <Box
        style={[
          styles.playerContainer,
          {
            height: typeof height === 'number' ? height : 200,
            width: typeof width === 'number' ? width : '100%',
            backgroundColor: colors.primaryBackground,
          },
        ]}>
        <YoutubePlayer
          ref={playerRef}
          height={typeof height === 'number' ? height : 200}
          width={typeof width === 'number' ? width : 300}
          videoId={videoId}
          play={playing}
          onChangeState={handleStateChange}
          onReady={handleReady}
          onError={handleError}
          initialPlayerParams={{
            cc_lang_pref: 'en',
            showClosedCaptions: true,
            controls: showControls,
            rel: false,
          }}
        />
      </Box>

      {description && (
        <Text size="sm" color={colors.secondaryText}>
          {description}
        </Text>
      )}

      <HStack space="sm" justifyContent="center">
        <Button
          size="sm"
          variant="outline"
          onPress={togglePlayPause}
          isDisabled={!isReady}>
          <Text color={colors.accentAction}>{playing ? 'Pause' : 'Play'}</Text>
        </Button>

        <Button
          size="sm"
          variant="outline"
          onPress={() => seekTo(0)}
          isDisabled={!isReady}>
          <Text color={colors.accentAction}>Restart</Text>
        </Button>
      </HStack>
    </VStack>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  playerContainer: {
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
  },
});

export default YouTubePlayerComponent;
