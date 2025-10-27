import React, {useState} from 'react';
import {Alert, StyleSheet} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {
  Box,
  Text,
  Button,
  VStack,
  HStack,
  Input,
  TextArea,
  Progress,
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
  SelectItemText,
  Icon,
  ChevronDownIcon,
} from '@/components';
import {useThemeColors} from '@/utils/colors';
import {youtubeService, YouTubeUploadRequest} from '@/services/youtube-service';

interface YouTubeUploadProps {
  onUploadComplete?: (videoId: string, videoUrl: string) => void;
  onUploadError?: (error: string) => void;
}

const YouTubeUploadComponent: React.FC<YouTubeUploadProps> = ({
  onUploadComplete,
  onUploadError,
}) => {
  const colors = useThemeColors();
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [privacyStatus, setPrivacyStatus] = useState<
    'private' | 'public' | 'unlisted'
  >('private');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSelectVideo = async () => {
    const options = {
      mediaType: 'video' as const,
      maxWidth: 1920,
      maxHeight: 1080,
      videoQuality: 'high' as const,
      includeBase64: false,
    };

    try {
      const result = await launchImageLibrary(options);

      if (result.assets && result.assets[0]) {
        const video = result.assets[0];

        // Validate video duration (YouTube allows up to 12 hours)
        if (video.duration && video.duration > 12 * 60 * 60 * 1000) {
          Alert.alert(
            'Video Too Long',
            'Video must be no longer than 12 hours.',
          );
          return;
        }

        setSelectedVideo(video);

        // Auto-fill title if empty
        if (!title && video.fileName) {
          setTitle(video.fileName.replace(/\.[^/.]+$/, '')); // Remove extension
        }
      }
    } catch (error) {
      console.error('Error selecting video:', error);
      Alert.alert('Error', 'Failed to select video. Please try again.');
    }
  };

  const handleUpload = async () => {
    if (!selectedVideo) {
      Alert.alert('No Video Selected', 'Please select a video to upload.');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Title Required', 'Please enter a title for your video.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadData: YouTubeUploadRequest = {
        videoFile: selectedVideo,
        title: title.trim(),
        description: description.trim(),
        tags: tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0),
        privacyStatus,
        onProgress: progress => {
          setUploadProgress(progress);
        },
      };

      const result = await youtubeService.uploadVideo(uploadData);

      if (result.success && result.videoId) {
        Alert.alert(
          'Upload Successful',
          `Your video has been uploaded to YouTube!\n\nVideo URL: ${result.videoUrl}`,
          [
            {
              text: 'OK',
              onPress: () => {
                onUploadComplete?.(result.videoId!, result.videoUrl!);
                resetForm();
              },
            },
          ],
        );
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage =
        error.message || 'Failed to upload video. Please try again.';
      Alert.alert('Upload Failed', errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setSelectedVideo(null);
    setTitle('');
    setDescription('');
    setTags('');
    setPrivacyStatus('private');
    setUploadProgress(0);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <VStack space="lg" style={styles.container}>
      <Text size="xl" fontWeight="bold" color={colors.text}>
        Upload to YouTube
      </Text>

      {/* Video Selection */}
      <VStack space="md">
        <Text size="md" fontWeight="semibold" color={colors.text}>
          Select Video
        </Text>

        {selectedVideo ? (
          <Box
            style={[
              styles.videoInfo,
              {backgroundColor: colors.backgroundSecondary},
            ]}>
            <VStack space="sm">
              <Text size="sm" color={colors.text}>
                <Text fontWeight="semibold">File:</Text>{' '}
                {selectedVideo.fileName || 'Unknown'}
              </Text>
              <Text size="sm" color={colors.text}>
                <Text fontWeight="semibold">Size:</Text>{' '}
                {formatFileSize(selectedVideo.fileSize || 0)}
              </Text>
              <Text size="sm" color={colors.text}>
                <Text fontWeight="semibold">Duration:</Text>{' '}
                {formatDuration(selectedVideo.duration || 0)}
              </Text>
              <Button
                size="sm"
                variant="outline"
                onPress={() => setSelectedVideo(null)}>
                <Text color={colors.primary}>Change Video</Text>
              </Button>
            </VStack>
          </Box>
        ) : (
          <Button
            variant="outline"
            onPress={handleSelectVideo}
            isDisabled={isUploading}>
            <Text color={colors.primary}>Select Video File</Text>
          </Button>
        )}
      </VStack>

      {/* Video Details */}
      <VStack space="md">
        <Text size="md" fontWeight="semibold" color={colors.text}>
          Video Details
        </Text>

        <Input>
          <Input.Input
            placeholder="Enter video title"
            value={title}
            onChangeText={setTitle}
            isDisabled={isUploading}
          />
        </Input>

        <TextArea>
          <TextArea.Input
            placeholder="Enter video description"
            value={description}
            onChangeText={setDescription}
            isDisabled={isUploading}
            multiline
            numberOfLines={4}
          />
        </TextArea>

        <Input>
          <Input.Input
            placeholder="Enter tags (comma separated)"
            value={tags}
            onChangeText={setTags}
            isDisabled={isUploading}
          />
        </Input>

        <VStack space="sm">
          <Text size="sm" color={colors.text}>
            Privacy Status
          </Text>
          <Select
            selectedValue={privacyStatus}
            onValueChange={value => setPrivacyStatus(value as any)}
            isDisabled={isUploading}>
            <SelectTrigger variant="outline" size="md">
              <SelectInput placeholder="Select privacy status" />
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
                <SelectItem label="Private" value="private" />
                <SelectItem label="Public" value="public" />
                <SelectItem label="Unlisted" value="unlisted" />
              </SelectContent>
            </SelectPortal>
          </Select>
        </VStack>
      </VStack>

      {/* Upload Progress */}
      {isUploading && (
        <VStack space="sm">
          <HStack justifyContent="space-between">
            <Text size="sm" color={colors.text}>
              Uploading to YouTube...
            </Text>
            <Text size="sm" color={colors.text}>
              {uploadProgress}%
            </Text>
          </HStack>
          <Progress value={uploadProgress} size="sm" />
        </VStack>
      )}

      {/* Upload Button */}
      <Button
        onPress={handleUpload}
        isDisabled={!selectedVideo || !title.trim() || isUploading}
        isLoading={isUploading}
        size="lg">
        <Text color={colors.buttonText}>
          {isUploading ? 'Uploading...' : 'Upload to YouTube'}
        </Text>
      </Button>
    </VStack>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  videoInfo: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
});

export default YouTubeUploadComponent;
