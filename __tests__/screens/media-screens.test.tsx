import './setupScreenMocks';
import React from 'react';
import {fireEvent, waitFor} from '@testing-library/react-native';
import {gifService} from '@/services/gif-service';
import {youtubeService} from '@/services/youtube-service';
import {mockApiService} from '@/services/mock-api';
import {renderScreen} from '../utils/screen-test-utils';
import GifPlayerScreen from '@/screens/GifPlayer';
import MediaDemoScreen from '@/screens/MediaDemo';
import MockTestScreen from '@/screens/MockTest';
import YouTubeScreen from '@/screens/YouTube';
import YouTubeDemoScreen from '@/screens/YouTubeDemo';

describe('Media Screens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GifPlayerScreen', () => {
    it('renders gif player screen without crashing', async () => {
      const {getByText} = renderScreen(GifPlayerScreen);

      await waitFor(() => {
        expect(gifService.getGifs).toHaveBeenCalled();
      });

      expect(getByText('GIF Player')).toBeTruthy();
    });

    it('loads categories on mount', async () => {
      renderScreen(GifPlayerScreen);

      await waitFor(() => {
        expect(gifService.getCategories).toHaveBeenCalled();
      });
    });
  });

  describe('MediaDemoScreen', () => {
    it('renders media demo screen with title', () => {
      const {getByText} = renderScreen(MediaDemoScreen);

      expect(getByText('Media Integration Demo')).toBeTruthy();
    });

    it('is a valid React component', () => {
      expect(MediaDemoScreen).toBeDefined();
      expect(typeof MediaDemoScreen).toBe('function');
    });
  });

  describe('MockTestScreen', () => {
    it('renders mock test screen with test controls', () => {
      const {getByText} = renderScreen(MockTestScreen);

      expect(getByText('Mock API Test Suite')).toBeTruthy();
      expect(getByText('Login')).toBeTruthy();
      expect(getByText('Events')).toBeTruthy();
    });

    it('runs login test when button is pressed', async () => {
      const {getByText} = renderScreen(MockTestScreen);

      fireEvent.press(getByText('Login'));

      await waitFor(() => {
        expect(mockApiService.login).toHaveBeenCalled();
      });
    });

    it('runs get events test when button is pressed', async () => {
      const {getByText} = renderScreen(MockTestScreen);

      fireEvent.press(getByText('Events'));

      await waitFor(() => {
        expect(mockApiService.getEvents).toHaveBeenCalled();
      });
    });
  });

  describe('YouTubeScreen', () => {
    it('renders youtube screen without crashing', async () => {
      const {getByText} = renderScreen(YouTubeScreen);

      await waitFor(() => {
        expect(youtubeService.getVideos).toHaveBeenCalled();
      });

      expect(getByText('YouTube Integration')).toBeTruthy();
    });

    it('is a valid React component', () => {
      expect(YouTubeScreen).toBeDefined();
      expect(typeof YouTubeScreen).toBe('function');
    });
  });

  describe('YouTubeDemoScreen', () => {
    it('renders youtube demo screen with title', () => {
      const {getByText} = renderScreen(YouTubeDemoScreen);

      expect(getByText('YouTube Integration Demo')).toBeTruthy();
      expect(getByText('Video Player')).toBeTruthy();
    });

    it('is a valid React component', () => {
      expect(YouTubeDemoScreen).toBeDefined();
      expect(typeof YouTubeDemoScreen).toBe('function');
    });
  });
});
