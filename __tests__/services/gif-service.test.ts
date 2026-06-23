import { gifService } from '../../src/services/gif-service';
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
    GIF: {
      GIFS: '/gifs',
      GIF_DETAILS: '/gifs',
      SEARCH: '/gifs/search',
      UPLOAD: '/gifs/upload',
      TRENDING: '/gifs/trending',
      CATEGORIES: '/gifs/categories',
    },
  },
}));

const mockMockWrapper = MockWrapperService as jest.Mocked<typeof MockWrapperService>;
const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('GifService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getGifs', () => {
    it('returns mock gifs in mock mode', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(true);

      const gifs = await gifService.getGifs('reactions', 2);

      expect(gifs.length).toBeLessThanOrEqual(2);
      expect(gifs[0]?.category).toBe('reactions');
    });

    it('fetches from API when not in mock mode', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.get.mockResolvedValue({
        success: true,
        data: [{ id: 'api-1', title: 'API GIF' } as any],
        statusCode: 200,
      });

      const gifs = await gifService.getGifs('ui', 5);

      expect(mockApiService.get).toHaveBeenCalled();
      expect(gifs[0].id).toBe('api-1');
    });

    it('falls back to mock data on API failure', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.get.mockResolvedValue({ success: false, error: 'fail', statusCode: 500 });

      const gifs = await gifService.getGifs();

      expect(gifs.length).toBeGreaterThan(0);
    });

    it('falls back to mock data when API throws', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.get.mockRejectedValue(new Error('network'));

      const gifs = await gifService.getGifs('ui', 3);

      expect(gifs.length).toBeGreaterThan(0);
    });
  });

  describe('searchGifs', () => {
    it('filters mock results by query', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(true);

      const result = await gifService.searchGifs('dance');

      expect(result.gifs.some(g => g.title.toLowerCase().includes('dance'))).toBe(true);
      expect(result.totalCount).toBeGreaterThan(0);
    });

    it('searches via API', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.get.mockResolvedValue({
        success: true,
        data: { gifs: [{ id: '1' }], totalCount: 1, hasMore: false },
        statusCode: 200,
      });

      const result = await gifService.searchGifs('spinner');

      expect(result.gifs).toHaveLength(1);
    });

    it('falls back to mock search when API throws', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.get.mockRejectedValue(new Error('search down'));

      const result = await gifService.searchGifs('loading');

      expect(result.gifs.length).toBeGreaterThan(0);
    });
  });

  describe('getGifById', () => {
    it('returns mock gif by id', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(true);

      const gif = await gifService.getGifById('1');

      expect(gif?.id).toBe('1');
    });

    it('returns null for unknown id from API', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.get.mockResolvedValue({ success: false, error: '404', statusCode: 404 });

      const gif = await gifService.getGifById('missing');

      expect(gif).toBeNull();
    });

    it('returns API gif on success', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.get.mockResolvedValue({
        success: true,
        data: { id: 'api-gif', title: 'API' } as any,
        statusCode: 200,
      });

      const gif = await gifService.getGifById('api-gif');

      expect(gif?.id).toBe('api-gif');
    });

    it('falls back to mock gif when API throws', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.get.mockRejectedValue(new Error('missing'));

      const gif = await gifService.getGifById('1');

      expect(gif?.id).toBe('1');
    });
  });

  describe('getTrendingGifs', () => {
    it('returns sorted mock trending gifs', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(true);

      const gifs = await gifService.getTrendingGifs(3);

      expect(gifs).toHaveLength(3);
    });

    it('fetches trending from API', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.get.mockResolvedValue({
        success: true,
        data: [{ id: 't1' }],
        statusCode: 200,
      });

      const gifs = await gifService.getTrendingGifs();

      expect(gifs).toHaveLength(1);
    });

    it('falls back to mock trending when API throws', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.get.mockRejectedValue(new Error('trending down'));

      const gifs = await gifService.getTrendingGifs(2);

      expect(gifs.length).toBeGreaterThan(0);
    });
  });

  describe('getCategories', () => {
    it('returns mock categories', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(true);

      const categories = await gifService.getCategories();

      expect(categories).toContain('reactions');
      expect(categories.length).toBeGreaterThan(5);
    });

    it('fetches categories from API', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.get.mockResolvedValue({
        success: true,
        data: ['funny', 'sports'],
        statusCode: 200,
      });

      const categories = await gifService.getCategories();

      expect(categories).toEqual(['funny', 'sports']);
    });

    it('falls back to mock categories when API throws', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.get.mockRejectedValue(new Error('categories down'));

      const categories = await gifService.getCategories();

      expect(categories.length).toBeGreaterThan(0);
    });
  });

  describe('uploadGif', () => {
    const validFile = { size: 1000, type: 'image/gif', name: 'test.gif' };

    it('uploads via mock with progress', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(true);
      const onProgress = jest.fn();

      const promise = gifService.uploadGif({
        gifFile: validFile,
        title: 'Test',
        onProgress,
      });
      await jest.runAllTimersAsync();
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.gifId).toMatch(/^gif_/);
      expect(onProgress).toHaveBeenCalledWith(100);
    });

    it('uploads via API', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.uploadFile.mockResolvedValue({
        success: true,
        data: { success: true, gifId: 'gif_api', gifUrl: 'https://x/g.gif' },
        statusCode: 200,
      });

      const result = await gifService.uploadGif({
        gifFile: validFile,
        title: 'Test',
        description: 'Desc',
        tags: ['fun'],
        category: 'reactions',
      });

      expect(result.success).toBe(true);
      expect(result.gifId).toBe('gif_api');
    });

    it('rejects oversized files', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);

      const result = await gifService.uploadGif({
        gifFile: { size: 60 * 1024 * 1024, type: 'image/gif' },
        title: 'Big',
      });

      expect(result.success).toBe(false);
    });

    it('rejects unsupported format', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);

      const result = await gifService.uploadGif({
        gifFile: { size: 100, type: 'image/png' },
        title: 'PNG',
      });

      expect(result.success).toBe(false);
    });

    it('returns failure when API upload throws', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockApiService.uploadFile.mockRejectedValue(new Error('upload failed'));

      const result = await gifService.uploadGif({
        gifFile: { size: 100, type: 'image/gif', name: 'x.gif' },
        title: 'GIF',
      });

      expect(result.success).toBe(false);
    });
  });
});
