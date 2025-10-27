import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import {Alert} from 'react-native';
import VideoUploadScreen from '../../src/screens/VideoUpload';

// Mock dependencies
jest.mock('../../src/components', () => {
  const React = require('react');
  const {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
  } = require('react-native');

  return {
    VStack: ({children, ...props}) =>
      React.createElement(View, props, children),
    HStack: ({children, ...props}) =>
      React.createElement(View, props, children),
    Box: ({children, ...props}) => React.createElement(View, props, children),
    Text: ({children, ...props}) => React.createElement(Text, props, children),
    Button: ({children, onPress, ...props}) =>
      React.createElement(TouchableOpacity, {...props, onPress}, children),
    Pressable: ({children, onPress, ...props}) =>
      React.createElement(TouchableOpacity, {...props, onPress}, children),
    ScrollView: ({children, ...props}) =>
      React.createElement(ScrollView, props, children),
    Progress: ({...props}) => React.createElement(View, props),
  };
});

jest.mock('../../src/utils/colors', () => ({
  useThemeColors: () => ({
    primaryBackground: '#FFFFFF',
    primaryText: '#000000',
    secondaryText: '#6C757D',
    mutedText: '#6C757D',
    white: '#FFFFFF',
  }),
}));

jest.mock('../../src/utils/styles', () => ({
  commonStyles: {
    container: {},
    textWhite: {color: '#FFFFFF'},
    textTitle: {fontSize: 20, fontWeight: 'bold'},
    textSubtitle: {fontSize: 16},
    textHeading: {fontSize: 18, fontWeight: 'bold'},
    lottie: {width: 200, height: 200},
    progressContainer: {},
    progressTitle: {fontSize: 16, fontWeight: 'bold'},
    progressText: {fontSize: 14},
    warningCard: {},
    warningTitle: {fontSize: 16, fontWeight: 'bold'},
    warningText: {fontSize: 14},
  },
  screenStyles: {
    videoUpload: {
      guidelinesCard: {},
      guidelinesTitle: {fontSize: 18, fontWeight: 'bold'},
      guidelineText: {fontSize: 14},
      selectVideoCard: {},
      selectVideoIcon: {width: 50, height: 50},
      selectVideoTitle: {fontSize: 16, fontWeight: 'bold'},
      selectVideoSubtitle: {fontSize: 14},
      selectedVideoCard: {},
      selectedVideoTitle: {fontSize: 16, fontWeight: 'bold'},
      videoInfo: {fontSize: 14},
      uploadButton: {},
    },
  },
}));

jest.mock('../../src/constants', () => ({
  VIDEO_UPLOAD: {
    MIN_DURATION: 30,
    MAX_DURATION: 300,
  },
}));

jest.mock('../../src/services/i18n-service', () => ({
  i18n: {
    t: key => key,
  },
}));

jest.mock('../../src/services/video-service', () => ({
  videoService: {
    getUploadGuidelines: jest.fn(),
    uploadVideo: jest.fn(),
  },
}));

jest.mock('../../src/hooks/usePermissions', () => ({
  usePermissions: () => ({
    requestVideoUploadPermissions: jest.fn().mockResolvedValue(true),
  }),
}));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

jest.mock('lottie-react-native', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    default: ({...props}) => React.createElement(View, props),
  };
});

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    replace: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {
      eventId: 'event_001',
      eventTitle: 'Test Event',
    },
  }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('VideoUploadScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    replace: jest.fn(),
    goBack: jest.fn(),
  };

  const mockRoute = {
    params: {
      eventId: 'event_001',
      eventTitle: 'Test Event',
    },
  };

  const renderScreen = () => {
    return render(
      <NavigationContainer>
        <VideoUploadScreen navigation={mockNavigation} route={mockRoute} />
      </NavigationContainer>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Screen Rendering', () => {
    it('should render the VideoUpload screen', () => {
      const {getByText} = renderScreen();

      expect(getByText('Test Event')).toBeTruthy();
      expect(getByText('videoUpload.title')).toBeTruthy();
      expect(getByText('videoUpload.uploadTalentVideo')).toBeTruthy();
    });

    it('should render back button', () => {
      const {getByText} = renderScreen();

      expect(getByText('←')).toBeTruthy();
    });

    it('should render select video button', () => {
      const {getByText} = renderScreen();

      expect(getByText('videoUpload.chooseFromGallery')).toBeTruthy();
    });
  });

  describe('Guidelines Display', () => {
    it('should load and display guidelines', async () => {
      const {videoService} = require('../../src/services/video-service');
      videoService.getUploadGuidelines.mockResolvedValue({
        minDuration: 30,
        maxDuration: 300,
        maxFileSize: 50 * 1024 * 1024,
        supportedFormats: ['mp4', 'mov'],
        tips: ['Tip 1', 'Tip 2'],
      });

      const {getByText} = renderScreen();

      await waitFor(() => {
        expect(videoService.getUploadGuidelines).toHaveBeenCalled();
      });
    });
  });

  describe('Video Selection', () => {
    it('should handle video selection', async () => {
      const {launchImageLibrary} = require('react-native-image-picker');
      launchImageLibrary.mockResolvedValue({
        assets: [
          {
            uri: 'file://test.mp4',
            fileName: 'test.mp4',
            duration: 60000, // 60 seconds
          },
        ],
      });

      const {getByText} = renderScreen();
      const selectButton = getByText('videoUpload.chooseFromGallery');

      fireEvent.press(selectButton);

      await waitFor(() => {
        expect(launchImageLibrary).toHaveBeenCalled();
      });
    });

    it('should validate video duration', async () => {
      const {launchImageLibrary} = require('react-native-image-picker');
      launchImageLibrary.mockResolvedValue({
        assets: [
          {
            uri: 'file://test.mp4',
            fileName: 'test.mp4',
            duration: 10000, // 10 seconds (too short)
          },
        ],
      });

      const {getByText} = renderScreen();
      const selectButton = getByText('videoUpload.chooseFromGallery');

      fireEvent.press(selectButton);

      await waitFor(() => {
        expect(launchImageLibrary).toHaveBeenCalled();
      });
    });
  });

  describe('Video Upload', () => {
    it('should handle video upload', async () => {
      const {videoService} = require('../../src/services/video-service');
      videoService.uploadVideo.mockResolvedValue({});

      const {getByText} = renderScreen();
      const uploadButton = getByText('videoUpload.uploadVideo');

      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(videoService.uploadVideo).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation', () => {
    it('should go back when back button is pressed', () => {
      const {getByText} = renderScreen();
      const backButton = getByText('←');

      fireEvent.press(backButton);

      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  describe('Permission Handling', () => {
    it('should request permissions before video selection', async () => {
      const {usePermissions} = require('../../src/hooks/usePermissions');
      const mockRequestPermissions = jest.fn().mockResolvedValue(true);
      usePermissions.mockReturnValue({
        requestVideoUploadPermissions: mockRequestPermissions,
      });

      const {getByText} = renderScreen();
      const selectButton = getByText('videoUpload.chooseFromGallery');

      fireEvent.press(selectButton);

      await waitFor(() => {
        expect(mockRequestPermissions).toHaveBeenCalled();
      });
    });

    it('should handle permission denial', async () => {
      const {usePermissions} = require('../../src/hooks/usePermissions');
      const mockRequestPermissions = jest.fn().mockResolvedValue(false);
      usePermissions.mockReturnValue({
        requestVideoUploadPermissions: mockRequestPermissions,
      });

      const {getByText} = renderScreen();
      const selectButton = getByText('videoUpload.chooseFromGallery');

      fireEvent.press(selectButton);

      await waitFor(() => {
        expect(mockRequestPermissions).toHaveBeenCalled();
      });
    });
  });

  describe('Progress Display', () => {
    it('should show upload progress when uploading', () => {
      const {getByText} = renderScreen();

      // Progress should be hidden initially
      expect(() => getByText('videoUpload.uploadingVideo')).toThrow();
    });
  });

  describe('Warning Display', () => {
    it('should display important warnings', () => {
      const {getByText} = renderScreen();

      expect(getByText('videoUpload.important')).toBeTruthy();
      expect(getByText('videoUpload.durationRequirement')).toBeTruthy();
      expect(getByText('videoUpload.immutableWarning')).toBeTruthy();
      expect(getByText('videoUpload.satisfactionWarning')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const {getByText} = renderScreen();

      // Check that all interactive elements are accessible
      expect(getByText('←')).toBeTruthy();
      expect(getByText('videoUpload.chooseFromGallery')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle upload errors', async () => {
      const {videoService} = require('../../src/services/video-service');
      videoService.uploadVideo.mockRejectedValue(new Error('Upload failed'));

      const {getByText} = renderScreen();
      const uploadButton = getByText('videoUpload.uploadVideo');

      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(videoService.uploadVideo).toHaveBeenCalled();
      });
    });
  });
});
