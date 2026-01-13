import { apiService } from './api';
import { API_ENDPOINTS } from '@/constants';
import { MockWrapperService } from './mock-wrapper';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  publishedAt: string;
  viewCount: number;
  channelTitle: string;
  videoId: string; // YouTube video ID for player
}

export interface YouTubeUploadRequest {
  videoFile: any; // File object
  title: string;
  description: string;
  tags?: string[];
  categoryId?: string;
  privacyStatus?: 'private' | 'public' | 'unlisted';
  onProgress?: (progress: number) => void;
}

export interface YouTubeUploadResponse {
  success: boolean;
  videoId?: string;
  videoUrl?: string;
  message?: string;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoCount: number;
  videos: YouTubeVideo[];
}

class YouTubeService {
  // Get YouTube videos for events or specific categories
  async getVideos(category?: string, limit: number = 10): Promise<YouTubeVideo[]> {
    try {
      if (MockWrapperService.isMockMode()) {
        // Return mock YouTube videos
        return this.getMockVideos(category, limit);
      }

      // Real API implementation
      const response = await apiService.get<YouTubeVideo[]>(
        `${API_ENDPOINTS.YOUTUBE?.VIDEOS || '/api/youtube/videos'}?category=${category || ''}&limit=${limit}`
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to fetch YouTube videos');
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      // Return mock data as fallback
      return this.getMockVideos(category, limit);
    }
  }

  // Get specific video by ID
  async getVideoById(videoId: string): Promise<YouTubeVideo | null> {
    try {
      if (MockWrapperService.isMockMode()) {
        return this.getMockVideoById(videoId);
      }

      const response = await apiService.get<YouTubeVideo>(
        `${API_ENDPOINTS.YOUTUBE?.VIDEO_DETAILS || '/api/youtube/video'}/${videoId}`
      );

      if (response.success && response.data) {
        return response.data;
      }

      return null;
    } catch (error) {
      console.error('Error fetching YouTube video:', error);
      return this.getMockVideoById(videoId);
    }
  }

  // Search YouTube videos
  async searchVideos(query: string, limit: number = 10): Promise<YouTubeVideo[]> {
    try {
      if (MockWrapperService.isMockMode()) {
        return this.getMockSearchResults(query, limit);
      }

      const response = await apiService.get<YouTubeVideo[]>(
        `${API_ENDPOINTS.YOUTUBE?.SEARCH || '/api/youtube/search'}?q=${encodeURIComponent(query)}&limit=${limit}`
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to search YouTube videos');
    } catch (error) {
      console.error('Error searching YouTube videos:', error);
      return this.getMockSearchResults(query, limit);
    }
  }

  // Get playlists
  async getPlaylists(category?: string): Promise<YouTubePlaylist[]> {
    try {
      if (MockWrapperService.isMockMode()) {
        return this.getMockPlaylists(category);
      }

      const response = await apiService.get<YouTubePlaylist[]>(
        `${API_ENDPOINTS.YOUTUBE?.PLAYLISTS || '/api/youtube/playlists'}?category=${category || ''}`
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to fetch playlists');
    } catch (error) {
      console.error('Error fetching playlists:', error);
      return this.getMockPlaylists(category);
    }
  }

  // Extract YouTube video ID from URL
  extractVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2] && match[2].length === 11) ? match[2] : null;
  }

  // Upload video to YouTube
  async uploadVideo(data: YouTubeUploadRequest): Promise<YouTubeUploadResponse> {
    try {
      if (MockWrapperService.isMockMode()) {
        return this.mockVideoUpload(data);
      }

      // Validate video file
      this.validateVideoFile(data.videoFile);

      // Prepare form data for upload
      const formData = new FormData();
      formData.append('videoFile', data.videoFile);
      formData.append('title', data.title);
      formData.append('description', data.description);
      if (data.tags) {formData.append('tags', JSON.stringify(data.tags));}
      if (data.categoryId) {formData.append('categoryId', data.categoryId);}
      formData.append('privacyStatus', data.privacyStatus || 'private');

      const response = await apiService.uploadFile<YouTubeUploadResponse>(
        `${API_ENDPOINTS.YOUTUBE?.UPLOAD || '/api/youtube/upload'}`,
        formData,
        data.onProgress
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to upload video to YouTube');
    } catch (error) {
      console.error('Error uploading video to YouTube:', error);
      return {
        success: false,
        message: 'Failed to upload video. Please try again.',
      };
    }
  }

  // Get upload status
  async getUploadStatus(videoId: string): Promise<{
    status: 'uploading' | 'processing' | 'completed' | 'failed';
    progress?: number;
    message?: string;
  }> {
    try {
      if (MockWrapperService.isMockMode()) {
        return {
          status: 'completed',
          progress: 100,
          message: 'Video uploaded successfully',
        };
      }

      const response = await apiService.get<{
        status: 'uploading' | 'processing' | 'completed' | 'failed';
        progress?: number;
        message?: string;
      }>(`${API_ENDPOINTS.YOUTUBE?.UPLOAD_STATUS || '/api/youtube/upload-status'}/${videoId}`);

      if (response.success && response.data) {
        return response.data;
      }

      return { status: 'failed', message: 'Unable to get upload status' };
    } catch (error) {
      console.error('Error getting upload status:', error);
      return { status: 'failed', message: 'Error checking upload status' };
    }
  }

  // Generate YouTube thumbnail URL
  getThumbnailUrl(videoId: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'medium'): string {
    return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
  }

  // Generate YouTube video URL
  getVideoUrl(videoId: string): string {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  // Generate YouTube embed URL
  getEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // Validate video file
  private validateVideoFile(videoFile: any): void {
    if (!videoFile) {
      throw new Error('Video file is required');
    }

    // Check file size (max 2GB for YouTube)
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB in bytes
    if (videoFile.size && videoFile.size > maxSize) {
      throw new Error('Video file is too large. Maximum size is 2GB.');
    }

    // Check file type
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'];
    if (videoFile.type && !allowedTypes.includes(videoFile.type)) {
      throw new Error('Unsupported video format. Please use MP4, AVI, MOV, WMV, FLV, or WebM.');
    }
  }

  // Mock video upload
  private async mockVideoUpload(data: YouTubeUploadRequest): Promise<YouTubeUploadResponse> {
    // Simulate upload progress
    if (data.onProgress) {
      const simulateProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          data.onProgress!(progress);
          if (progress >= 100) {
            clearInterval(interval);
          }
        }, 200);
      };
      simulateProgress();
    }

    // Simulate network delay
    await new Promise<void>(resolve => setTimeout(resolve, 2000));

    // Generate mock video ID
    const mockVideoId = 'mock_' + Math.random().toString(36).substr(2, 9);

    return {
      success: true,
      videoId: mockVideoId,
      videoUrl: `https://www.youtube.com/watch?v=${mockVideoId}`,
      message: 'Video uploaded successfully to YouTube',
    };
  }

  // Mock data methods
  private getMockVideos(category?: string, limit: number = 10): YouTubeVideo[] {
    const mockVideos: YouTubeVideo[] = [
      {
        id: '1',
        videoId: 'dQw4w9WgXcQ',
        title: 'Sample Educational Video 1',
        description: 'This is a sample educational video for testing purposes.',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        duration: '3:32',
        publishedAt: '2024-01-15T10:00:00Z',
        viewCount: 1500000,
        channelTitle: 'Education Channel',
      },
      {
        id: '2',
        videoId: 'jNQXAC9IVRw',
        title: 'Sample Educational Video 2',
        description: 'Another sample educational video with different content.',
        thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/mqdefault.jpg',
        duration: '4:15',
        publishedAt: '2024-01-20T14:30:00Z',
        viewCount: 850000,
        channelTitle: 'Learning Hub',
      },
      {
        id: '3',
        videoId: 'M7lc1UVf-VE',
        title: 'Sample Educational Video 3',
        description: 'A comprehensive educational video covering advanced topics.',
        thumbnail: 'https://img.youtube.com/vi/M7lc1UVf-VE/mqdefault.jpg',
        duration: '5:42',
        publishedAt: '2024-02-01T09:15:00Z',
        viewCount: 2200000,
        channelTitle: 'Knowledge Base',
      },
    ];

    return mockVideos.slice(0, limit);
  }

  private getMockVideoById(videoId: string): YouTubeVideo | null {
    const videos = this.getMockVideos();
    return videos.find(video => video.videoId === videoId) || null;
  }

  private getMockSearchResults(query: string, limit: number = 10): YouTubeVideo[] {
    const allVideos = this.getMockVideos();
    return allVideos
      .filter(video =>
        video.title.toLowerCase().includes(query.toLowerCase()) ||
        video.description.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, limit);
  }

  private getMockPlaylists(category?: string): YouTubePlaylist[] {
    return [
      {
        id: '1',
        title: 'Educational Videos Playlist',
        description: 'A collection of educational videos for students',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        videoCount: 15,
        videos: this.getMockVideos('education', 5),
      },
      {
        id: '2',
        title: 'Tutorial Series',
        description: 'Step-by-step tutorial videos',
        thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/mqdefault.jpg',
        videoCount: 8,
        videos: this.getMockVideos('tutorial', 3),
      },
    ];
  }
}

export const youtubeService = new YouTubeService();
