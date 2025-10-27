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
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectContent,
  SelectItem,
  SelectItemText,
  Icon,
  ChevronDownIcon,
} from '@/components';
import {useThemeColors} from '@/utils/colors';
import {gifService, GifData} from '@/services/gif-service';
import GifPlayerComponent from '@/components/GifPlayer';

const GifPlayerScreen: React.FC = () => {
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState(0);
  const [gifs, setGifs] = useState<GifData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedGif, setSelectedGif] = useState<GifData | null>(null);

  useEffect(() => {
    loadGifs();
    loadCategories();
  }, []);

  const loadGifs = async () => {
    setIsLoading(true);
    try {
      const gifData = await gifService.getGifs(selectedCategory);
      setGifs(gifData);
    } catch (error) {
      console.error('Error loading GIFs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoryData = await gifService.getCategories();
      setCategories(categoryData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadGifs();
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await gifService.searchGifs(searchQuery.trim());
      setGifs(searchResults.gifs);
    } catch (error) {
      console.error('Error searching GIFs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    setIsLoading(true);
    try {
      const gifData = await gifService.getGifs(category);
      setGifs(gifData);
    } catch (error) {
      console.error('Error loading GIFs by category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadGifs();
    setIsRefreshing(false);
  };

  const handleGifSelect = (gif: GifData) => {
    setSelectedGif(gif);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderGifCard = (gif: GifData) => (
    <Box
      key={gif.id}
      style={[styles.gifCard, {backgroundColor: colors.cardBackground}]}>
      <VStack space="sm">
        <Box style={styles.thumbnailContainer}>
          <GifPlayerComponent
            gifUrl={gif.thumbnail}
            width={300}
            height={200}
            showControls={false}
            autoPlay={false}
          />
        </Box>

        <VStack space="xs">
          <Text
            size="sm"
            fontWeight="semibold"
            color={colors.primaryText}
            numberOfLines={2}>
            {gif.title}
          </Text>
          <Text size="xs" color={colors.secondaryText} numberOfLines={2}>
            {gif.description}
          </Text>
          <HStack space="sm" flexWrap="wrap">
            {gif.tags.slice(0, 3).map((tag, index) => (
              <Box
                key={index}
                style={[
                  styles.tag,
                  {backgroundColor: colors.accentBackground},
                ]}>
                <Text size="xs" color={colors.accentAction}>
                  #{tag}
                </Text>
              </Box>
            ))}
          </HStack>
          <HStack space="sm" justifyContent="space-between">
            <Text size="xs" color={colors.secondaryText}>
              {formatFileSize(gif.fileSize)}
            </Text>
            <Text size="xs" color={colors.secondaryText}>
              {gif.width}x{gif.height}
            </Text>
          </HStack>
        </VStack>

        <HStack space="sm">
          <Button
            size="sm"
            variant="outline"
            onPress={() => handleGifSelect(gif)}
            flex={1}>
            <Text color={colors.accentAction}>Play</Text>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onPress={() => {
              // Copy GIF URL to clipboard or share
              console.log('GIF URL:', gif.url);
            }}
            flex={1}>
            <Text color={colors.accentAction}>Share</Text>
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
          style={[styles.gifCard, {backgroundColor: colors.cardBackground}]}>
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
    <Box
      style={[styles.container, {backgroundColor: colors.primaryBackground}]}>
      <VStack space="lg" flex={1}>
        {/* Header */}
        <VStack space="md">
          <Text size="2xl" fontWeight="bold" color={colors.primaryText}>
            GIF Player
          </Text>

          {/* Search Bar */}
          <Input>
            <InputSlot pl="$3">
              <InputIcon as={SearchIcon} />
            </InputSlot>
            <InputInput
              placeholder="Search GIFs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
          </Input>

          <HStack space="sm">
            <Button onPress={handleSearch} isDisabled={isLoading} flex={1}>
              <Text color={colors.buttonText}>
                {isLoading ? 'Searching...' : 'Search'}
              </Text>
            </Button>

            <Select
              selectedValue={selectedCategory}
              onValueChange={handleCategoryChange}>
              <SelectTrigger variant="outline" size="md" flex={1}>
                <SelectInput placeholder="Category" />
                <SelectIcon mr="$3">
                  <Icon as={ChevronDownIcon} />
                </SelectIcon>
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  <SelectItem label="All Categories" value="" />
                  {categories.map(category => (
                    <SelectItem
                      key={category}
                      label={category}
                      value={category}
                    />
                  ))}
                </SelectContent>
              </SelectPortal>
            </Select>
          </HStack>
        </VStack>

        {/* Tabs */}
        <Tab value={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab>
              <TabTitle>GIFs</TabTitle>
            </Tab>
            <Tab>
              <TabTitle>Player</TabTitle>
            </Tab>
            <Tab>
              <TabTitle>Trending</TabTitle>
            </Tab>
          </TabList>

          <TabPanels>
            {/* GIFs Tab */}
            <TabPanel>
              <ScrollView
                style={styles.scrollView}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    tintColor={colors.accentAction}
                  />
                }
                showsVerticalScrollIndicator={false}>
                <VStack space="md">
                  {isLoading ? (
                    renderSkeleton()
                  ) : gifs.length > 0 ? (
                    gifs.map(renderGifCard)
                  ) : (
                    <Box style={styles.emptyState}>
                      <Text
                        size="md"
                        color={colors.secondaryText}
                        textAlign="center">
                        {searchQuery
                          ? 'No GIFs found for your search.'
                          : 'No GIFs available.'}
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
                  {selectedGif ? (
                    <GifPlayerComponent
                      gifUrl={selectedGif.url}
                      title={selectedGif.title}
                      description={selectedGif.description}
                      width="100%"
                      height={300}
                      showControls={true}
                      autoPlay={true}
                    />
                  ) : (
                    <Box style={styles.emptyState}>
                      <Text
                        size="md"
                        color={colors.secondaryText}
                        textAlign="center">
                        Select a GIF from the GIFs tab to play it here.
                      </Text>
                    </Box>
                  )}
                </VStack>
              </ScrollView>
            </TabPanel>

            {/* Trending Tab */}
            <TabPanel>
              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}>
                <VStack space="md">
                  <Button
                    onPress={async () => {
                      setIsLoading(true);
                      try {
                        const trendingGifs = await gifService.getTrendingGifs();
                        setGifs(trendingGifs);
                      } catch (error) {
                        console.error('Error loading trending GIFs:', error);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    isDisabled={isLoading}>
                    <Text color={colors.buttonText}>
                      {isLoading ? 'Loading...' : 'Load Trending GIFs'}
                    </Text>
                  </Button>

                  {gifs.length > 0 && (
                    <VStack space="md">{gifs.map(renderGifCard)}</VStack>
                  )}
                </VStack>
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
  gifCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  thumbnailContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
});

export default GifPlayerScreen;
