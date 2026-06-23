import { videoService } from '../../src/services/video-service';
import { MockWrapperService } from '../../src/services/mock-wrapper';
import apiService from '../../src/services/api';
import { VIDEO_UPLOAD } from '../../src/constants';

jest.mock('../../src/services/mock-wrapper');
jest.mock('../../src/services/api');
jest.mock('../../src/utils/simulate-progress', () => ({
  simulateUploadProgress: jest.fn((onProgress: (n: number) => void) => {
    onProgress(50);
    onProgress(100);
    return { promise: Promise.resolve(), cancel: jest.fn() };
  }),
}));
jest.mock('../../src/constants', () => ({
  VIDEO_UPLOAD: {
    MIN_DURATION: 30,
    MAX_DURATION: 180,
    MAX_FILE_SIZE: 100 * 1024 * 1024,
    SUPPORTED_FORMATS: ['mp4', 'mov', 'avi'],
  },
  API_ENDPOINTS: { VIDEO: { UPLOAD: '/video/upload' } },
}));

const mockMockWrapper = MockWrapperService as jest.Mocked<typeof MockWrapperService>;
const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('VideoService', () => {
  const validFile = { name: 'clip.mp4', size: 1024 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUploadGuidelines', () => {
    it('returns upload constraints and tips', async () => {
      const guidelines = await videoService.getUploadGuidelines();

      expect(guidelines.maxDuration).toBe(VIDEO_UPLOAD.MAX_DURATION);
      expect(guidelines.minDuration).toBe(VIDEO_UPLOAD.MIN_DURATION);
      expect(guidelines.supportedFormats).toEqual(['mp4', 'mov', 'avi']);
      expect(guidelines.tips.length).toBeGreaterThan(0);
    });
  });

  describe('uploadVideo', () => {
    it('uploads via mock service in mock mode', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(true);
      const mockUpload = jest.fn().mockResolvedValue({
        success: true,
        data: { id: 'vid_1', eventId: 'event_1' },
      });
      mockMockWrapper.getMockService.mockReturnValue({
        uploadVideo: mockUpload,
      } as any);
      const onProgress = jest.fn();

      const result = await videoService.uploadVideo({
        eventId: 'event_1',
        videoFile: validFile,
        title: 'My Video',
        onProgress,
      });

      expect(mockUpload).toHaveBeenCalled();
      expect(result.id).toBe('vid_1');
      expect(onProgress).toHaveBeenCalled();
    });

    it('uploads via API when not in mock mode', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.uploadFile.mockResolvedValue({
        success: true,
        data: { id: 'vid_api', eventId: 'event_2' } as any,
        statusCode: 200,
      });

      const result = await videoService.uploadVideo({
        eventId: 'event_2',
        videoFile: validFile,
        description: 'Desc',
      });

      expect(mockApiService.uploadFile).toHaveBeenCalledWith(
        '/video/upload',
        expect.any(FormData),
        undefined,
      );
      expect(result.id).toBe('vid_api');
    });

    it('throws when file is missing', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);

      await expect(
        videoService.uploadVideo({ eventId: 'e1', videoFile: null }),
      ).rejects.toThrow('No video file provided');
    });

    it('throws when file is too large', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);

      await expect(
        videoService.uploadVideo({
          eventId: 'e1',
          videoFile: { name: 'big.mp4', size: VIDEO_UPLOAD.MAX_FILE_SIZE + 1 },
        }),
      ).rejects.toThrow(/File size exceeds/);
    });

    it('throws for unsupported format', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);

      await expect(
        videoService.uploadVideo({
          eventId: 'e1',
          videoFile: { name: 'clip.wmv', size: 100 },
        }),
      ).rejects.toThrow(/Unsupported file format/);
    });

    it('throws when mock upload fails', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(true);
      mockMockWrapper.getMockService.mockReturnValue({
        uploadVideo: jest.fn().mockResolvedValue({ success: false }),
      } as any);

      await expect(
        videoService.uploadVideo({ eventId: 'event_1', videoFile: validFile }),
      ).rejects.toThrow('Failed to upload video');
    });

    it('throws when API upload fails', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.uploadFile.mockResolvedValue({
        success: false,
        error: 'Upload failed',
        statusCode: 500,
      });

      await expect(
        videoService.uploadVideo({ eventId: 'e1', videoFile: validFile }),
      ).rejects.toThrow('Failed to upload video');
    });
  });
});
