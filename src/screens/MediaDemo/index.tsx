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
  Tab,
  TabList,
  TabTitle,
  TabPanels,
  TabPanel,
} from '@/components';
import {useThemeColors} from '@/utils/colors';
import {YouTubePlayer, YouTubeUpload, GifPlayer} from '@/components';
import {youtubeService} from '@/services/youtube-service';
import {gifService} from '@/services/gif-service';

const MediaDemoScreen: React.FC = () => {
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState(0);
  const [youtubeVideoId, setYoutubeVideoId] = useState('dQw4w9WgXcQ');
  const [customYoutubeId, setCustomYoutubeId] = useState('');
  const [gifUrl, setGifUrl] = useState(
    'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif',
  );
  const [customGifUrl, setCustomGifUrl] = useState('');

  const handlePlayYoutubeVideo = () => {
    if (customYoutubeId.trim()) {
      setYoutubeVideoId(customYoutubeId.trim());
    }
  };

  const handlePlayGif = () => {
    if (customGifUrl.trim()) {
      setGifUrl(customGifUrl.trim());
    }
  };

  const handleYoutubeUploadComplete = (videoId: string, videoUrl: string) => {
    console.log('YouTube video uploaded:', {videoId, videoUrl});
  };

  const handleYoutubeUploadError = (error: string) => {
    console.error('YouTube upload error:', error);
  };

  const handleGifUploadComplete = (gifId: string, gifUrl: string) => {
    console.log('GIF uploaded:', {gifId, gifUrl});
  };

  const handleGifUploadError = (error: string) => {
    console.error('GIF upload error:', error);
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.primaryBackground}]}>
      <VStack space="lg" style={styles.content}>
        <Text size="2xl" fontWeight="bold" color={colors.primaryText}>
          Media Integration Demo
        </Text>

        <Tab value={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab>
              <TabTitle>YouTube</TabTitle>
            </Tab>
            <Tab>
              <TabTitle>GIF Player</TabTitle>
            </Tab>
            <Tab>
              <TabTitle>Services</TabTitle>
            </Tab>
          </TabList>

          <TabPanels>
            {/* YouTube Tab */}
            <TabPanel>
              <VStack space="lg">
                <Text
                  size="lg"
                  fontWeight="semibold"
                  color={colors.primaryText}>
                  YouTube Integration
                </Text>

                {/* YouTube Player */}
                <VStack space="md">
                  <Text
                    size="md"
                    fontWeight="semibold"
                    color={colors.primaryText}>
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
                          value={customYoutubeId}
                          onChangeText={setCustomYoutubeId}
                        />
                      </Input>
                      <Button onPress={handlePlayYoutubeVideo}>
                        <Text color={colors.buttonText}>Play</Text>
                      </Button>
                    </HStack>
                  </VStack>

                  <YouTubePlayer
                    videoId={youtubeVideoId}
                    title="Sample YouTube Video"
                    description="This is a demo of the YouTube player component"
                    height={250}
                    showControls={true}
                  />
                </VStack>

                {/* YouTube Upload */}
                <VStack space="md">
                  <Text
                    size="md"
                    fontWeight="semibold"
                    color={colors.primaryText}>
                    Video Upload
                  </Text>

                  <Text size="sm" color={colors.secondaryText}>
                    Upload videos directly to your YouTube channel:
                  </Text>

                  <YouTubeUpload
                    onUploadComplete={handleYoutubeUploadComplete}
                    onUploadError={handleYoutubeUploadError}
                  />
                </VStack>
              </VStack>
            </TabPanel>

            {/* GIF Player Tab */}
            <TabPanel>
              <VStack space="lg">
                <Text
                  size="lg"
                  fontWeight="semibold"
                  color={colors.primaryText}>
                  GIF Player Integration
                </Text>

                {/* GIF Player */}
                <VStack space="md">
                  <Text
                    size="md"
                    fontWeight="semibold"
                    color={colors.primaryText}>
                    GIF Player
                  </Text>

                  <VStack space="sm">
                    <Text size="sm" color={colors.secondaryText}>
                      Enter a GIF URL to play:
                    </Text>
                    <HStack space="sm">
                      <Input flex={1}>
                        <InputInput
                          placeholder="Enter GIF URL"
                          value={customGifUrl}
                          onChangeText={setCustomGifUrl}
                        />
                      </Input>
                      <Button onPress={handlePlayGif}>
                        <Text color={colors.buttonText}>Play</Text>
                      </Button>
                    </HStack>
                  </VStack>

                  <GifPlayer
                    gifUrl={gifUrl}
                    title="Sample GIF"
                    description="This is a demo of the GIF player component"
                    width="100%"
                    height={250}
                    showControls={true}
                    autoPlay={true}
                  />
                </VStack>

                {/* GIF Service Demo */}
                <VStack space="md">
                  <Text
                    size="md"
                    fontWeight="semibold"
                    color={colors.primaryText}>
                    GIF Service Demo
                  </Text>

                  <VStack space="sm">
                    <Button
                      onPress={async () => {
                        try {
                          const gifs = await gifService.getGifs();
                          console.log('Fetched GIFs:', gifs);
                        } catch (error) {
                          console.error('Error fetching GIFs:', error);
                        }
                      }}>
                      <Text color={colors.buttonText}>Fetch GIFs</Text>
                    </Button>

                    <Button
                      onPress={async () => {
                        try {
                          const searchResults =
                            await gifService.searchGifs('funny');
                          console.log('Search results:', searchResults);
                        } catch (error) {
                          console.error('Error searching GIFs:', error);
                        }
                      }}>
                      <Text color={colors.buttonText}>Search GIFs</Text>
                    </Button>

                    <Button
                      onPress={async () => {
                        try {
                          const trendingGifs =
                            await gifService.getTrendingGifs();
                          console.log('Trending GIFs:', trendingGifs);
                        } catch (error) {
                          console.error('Error fetching trending GIFs:', error);
                        }
                      }}>
                      <Text color={colors.buttonText}>Get Trending GIFs</Text>
                    </Button>
                  </VStack>
                </VStack>
              </VStack>
            </TabPanel>

            {/* Services Tab */}
            <TabPanel>
              <VStack space="lg">
                <Text
                  size="lg"
                  fontWeight="semibold"
                  color={colors.primaryText}>
                  Service Demos
                </Text>

                {/* YouTube Service Demo */}
                <VStack space="md">
                  <Text
                    size="md"
                    fontWeight="semibold"
                    color={colors.primaryText}>
                    YouTube Service
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
                      <Text color={colors.buttonText}>
                        Fetch YouTube Videos
                      </Text>
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
                      <Text color={colors.buttonText}>
                        Search YouTube Videos
                      </Text>
                    </Button>

                    <Button
                      onPress={() => {
                        const testUrl =
                          'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
                        const extractedId =
                          youtubeService.extractVideoId(testUrl);
                        console.log('Extracted video ID:', extractedId);
                      }}>
                      <Text color={colors.buttonText}>Extract Video ID</Text>
                    </Button>
                  </VStack>
                </VStack>

                {/* GIF Service Demo */}
                <VStack space="md">
                  <Text
                    size="md"
                    fontWeight="semibold"
                    color={colors.primaryText}>
                    GIF Service
                  </Text>

                  <VStack space="sm">
                    <Button
                      onPress={async () => {
                        try {
                          const categories = await gifService.getCategories();
                          console.log('GIF Categories:', categories);
                        } catch (error) {
                          console.error('Error fetching categories:', error);
                        }
                      }}>
                      <Text color={colors.buttonText}>Get GIF Categories</Text>
                    </Button>

                    <Button
                      onPress={async () => {
                        try {
                          const gif = await gifService.getGifById('1');
                          console.log('GIF by ID:', gif);
                        } catch (error) {
                          console.error('Error fetching GIF by ID:', error);
                        }
                      }}>
                      <Text color={colors.buttonText}>Get GIF by ID</Text>
                    </Button>
                  </VStack>
                </VStack>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tab>
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

export default MediaDemoScreen;
