import React, {useState, useEffect} from 'react';
import {Alert, ScrollView} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import LottieView from 'lottie-react-native';
import {
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Progress,
  Pressable,
} from '@/components';
import {VIDEO_UPLOAD} from '@/constants';
import {i18n} from '@/services/i18n-service';
import {commonStyles, screenStyles} from '@/utils/styles';
import {useThemeColors} from '@/utils/colors';
import {videoService} from '@/services/video-service';
import {usePermissions} from '@/hooks/usePermissions';

interface VideoUploadScreenProps {
  route: {
    params: {
      eventId: string;
      eventTitle: string;
    };
  };
}

// Navigation-compatible component
interface VideoUploadNavProps {
  route: {
    params: {
      eventId: string;
      eventTitle: string;
    };
  };
  navigation: any;
}

const VideoUploadScreen: React.FC<VideoUploadNavProps> = ({route}) => {
  const navigation = useNavigation();
  const colors = useThemeColors();
  const {eventId, eventTitle} = route?.params || {eventId: '', eventTitle: ''};
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [guidelines, setGuidelines] = useState<any>(null);

  useEffect(() => {
    loadGuidelines();
  }, []);

  const loadGuidelines = async () => {
    try {
      const guidelinesData = await videoService.getUploadGuidelines();
      setGuidelines(guidelinesData);
    } catch (error) {
      console.error('Error loading guidelines:', error);
    }
  };

  const {requestVideoUploadPermissions} = usePermissions();

  const handleSelectVideo = async () => {
    const hasPermission = await requestVideoUploadPermissions();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Photo library and storage permissions are required to select videos.',
      );
      return;
    }

    const options = {
      mediaType: 'video' as const,
      maxWidth: 1280,
      maxHeight: 720,
      videoQuality: 'medium' as const,
      includeBase64: false,
    };

    try {
      const result = await launchImageLibrary(options);

      if (result.assets && result.assets[0]) {
        const video = result.assets[0];

        // Validate video
        if (
          video.duration &&
          video.duration < VIDEO_UPLOAD.MIN_DURATION * 1000
        ) {
          Alert.alert(
            'Video Too Short',
            `Video must be at least ${VIDEO_UPLOAD.MIN_DURATION} seconds long.`,
          );
          return;
        }

        if (
          video.duration &&
          video.duration > VIDEO_UPLOAD.MAX_DURATION * 1000
        ) {
          Alert.alert(
            'Video Too Long',
            `Video must be no longer than ${VIDEO_UPLOAD.MAX_DURATION} seconds.`,
          );
          return;
        }

        setSelectedVideo(video);
      }
    } catch (error) {
      console.error('Error selecting video:', error);
      Alert.alert('Error', 'Failed to select video. Please try again.');
    }
  };

  const handleUploadVideo = async () => {
    if (!selectedVideo) {
      Alert.alert('No Video', 'Please select or record a video first.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const videoFile = {
        uri: selectedVideo.uri,
        type: 'video/mp4',
        name: selectedVideo.fileName || `video_${Date.now()}.mp4`,
      };

      await videoService.uploadVideo({
        eventId,
        videoFile,
        onProgress: progress => {
          setUploadProgress(progress);
        },
      });

      Alert.alert(
        'Upload Successful',
        'Your video has been uploaded successfully! It will be reviewed by our team.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ],
      );
    } catch (error) {
      console.error('Error uploading video:', error);
      Alert.alert('Upload Failed', 'Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <VStack
      flex={1}
      style={[
        commonStyles.container,
        {backgroundColor: colors.primaryBackground},
      ]}>
      {/* Custom Header with Back Button */}
      <HStack
        alignItems="center"
        justifyContent="space-between"
        p="$4"
        pt="$12"
        style={{backgroundColor: colors.primaryBackground}}>
        <Pressable
          onPress={() => navigation.goBack()}
          p="$2"
          borderRadius="$md"
          style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
          <Text style={commonStyles.textWhite} fontSize="$lg">
            ←
          </Text>
        </Pressable>
        <Text style={commonStyles.textTitle} flex={1} textAlign="center">
          {eventTitle}
        </Text>
        <Box w="$10" />
      </HStack>

      <ScrollView style={{flex: 1}}>
        <VStack space="lg" p="$4">
          {/* Header */}
          <VStack space="sm" alignItems="center">
            <LottieView
              source={require('@/assets/lottie/specialTalent.json')}
              autoPlay
              loop
              style={commonStyles.lottie}
            />
            <Text style={commonStyles.textTitle}>
              {i18n.t('videoUpload.title')}
            </Text>
            <Text style={commonStyles.textSubtitle}>
              {i18n.t('videoUpload.uploadTalentVideo', {eventTitle})}
            </Text>
          </VStack>

          {/* Guidelines */}
          {guidelines && (
            <Box style={screenStyles.videoUpload.guidelinesCard}>
              <Text style={screenStyles.videoUpload.guidelinesTitle as any}>
                {i18n.t('videoUpload.uploadGuidelines')}
              </Text>
              <VStack space="sm">
                <Text style={screenStyles.videoUpload.guidelineText}>
                  • {i18n.t('videoUpload.duration')}: {guidelines.minDuration}s
                  - {guidelines.maxDuration}s
                </Text>
                <Text style={screenStyles.videoUpload.guidelineText}>
                  • {i18n.t('videoUpload.maxFileSize')}:{' '}
                  {Math.round(guidelines.maxFileSize / (1024 * 1024))}MB
                </Text>
                <Text style={screenStyles.videoUpload.guidelineText}>
                  • {i18n.t('videoUpload.supportedFormats')}:{' '}
                  {guidelines.supportedFormats.join(', ')}
                </Text>
                <Text style={screenStyles.videoUpload.guidelineText}>
                  • {i18n.t('videoUpload.galleryOnly')}
                </Text>
                {guidelines.tips.map((tip: string, index: number) => (
                  <Text
                    key={index}
                    style={screenStyles.videoUpload.guidelineText}>
                    • {tip}
                  </Text>
                ))}
              </VStack>
            </Box>
          )}

          {/* Video Selection */}
          <VStack space="md">
            <Text style={commonStyles.textHeading}>
              {i18n.t('videoUpload.selectVideo')}
            </Text>

            <Pressable
              onPress={handleSelectVideo}
              style={screenStyles.videoUpload.selectVideoCard as any}>
              <VStack space="sm" alignItems="center">
                <LottieView
                  source={require('@/assets/lottie/buttonDots.json')}
                  autoPlay
                  loop
                  style={screenStyles.videoUpload.selectVideoIcon}
                />
                <Text style={screenStyles.videoUpload.selectVideoTitle as any}>
                  {i18n.t('videoUpload.chooseFromGallery')}
                </Text>
                <Text
                  style={screenStyles.videoUpload.selectVideoSubtitle as any}>
                  {i18n.t('videoUpload.selectFromGallery')}
                </Text>
              </VStack>
            </Pressable>
          </VStack>

          {/* Selected Video */}
          {selectedVideo && (
            <Box style={screenStyles.videoUpload.selectedVideoCard}>
              <Text style={screenStyles.videoUpload.selectedVideoTitle as any}>
                {i18n.t('videoUpload.selectedVideo')}
              </Text>
              <VStack space="sm">
                <Text style={screenStyles.videoUpload.videoInfo}>
                  Duration: {formatDuration(selectedVideo.duration / 1000)}
                </Text>
                <Text style={screenStyles.videoUpload.videoInfo}>
                  File: {selectedVideo.fileName || 'video.mp4'}
                </Text>
              </VStack>
            </Box>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <Box style={commonStyles.progressContainer}>
              <Text style={commonStyles.progressTitle}>
                {i18n.t('videoUpload.uploadingVideo')}
              </Text>
              <Progress value={uploadProgress} size="lg" />
              <Text style={commonStyles.progressText}>
                {Math.round(uploadProgress)}%
              </Text>
            </Box>
          )}

          {/* Upload Button */}
          {selectedVideo && !isUploading && (
            <Button
              onPress={handleUploadVideo}
              style={screenStyles.videoUpload.uploadButton}>
              {i18n.t('videoUpload.uploadVideo')}
            </Button>
          )}

          {/* Warning */}
          <Box style={commonStyles.warningCard}>
            <Text style={commonStyles.warningTitle}>
              {i18n.t('videoUpload.important')}
            </Text>
            <Text style={commonStyles.warningText}>
              {i18n.t('videoUpload.durationRequirement')}
            </Text>
            <Text style={commonStyles.warningText}>
              {i18n.t('videoUpload.immutableWarning')}
            </Text>
            <Text style={commonStyles.warningText}>
              {i18n.t('videoUpload.satisfactionWarning')}
            </Text>
          </Box>
        </VStack>
      </ScrollView>
    </VStack>
  );
};

export default VideoUploadScreen;
