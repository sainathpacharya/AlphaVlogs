import eventsService, { resolveEventsPayload } from '../../src/services/events-service';
import apiService from '../../src/services/api';
import { MockWrapperService } from '../../src/services/mock-wrapper';
import {
  readCachedEvents,
  readStaleCachedEvents,
  writeCachedEvents,
} from '../../src/services/events-cache';
import { preloadEventGifs } from '../../src/utils/event-gif-preload';

jest.mock('../../src/services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

jest.mock('../../src/services/mock-wrapper', () => ({
  MockWrapperService: {
    isMockMode: jest.fn(),
    getMockService: jest.fn(),
    convertMockResponse: jest.fn((r: unknown) => r),
  },
}));

jest.mock('../../src/services/events-cache', () => ({
  readCachedEvents: jest.fn(),
  readStaleCachedEvents: jest.fn(),
  writeCachedEvents: jest.fn(),
}));

jest.mock('../../src/utils/event-gif-preload', () => ({
  preloadEventGifs: jest.fn(),
}));

jest.mock('../../src/utils/api-logger', () => ({
  apiLogger: {
    logMockCall: jest.fn(),
    logServiceCall: jest.fn(),
  },
}));

const mockApi = apiService as jest.Mocked<typeof apiService>;
const mockWrapper = MockWrapperService as jest.Mocked<typeof MockWrapperService>;
const mockReadCache = readCachedEvents as jest.MockedFunction<typeof readCachedEvents>;
const mockReadStale = readStaleCachedEvents as jest.MockedFunction<typeof readStaleCachedEvents>;
const mockWriteCache = writeCachedEvents as jest.MockedFunction<typeof writeCachedEvents>;

const sampleEvent = {
  id: '1',
  title: 'singing',
  description: 'Sing',
  category: 'Singing',
  isActive: true,
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  canUpload: true,
  uploadStartDate: '2024-01-01',
  uploadEndDate: '2024-12-31',
  createdAt: '2024-01-01',
};

describe('events-service integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWrapper.isMockMode.mockReturnValue(false);
    mockReadCache.mockResolvedValue(null);
    mockReadStale.mockResolvedValue(null);
    mockWriteCache.mockResolvedValue(undefined);
  });

  describe('resolveEventsPayload', () => {
    it('unwraps nested payload keys', () => {
      const events = [{ id: 1, name: 'dance' }];
      expect(resolveEventsPayload({ events })).toBe(events);
      expect(resolveEventsPayload({ studentEvents: events })).toBe(events);
      expect(resolveEventsPayload({ items: events })).toBe(events);
      expect(resolveEventsPayload({ list: events })).toBe(events);
    });
  });

  describe('getEvents', () => {
    it('returns cached events when available', async () => {
      mockReadCache.mockResolvedValue([sampleEvent]);

      const result = await eventsService.getEvents();

      expect(result.success).toBe(true);
      expect(result.data?.data).toHaveLength(1);
      expect(mockApi.get).not.toHaveBeenCalled();
      expect(preloadEventGifs).toHaveBeenCalledWith([sampleEvent]);
    });

    it('fetches from API and caches normalized events', async () => {
      mockApi.get.mockResolvedValue([
        { eventId: 9, eventName: 'national anthem', description: 'NA' },
      ]);

      const result = await eventsService.getEvents({ forceRefresh: true });

      expect(mockApi.get).toHaveBeenCalled();
      expect(mockWriteCache).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data?.data[0].title).toBe('National Anthem');
    });

    it('falls back to stale cache when API returns empty', async () => {
      mockApi.get.mockResolvedValue([]);
      mockReadStale.mockResolvedValue([sampleEvent]);

      const result = await eventsService.getEvents({ forceRefresh: true });

      expect(result.data?.data).toHaveLength(1);
    });

    it('returns API error when request failed', async () => {
      mockApi.get.mockResolvedValue({
        success: false,
        error: 'Unauthorized',
        statusCode: 401,
      });

      const result = await eventsService.getEvents({ forceRefresh: true });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
      expect(result.statusCode).toBe(401);
    });

    it('uses mock service in mock mode', async () => {
      mockWrapper.isMockMode.mockReturnValue(true);
      mockWrapper.getMockService.mockReturnValue({
        getEvents: jest.fn().mockResolvedValue({
          success: true,
          data: { events: [sampleEvent], total: 1 },
        }),
      } as never);

      const result = await eventsService.getEvents({ category: 'Singing' });

      expect(result.success).toBe(true);
      expect(result.data?.data).toHaveLength(1);
    });

    it('returns mock error when mock fetch fails', async () => {
      mockWrapper.isMockMode.mockReturnValue(true);
      mockWrapper.getMockService.mockReturnValue({
        getEvents: jest.fn().mockResolvedValue({ success: false }),
      } as never);

      const result = await eventsService.getEvents();

      expect(result.success).toBe(false);
    });

    it('rethrows network errors', async () => {
      mockApi.get.mockRejectedValue(new Error('network'));

      await expect(eventsService.getEvents({ forceRefresh: true })).rejects.toThrow('network');
    });
  });

  describe('getEventById', () => {
    it('fetches event by id from API', async () => {
      mockApi.get.mockResolvedValue({ success: true, data: sampleEvent, statusCode: 200 });

      const result = await eventsService.getEventById('1');

      expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining('/1'));
      expect(result.success).toBe(true);
    });

    it('uses mock service in mock mode', async () => {
      mockWrapper.isMockMode.mockReturnValue(true);
      mockWrapper.getMockService.mockReturnValue({
        getEventById: jest.fn().mockResolvedValue({ success: true, data: sampleEvent }),
      } as never);

      const result = await eventsService.getEventById('1');

      expect(result.success).toBe(true);
    });
  });

  describe('getEventCategories', () => {
    it('fetches categories from API', async () => {
      mockApi.get.mockResolvedValue({ success: true, data: ['Singing'], statusCode: 200 });

      const result = await eventsService.getEventCategories();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(['Singing']);
    });

    it('reads categories from mock service', async () => {
      mockWrapper.isMockMode.mockReturnValue(true);
      mockWrapper.getMockService.mockReturnValue({
        getEvents: jest.fn().mockResolvedValue({
          success: true,
          data: { categories: ['Dance'] },
        }),
      } as never);

      const result = await eventsService.getEventCategories();

      expect(result.data).toEqual(['Dance']);
    });
  });

  describe('getEventsByCategory and searchEvents', () => {
    it('filters by category via API', async () => {
      mockApi.get.mockResolvedValue({
        success: true,
        data: [{ id: 1, name: 'singing' }],
        statusCode: 200,
      });

      const result = await eventsService.getEventsByCategory('Singing');

      expect(result.success).toBe(true);
      expect(result.data?.[0].title).toBe('Singing');
    });

    it('searches events via API', async () => {
      mockApi.get.mockResolvedValue({
        success: true,
        data: [{ id: 2, name: 'dancing' }],
        statusCode: 200,
      });

      const result = await eventsService.searchEvents('dance');

      expect(result.success).toBe(true);
      expect(result.data?.[0].title).toBe('Dancing');
    });

    it('searches events in mock mode', async () => {
      mockWrapper.isMockMode.mockReturnValue(true);
      mockWrapper.getMockService.mockReturnValue({
        getEvents: jest.fn().mockResolvedValue({
          success: true,
          data: { events: [sampleEvent] },
        }),
      } as never);

      const result = await eventsService.searchEvents('sing');

      expect(result.data).toHaveLength(1);
    });
  });
});
