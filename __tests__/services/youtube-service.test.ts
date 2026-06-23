import { youtubeService } from '../../src/services/youtube-service';
import { MockWrapperService } from '../../src/services/mock-wrapper';
import apiService from '../../src/services/api';

jest.mock('../../src/services/mock-wrapper');
jest.mock('../../src/services/api');
jest.mock('../../src/utils/simulate-progress', () => ({
  simulateUploadProgress: jest.fn((onProgress: (n: number) => void) => {
    onProgress(100);
    return { promise: Promise.resolve(), cancel: jest.fn() };
  }),
}));
jest.mock('../../src/constants', () => ({
  API_ENDPOINTS: {
    YOUTUBE: {
      VIDEOS: '/youtube/videos',
      VIDEO_DETAILS: '/youtube/video',
      SEARCH: '/youtube/search',
      UPLOAD: '/youtube/upload',
      UPLOAD_STATUS: '/youtube/upload-status',
      PLAYLISTS: '/youtube/playlists',
    },
  },
}));

const mockMockWrapper = MockWrapperService as jest.Mocked<typeof MockWrapperService>;
const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('YouTubeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('URL helpers', () => {
    it('extracts video id from watch URL', () => {
      expect(
        youtubeService.extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
      ).toBe('dQw4w9WgXcQ');
    });

    it('extracts video id from youtu.be URL', () => {
      expect(youtubeService.extractVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('returns null for invalid URL', () => {
      expect(youtubeService.extractVideoId('https://example.com')).toBeNull();
    });

    it('builds thumbnail, video, and embed URLs', () => {
      expect(youtubeService.getThumbnailUrl('abc123', 'high')).toBe(
        'https://img.youtube.com/vi/abc123/highdefault.jpg',
      );
      expect(youtubeService.getVideoUrl('abc123')).toBe(
        'https://www.youtube.com/watch?v=abc123',
      );
      expect(youtubeService.getEmbedUrl('abc123')).toBe(
        'https://www.youtube.com/embed/abc123',
      );
    });
  });

  describe('getVideos', () => {
    it('returns mock videos in mock mode', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(true);

      const videos = await youtubeService.getVideos(undefined, 2);

      expect(videos).toHaveLength(2);
      expect(videos[0].videoId).toBeDefined();
    });

    it('fetches from API', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.get.mockResolvedValue({
        success: true,
        data: [{ id: '1', videoId: 'x', title: 'API' } as any],
        statusCode: 200,
      });

      const videos = await youtubeService.getVideos();

      expect(videos[0].title).toBe('API');
    });

    it('falls back to mock on error', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.get.mockRejectedValue(new Error('fail'));

      const videos = await youtubeService.getVideos();

      expect(videos.length).toBeGreaterThan(0);
    });

    it('falls back when API succeeds without data', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.get.mockResolvedValue({ success: true, data: null, statusCode: 200 });

      const videos = await youtubeService.getVideos();

      expect(videos.length).toBeGreaterThan(0);
    });
  });

  describe('getVideoById', () => {
    it('finds mock video by videoId', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(true);

      const video = await youtubeService.getVideoById('dQw4w9WgXcQ');

      expect(video?.videoId).toBe('dQw4w9WgXcQ');
    });

    it('fetches from API in real mode', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.get.mockResolvedValue({
        success: true,
        data: { id: '1', videoId: 'api_vid', title: 'API Video' } as any,
        statusCode: 200,
      });

      const video = await youtubeService.getVideoById('api_vid');

      expect(video?.title).toBe('API Video');
    });

    it('returns null when API has no data', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.get.mockResolvedValue({ success: false, statusCode: 404 });

      await expect(youtubeService.getVideoById('missing')).resolves.toBeNull();
    });

    it('falls back to mock on API error', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.get.mockRejectedValue(new Error('fail'));

      const video = await youtubeService.getVideoById('dQw4w9WgXcQ');

      expect(video?.videoId).toBe('dQw4w9WgXcQ');
    });
  });

  describe('searchVideos', () => {
    it('filters mock videos by query', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(true);

      const videos = await youtubeService.searchVideos('Educational');

      expect(videos.length).toBeGreaterThan(0);
    });

    it('searches via API', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.get.mockResolvedValue({
        success: true,
        data: [{ id: '1', videoId: 'x', title: 'Search hit' } as any],
        statusCode: 200,
      });

      const videos = await youtubeService.searchVideos('test');

      expect(videos[0].title).toBe('Search hit');
    });

    it('falls back to mock search on API error', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.get.mockRejectedValue(new Error('fail'));

      const videos = await youtubeService.searchVideos('Educational');

      expect(videos.length).toBeGreaterThan(0);
    });
  });

  describe('getPlaylists', () => {
    it('returns mock playlists', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(true);

      const playlists = await youtubeService.getPlaylists();

      expect(playlists).toHaveLength(2);
      expect(playlists[0].videos.length).toBeGreaterThan(0);
    });

    it('fetches playlists from API', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.get.mockResolvedValue({
        success: true,
        data: [{ id: 'p1', title: 'Playlist', description: '', thumbnail: '', videoCount: 1, videos: [] }],
        statusCode: 200,
      });

      const playlists = await youtubeService.getPlaylists('education');

      expect(playlists[0].title).toBe('Playlist');
    });

    it('falls back to mock playlists on API error', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.get.mockRejectedValue(new Error('fail'));

      const playlists = await youtubeService.getPlaylists();

      expect(playlists.length).toBeGreaterThan(0);
    });
  });

  describe('uploadVideo', () => {
    const validFile = { size: 1000, type: 'video/mp4', name: 'clip.mp4' };

    it('mock uploads with progress', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(true);

      const promise = youtubeService.uploadVideo({
        videoFile: validFile,
        title: 'Title',
        description: 'Desc',
        onProgress: jest.fn(),
      });
      await jest.runAllTimersAsync();
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.videoUrl).toMatch(/youtube\.com/);
    });

    it('uploads via API', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.uploadFile.mockResolvedValue({
        success: true,
        data: { success: true, videoId: 'yt_1' },
        statusCode: 200,
      });

      const result = await youtubeService.uploadVideo({
        videoFile: validFile,
        title: 'Title',
        description: 'Desc',
        tags: ['edu'],
      });

      expect(result.success).toBe(true);
      expect(result.videoId).toBe('yt_1');
    });

    it('returns failure for invalid file', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);

      const result = await youtubeService.uploadVideo({
        videoFile: null,
        title: 'T',
        description: 'D',
      });

      expect(result.success).toBe(false);
    });

    it('returns failure when API upload fails', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.uploadFile.mockResolvedValue({
        success: false,
        error: 'denied',
        statusCode: 400,
      });

      const result = await youtubeService.uploadVideo({
        videoFile: validFile,
        title: 'Title',
        description: 'Desc',
      });

      expect(result.success).toBe(false);
    });

    it('rejects oversized files', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);

      const result = await youtubeService.uploadVideo({
        videoFile: { size: 3 * 1024 * 1024 * 1024, type: 'video/mp4', name: 'big.mp4' },
        title: 'T',
        description: 'D',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('getUploadStatus', () => {
    it('returns completed in mock mode', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(true);

      const status = await youtubeService.getUploadStatus('vid_1');

      expect(status.status).toBe('completed');
      expect(status.progress).toBe(100);
    });

    it('returns API status', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.get.mockResolvedValue({
        success: true,
        data: { status: 'processing', progress: 50 },
        statusCode: 200,
      });

      const status = await youtubeService.getUploadStatus('vid_1');

      expect(status.status).toBe('processing');
    });

    it('returns failed when API has no data', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.get.mockResolvedValue({ success: false, error: 'x', statusCode: 404 });

      const status = await youtubeService.getUploadStatus('vid_1');

      expect(status.status).toBe('failed');
    });

    it('returns failed on API error', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.get.mockRejectedValue(new Error('network'));

      const status = await youtubeService.getUploadStatus('vid_1');

      expect(status.status).toBe('failed');
      expect(status.message).toBe('Error checking upload status');
    });
  });
});
