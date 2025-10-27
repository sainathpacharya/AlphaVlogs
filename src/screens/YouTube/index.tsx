import React, {useState, useEffect} from 'react';
import {ScrollView, RefreshControl, StyleSheet} from 'react-native';
import {
  Box,
  Text,
  Button,
  VStack,
  HStack,
  Input,
  InputInput,
  InputIcon,
  InputSlot,
  SearchIcon,
  Tab,
  TabList,
  TabTitle,
  TabPanels,
  TabPanel,
  Skeleton,
  SkeletonText,
} from '@/components';
import {useThemeColors} from '@/utils/colors';
import {youtubeService, YouTubeVideo} from '@/services/youtube-service';
import YouTubePlayerComponent from '@/components/YouTubePlayer';
import YouTubeUploadComponent from '@/components/YouTubeUpload';

const YouTubeScreen: React.FC = () => {
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState(0);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setIsLoading(true);
    try {
      const videoData = await youtubeService.getVideos();
      setVideos(videoData);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadVideos();
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await youtubeService.searchVideos(
        searchQuery.trim(),
      );
      setVideos(searchResults);
    } catch (error) {
      console.error('Error searching videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadVideos();
    setIsRefreshing(false);
  };

  const handleVideoSelect = (video: YouTubeVideo) => {
    setSelectedVideo(video);
  };

  const handleUploadComplete = (videoId: string, videoUrl: string) => {
    // Refresh videos list to show the newly uploaded video
    loadVideos();
    setActiveTab(0); // Switch to videos tab
  };

  const renderVideoCard = (video: YouTubeVideo) => (
    <Box
      key={video.id}
      style={[styles.videoCard, {backgroundColor: colors.backgroundSecondary}]}>
      <VStack space="sm">
        <Box style={styles.thumbnailContainer}>
          <img
            src={video.thumbnail}
            alt={video.title}
            style={styles.thumbnail}
            onError={e => {
              e.currentTarget.src =
                'https://via.placeholder.com/320x180?text=No+Thumbnail';
            }}
          />
          <Box style={styles.durationBadge}>
            <Text size="xs" color="white" fontWeight="bold">
              {video.duration}
            </Text>
          </Box>
        </Box>

        <VStack space="xs">
          <Text
            size="sm"
            fontWeight="semibold"
            color={colors.text}
            numberOfLines={2}>
            {video.title}
          </Text>
          <Text size="xs" color={colors.textSecondary}>
            {video.channelTitle}
          </Text>
          <HStack space="sm">
            <Text size="xs" color={colors.textSecondary}>
              {video.viewCount.toLocaleString()} views
            </Text>
            <Text size="xs" color={colors.textSecondary}>
              •
            </Text>
            <Text size="xs" color={colors.textSecondary}>
              {new Date(video.publishedAt).toLocaleDateString()}
            </Text>
          </HStack>
        </VStack>

        <HStack space="sm">
          <Button
            size="sm"
            variant="outline"
            onPress={() => handleVideoSelect(video)}
            flex={1}>
            <Text color={colors.primary}>Play</Text>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onPress={() => {
              // Open in YouTube app or browser
              const url = youtubeService.getVideoUrl(video.videoId);
              // You can use Linking.openURL(url) here
            }}
            flex={1}>
            <Text color={colors.primary}>Open</Text>
          </Button>
        </HStack>
      </VStack>
    </Box>
  );

  const renderSkeleton = () => (
    <VStack space="md">
      {[1, 2, 3].map(i => (
        <Box
          key={i}
          style={[
            styles.videoCard,
            {backgroundColor: colors.backgroundSecondary},
          ]}>
          <VStack space="sm">
            <Skeleton h="$32" w="100%" />
            <VStack space="xs">
              <SkeletonText lines={2} />
              <SkeletonText lines={1} />
              <SkeletonText lines={1} />
            </VStack>
          </VStack>
        </Box>
      ))}
    </VStack>
  );

  return (
    <Box style={[styles.container, {backgroundColor: colors.background}]}>
      <VStack space="lg" flex={1}>
        {/* Header */}
        <VStack space="md">
          <Text size="2xl" fontWeight="bold" color={colors.text}>
            YouTube Integration
          </Text>

          {/* Search Bar */}
          <Input>
            <InputSlot pl="$3">
              <InputIcon as={SearchIcon} />
            </InputSlot>
            <InputInput
              placeholder="Search YouTube videos..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
          </Input>

          <Button onPress={handleSearch} isDisabled={isLoading}>
            <Text color={colors.buttonText}>
              {isLoading ? 'Searching...' : 'Search'}
            </Text>
          </Button>
        </VStack>

        {/* Tabs */}
        <Tab value={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab>
              <TabTitle>Videos</TabTitle>
            </Tab>
            <Tab>
              <TabTitle>Player</TabTitle>
            </Tab>
            <Tab>
              <TabTitle>Upload</TabTitle>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Videos Tab */}
            <TabPanel>
              <ScrollView
                style={styles.scrollView}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    tintColor={colors.primary}
                  />
                }
                showsVerticalScrollIndicator={false}>
                <VStack space="md">
                  {isLoading ? (
                    renderSkeleton()
                  ) : videos.length > 0 ? (
                    videos.map(renderVideoCard)
                  ) : (
                    <Box style={styles.emptyState}>
                      <Text
                        size="md"
                        color={colors.textSecondary}
                        textAlign="center">
                        {searchQuery
                          ? 'No videos found for your search.'
                          : 'No videos available.'}
                      </Text>
                    </Box>
                  )}
                </VStack>
              </ScrollView>
            </TabPanel>

            {/* Player Tab */}
            <TabPanel>
              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}>
                <VStack space="lg">
                  {selectedVideo ? (
                    <YouTubePlayerComponent
                      videoId={selectedVideo.videoId}
                      title={selectedVideo.title}
                      description={selectedVideo.description}
                      height={250}
                    />
                  ) : (
                    <Box style={styles.emptyState}>
                      <Text
                        size="md"
                        color={colors.textSecondary}
                        textAlign="center">
                        Select a video from the Videos tab to play it here.
                      </Text>
                    </Box>
                  )}
                </VStack>
              </ScrollView>
            </TabPanel>

            {/* Upload Tab */}
            <TabPanel>
              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}>
                <YouTubeUploadComponent
                  onUploadComplete={handleUploadComplete}
                  onUploadError={error => {
                    console.error('Upload error:', error);
                  }}
                />
              </ScrollView>
            </TabPanel>
          </TabPanels>
        </Tab>
      </VStack>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  videoCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
});

export default YouTubeScreen;
