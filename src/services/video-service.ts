import { apiService } from './api';
import { VideoSubmission } from '@/types';
import { VIDEO_UPLOAD } from '@/constants';
import { API_ENDPOINTS } from '@/constants';
import { MockWrapperService } from './mock-wrapper';

export interface VideoUploadRequest {
  eventId: string;
  videoFile: any; // File object
  title?: string;
  description?: string;
  onProgress?: (progress: number) => void;
}

class VideoService {
  // Upload video for event participation
  async uploadVideo(data: VideoUploadRequest): Promise<VideoSubmission> {
    try {
      if (MockWrapperService.isMockMode()) {
        // Use mock API for video upload
        const mockService = MockWrapperService.getMockService();
        
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

        // Get current user ID (you might need to adjust this based on your auth state)
        const userId = 'user_001'; // Default mock user
        
        const response = await mockService.uploadVideo({
          userId,
          eventId: data.eventId,
          title: data.title,
          description: data.description,
          duration: Math.floor(Math.random() * 180) + 30, // Random duration between 30-210 seconds
        });

        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error('Failed to upload video');
        }
      }

      // Real API implementation (when not in mock mode)
      // Validate video file
      this.validateVideoFile(data.videoFile);

      // Upload video using form data
      const formData = new FormData();
      formData.append('videoFile', data.videoFile);
      formData.append('eventId', data.eventId);
      if (data.title) formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);

      const response = await apiService.uploadFile<VideoSubmission>(
        API_ENDPOINTS.VIDEO.UPLOAD,
        formData,
        data.onProgress
      );

      if (!response.success || !response.data) {
        throw new Error('Failed to upload video');
      }

      return response.data;
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  }



  // Get video upload guidelines
  async getUploadGuidelines(): Promise<{
    maxDuration: number;
    minDuration: number;
    maxFileSize: number;
    supportedFormats: string[];
    tips: string[];
  }> {
    return {
      maxDuration: VIDEO_UPLOAD.MAX_DURATION,
      minDuration: VIDEO_UPLOAD.MIN_DURATION,
      maxFileSize: VIDEO_UPLOAD.MAX_FILE_SIZE,
      supportedFormats: [...VIDEO_UPLOAD.SUPPORTED_FORMATS],
      tips: [
        'Ensure good lighting and clear audio',
        'Follow the event guidelines',
        'Check video quality before uploading',
        'Make sure video meets duration requirements',
      ],
    };
  }

  // Validate video file
  private validateVideoFile(file: any): void {
    if (!file) {
      throw new Error('No video file provided');
    }

    // Check file size
    if (file.size > VIDEO_UPLOAD.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${VIDEO_UPLOAD.MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
    }

    // Check file format
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!VIDEO_UPLOAD.SUPPORTED_FORMATS.includes(fileExtension)) {
      throw new Error(`Unsupported file format. Supported formats: ${VIDEO_UPLOAD.SUPPORTED_FORMATS.join(', ')}`);
    }
  }

  // Upload to cloud storage
  private async uploadToCloud(
    uploadUrl: string,
    file: any,
    onProgress?: (progress: number) => void
  ): Promise<{ videoUrl: string; thumbnailUrl: string; duration: number }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({
              videoUrl: response.videoUrl,
              thumbnailUrl: response.thumbnailUrl,
              duration: response.duration,
            });
          } catch (error) {
            reject(new Error('Invalid response from upload server'));
          }
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      const formData = new FormData();
      formData.append('file', file);

      xhr.open('POST', uploadUrl);
      xhr.send(formData);
    });
  }
}

export const videoService = new VideoService();
export default videoService;
