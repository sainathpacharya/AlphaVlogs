import React, {useState} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {
  Box,
  Text,
  Button,
  VStack,
  HStack,
  Input,
  InputInput,
} from '@/components';
import {useThemeColors} from '@/utils/colors';
import {YouTubePlayer, YouTubeUpload} from '@/components';
import {youtubeService} from '@/services/youtube-service';

const YouTubeDemoScreen: React.FC = () => {
  const colors = useThemeColors();
  const [videoId, setVideoId] = useState('dQw4w9WgXcQ'); // Default video ID
  const [customVideoId, setCustomVideoId] = useState('');

  const handlePlayVideo = () => {
    if (customVideoId.trim()) {
      setVideoId(customVideoId.trim());
    }
  };

  const handleUploadComplete = (videoId: string, videoUrl: string) => {
    console.log('Video uploaded successfully:', {videoId, videoUrl});
    // You can show a success message or navigate somewhere
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    // You can show an error message
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.primaryBackground}]}>
      <VStack space="lg" style={styles.content}>
        <Text size="2xl" fontWeight="bold" color={colors.primaryText}>
          YouTube Integration Demo
        </Text>

        {/* Video Player Section */}
        <VStack space="md">
          <Text size="lg" fontWeight="semibold" color={colors.primaryText}>
            Video Player
          </Text>

          <VStack space="sm">
            <Text size="sm" color={colors.secondaryText}>
              Enter a YouTube Video ID to play:
            </Text>
            <HStack space="sm">
              <Input flex={1}>
                <InputInput
                  placeholder="Enter YouTube Video ID"
                  value={customVideoId}
                  onChangeText={setCustomVideoId}
                />
              </Input>
              <Button onPress={handlePlayVideo}>
                <Text color={colors.buttonText}>Play</Text>
              </Button>
            </HStack>
          </VStack>

          <YouTubePlayer
            videoId={videoId}
            title="Sample YouTube Video"
            description="This is a demo of the YouTube player component"
            height={250}
            showControls={true}
          />
        </VStack>

        {/* Video Upload Section */}
        <VStack space="md">
          <Text size="lg" fontWeight="semibold" color={colors.primaryText}>
            Video Upload
          </Text>

          <Text size="sm" color={colors.secondaryText}>
            Upload videos directly to your YouTube channel:
          </Text>

          <YouTubeUpload
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
          />
        </VStack>

        {/* Service Demo Section */}
        <VStack space="md">
          <Text size="lg" fontWeight="semibold" color={colors.primaryText}>
            Service Demo
          </Text>

          <VStack space="sm">
            <Button
              onPress={async () => {
                try {
                  const videos = await youtubeService.getVideos();
                  console.log('Fetched videos:', videos);
                } catch (error) {
                  console.error('Error fetching videos:', error);
                }
              }}>
              <Text color={colors.buttonText}>Fetch Videos</Text>
            </Button>

            <Button
              onPress={async () => {
                try {
                  const searchResults =
                    await youtubeService.searchVideos('education');
                  console.log('Search results:', searchResults);
                } catch (error) {
                  console.error('Error searching videos:', error);
                }
              }}>
              <Text color={colors.buttonText}>Search Videos</Text>
            </Button>

            <Button
              onPress={() => {
                const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
                const extractedId = youtubeService.extractVideoId(testUrl);
                console.log('Extracted video ID:', extractedId);
              }}>
              <Text color={colors.buttonText}>Extract Video ID</Text>
            </Button>
          </VStack>
        </VStack>
      </VStack>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
});

export default YouTubeDemoScreen;
