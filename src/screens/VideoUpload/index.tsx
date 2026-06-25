import React, {useState, useEffect} from 'react';
import {Alert, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import {ImagePlus} from 'lucide-react-native';
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
import {subscriptionService} from '@/services/subscription-service';
import {evaluateEventUploadEligibility} from '@/utils/event-upload-eligibility';
import {usePermissions} from '@/hooks/usePermissions';
import {useIsMounted} from '@/hooks';
import {useUser} from '@/stores';
import {EventGifImage} from '@/components/EventGifImage';
import {getEventIcon} from '@/utils/event-icons';

const SUBSCRIPTION_REQUIRED_MESSAGE =
  'This feature is only for subscribed students. Subscribe to upload videos for events.';

interface VideoUploadNavProps {
  route: {
    params: {
      eventId: string;
      eventTitle: string;
      iconId?: string;
      eventGifUrl?: string;
      isActive?: boolean;
      canUpload?: boolean;
      startDate?: string;
      endDate?: string;
      uploadStartDate?: string;
      uploadEndDate?: string;
    };
  };
  navigation: any;
}

const VideoUploadScreen: React.FC<VideoUploadNavProps> = ({route}) => {
  const navigation = useNavigation<any>();
  const colors = useThemeColors();
  const isMounted = useIsMounted();
  const user = useUser();
  const {
    eventId,
    eventTitle,
    iconId,
    eventGifUrl,
    isActive,
    canUpload,
    startDate,
    endDate,
    uploadStartDate,
    uploadEndDate,
  } = route?.params || {
    eventId: '',
    eventTitle: '',
  };
  const EventIcon = getEventIcon(iconId ?? eventId);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [guidelines, setGuidelines] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;

    const loadGuidelines = async () => {
      try {
        const guidelinesData = await videoService.getUploadGuidelines();
        if (!cancelled) {
          setGuidelines(guidelinesData);
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Error loading guidelines:', error);
        }
      }
    };

    loadGuidelines();
    return () => {
      cancelled = true;
    };
  }, []);

  const {requestVideoUploadPermissions} = usePermissions();

  const handleSelectVideo = async () => {
    const eligibility = evaluateEventUploadEligibility({
      isActive,
      canUpload,
      startDate,
      endDate,
      uploadStartDate,
      uploadEndDate,
    });

    if (!eligibility.allowed) {
      Alert.alert(
        'Upload unavailable',
        eligibility.message ?? 'This event is not accepting uploads right now.',
      );
      return;
    }

    const subscribed = await subscriptionService.isStudentSubscribed(user);
    if (!subscribed) {
      Alert.alert('Subscription required', SUBSCRIPTION_REQUIRED_MESSAGE, [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Subscription'),
        },
      ]);
      return;
    }

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
      if (!isMounted.current) {
        return;
      }

      if (result.assets && result.assets[0]) {
        const video = result.assets[0];

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
      if (!isMounted.current) {
        return;
      }
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
          if (isMounted.current) {
            setUploadProgress(progress);
          }
        },
      });

      if (!isMounted.current) {
        return;
      }

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
      if (!isMounted.current) {
        return;
      }
      console.error('Error uploading video:', error);
      Alert.alert('Upload Failed', 'Failed to upload video. Please try again.');
    } finally {
      if (isMounted.current) {
        setIsUploading(false);
        setUploadProgress(0);
      }
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
          style={{
            backgroundColor: colors.border || 'rgba(0,0,0,0.08)',
          }}>
          <Text
            style={{color: colors.primaryText, fontSize: 18}}
            fontSize="$lg">
            ←
          </Text>
        </Pressable>
        <Text
          style={{
            color: colors.primaryText,
            fontSize: 20,
            fontWeight: 'bold',
            flex: 1,
            textAlign: 'center',
          }}>
          {eventTitle || 'Video Upload'}
        </Text>
        <Box w="$10" />
      </HStack>

      <ScrollView style={{flex: 1}}>
        <VStack space="lg" p="$4">
          <VStack space="sm" alignItems="center">
            <EventGifImage
              gifUrl={eventGifUrl ?? null}
              FallbackIcon={EventIcon}
              width={120}
              height={120}
              color={colors.accentAction}
              backgroundColor={colors.accentBackground}
              borderRadius={16}
            />
            <Text style={commonStyles.textTitle}>
              {i18n.t('videoUpload.title')}
            </Text>
            <Text style={commonStyles.textSubtitle}>
              {i18n.t('videoUpload.uploadTalentVideo', {eventTitle})}
            </Text>
          </VStack>

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

          <VStack space="md">
            <Text style={commonStyles.textHeading}>
              {i18n.t('videoUpload.selectVideo')}
            </Text>

            <Pressable
              onPress={handleSelectVideo}
              style={screenStyles.videoUpload.selectVideoCard as any}>
              <VStack space="sm" alignItems="center">
                <ImagePlus
                  size={48}
                  color={colors.accentAction}
                  strokeWidth={1.75}
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

          {selectedVideo && !isUploading && (
            <Button
              onPress={handleUploadVideo}
              style={screenStyles.videoUpload.uploadButton}>
              {i18n.t('videoUpload.uploadVideo')}
            </Button>
          )}

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
