import eventsService, { resolveEventsPayload } from '../../src/services/events-service';
import apiService from '../../src/services/api';
import { MockWrapperService } from '../../src/services/mock-wrapper';
import {
  readCachedEvents,
  readStaleCachedEvents,
  writeCachedEvents,
} from '../../src/services/events-cache';

jest.mock('../../src/services/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
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

describe('events-service branch coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWrapper.isMockMode.mockReturnValue(false);
    mockReadCache.mockResolvedValue(null);
    mockReadStale.mockResolvedValue(null);
  });

  it('resolveEventsPayload handles primitives and nested keys', () => {
    expect(resolveEventsPayload(null)).toBeNull();
    expect(resolveEventsPayload([{ id: 1 }])).toEqual([{ id: 1 }]);
    expect(resolveEventsPayload({ data: [{ id: 2 }] })).toEqual([{ id: 2 }]);
    expect(resolveEventsPayload({ list: [{ id: 3 }] })).toEqual([{ id: 3 }]);
  });

  it('extracts events from content wrapper via getEvents', async () => {
    mockApi.get.mockResolvedValue({
      success: true,
      data: { content: [{ eventId: 5, eventName: 'dance' }] },
      statusCode: 200,
    });

    const result = await eventsService.getEvents({ forceRefresh: true });

    expect(result.data?.data[0].title).toBe('Dance');
  });

  it('normalizes events with alternate API field names', async () => {
    mockApi.get.mockResolvedValue([
      {
        eventMasterId: 7,
        eventMasterName: 'national anthem',
        description: null,
        isActive: false,
        eventGif: 'https://gif',
        allowedRoles: [4],
      },
      { eventCode: 'x', name: '' },
    ]);

    const result = await eventsService.getEvents({ forceRefresh: true });

    expect(result.data?.data).toHaveLength(1);
    expect(result.data?.data[0].id).toBe('7');
    expect(result.data?.data[0].isActive).toBe(false);
    expect(result.data?.data[0].eventGif).toBe('https://gif');
    expect(result.data?.data[0].allowedRoles).toEqual([4]);
  });

  it('returns empty paginated list when API yields no events', async () => {
    mockApi.get.mockResolvedValue({ success: true, data: [], statusCode: 200 });

    const result = await eventsService.getEvents({ forceRefresh: true });

    expect(result.success).toBe(true);
    expect(result.data?.data).toEqual([]);
  });

  it('getEventById rethrows network errors', async () => {
    mockApi.get.mockRejectedValue(new Error('offline'));

    await expect(eventsService.getEventById('1')).rejects.toThrow('offline');
  });

  it('getEventCategories handles mock empty categories', async () => {
    mockWrapper.isMockMode.mockReturnValue(true);
    mockWrapper.getMockService.mockReturnValue({
      getEvents: jest.fn().mockResolvedValue({ success: true, data: {} }),
    } as never);

    const result = await eventsService.getEventCategories();

    expect(result.data).toEqual([]);
  });

  it('getEventCategories rethrows errors', async () => {
    mockApi.get.mockRejectedValue(new Error('categories failed'));

    await expect(eventsService.getEventCategories()).rejects.toThrow('categories failed');
  });

  it('getEventsByCategory uses mock service', async () => {
    mockWrapper.isMockMode.mockReturnValue(true);
    mockWrapper.getMockService.mockReturnValue({
      getEvents: jest.fn().mockResolvedValue({
        success: true,
        data: { events: [{ id: '1', title: 'Dance', category: 'Dance' }] },
      }),
    } as never);

    const result = await eventsService.getEventsByCategory('Dance');

    expect(result.data).toHaveLength(1);
  });

  it('getEventsByCategory rethrows errors', async () => {
    mockApi.get.mockRejectedValue(new Error('category failed'));

    await expect(eventsService.getEventsByCategory('Dance')).rejects.toThrow('category failed');
  });

  it('searchEvents rethrows errors', async () => {
    mockApi.get.mockRejectedValue(new Error('search failed'));

    await expect(eventsService.searchEvents('sing')).rejects.toThrow('search failed');
  });

  it('mock getEvents requests categories when category filter is set', async () => {
    mockWrapper.isMockMode.mockReturnValue(true);
    const getEvents = jest.fn().mockResolvedValue({
      success: true,
      data: { events: [], total: 0 },
    });
    mockWrapper.getMockService.mockReturnValue({ getEvents } as never);

    await eventsService.getEvents({ category: 'Singing' });

    expect(getEvents).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'Singing', include: ['categories'] }),
    );
  });

  it('returns API error when empty payload is a failed response', async () => {
    mockApi.get.mockResolvedValue({
      success: false,
      error: 'Forbidden',
      statusCode: 403,
    });

    const result = await eventsService.getEvents({ forceRefresh: true });

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(403);
  });

  it('getEventById returns mock error response', async () => {
    mockWrapper.isMockMode.mockReturnValue(true);
    mockWrapper.getMockService.mockReturnValue({
      getEventById: jest.fn().mockResolvedValue({ success: false, error: 'missing' }),
    } as never);

    const result = await eventsService.getEventById('missing');

    expect(result.success).toBe(false);
  });

  it('getEventCategories returns empty when mock has no categories', async () => {
    mockWrapper.isMockMode.mockReturnValue(true);
    mockWrapper.getMockService.mockReturnValue({
      getEvents: jest.fn().mockResolvedValue({ success: false }),
    } as never);

    const result = await eventsService.getEventCategories();

    expect(result.data).toEqual([]);
  });
});
