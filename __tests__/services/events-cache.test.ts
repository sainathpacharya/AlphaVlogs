import {
  readCachedEvents,
  readStaleCachedEvents,
  writeCachedEvents,
  clearEventsCache,
} from '../../src/services/events-cache';
import { Event } from '../../src/types';

const mockStorage = new Map<string, string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn((key: string, value: string) => {
    mockStorage.set(key, value);
    return Promise.resolve();
  }),
  getItem: jest.fn((key: string) => Promise.resolve(mockStorage.get(key) ?? null)),
  removeItem: jest.fn((key: string) => {
    mockStorage.delete(key);
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    mockStorage.clear();
    return Promise.resolve();
  }),
}));

const mockGetApiBaseUrl = jest.fn(() => 'http://192.168.29.26:8080');

jest.mock('@/config/api-config', () => ({
  isMockMode: () => false,
}));

jest.mock('@/constants', () => ({
  get getApiBaseUrl() {
    return mockGetApiBaseUrl;
  },
}));

const sampleEvent: Event = {
  id: '1',
  title: 'Singing',
  description: '',
  category: '',
  isActive: true,
  startDate: '',
  endDate: '',
  canUpload: true,
  uploadStartDate: '',
  uploadEndDate: '',
  createdAt: '',
  eventGif: '/assets/gifs/singing.gif',
};

describe('events-cache', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  it('persists and reads events', async () => {
    await writeCachedEvents([sampleEvent]);
    const events = await readCachedEvents();
    expect(events).toHaveLength(1);
    expect(events?.[0].title).toBe('Singing');
  });

  it('returns null when cache base URL changes', async () => {
    await writeCachedEvents([sampleEvent]);
    mockGetApiBaseUrl.mockReturnValue('https://api.alphavlogs.com');
    await expect(readCachedEvents()).resolves.toBeNull();
  });

  it('returns null for expired cache but stale reader still works', async () => {
    await writeCachedEvents([sampleEvent]);
    const key = '@jack_marvels/student_events_v1';
    const raw = mockStorage.get(key);
    if (raw) {
      const bundle = JSON.parse(raw);
      bundle.cachedAt = Date.now() - 8 * 24 * 60 * 60 * 1000;
      mockStorage.set(key, JSON.stringify(bundle));
    }

    await expect(readCachedEvents()).resolves.toBeNull();
    await expect(readStaleCachedEvents()).resolves.toHaveLength(1);
  });

  it('ignores invalid cache JSON and clears cache', async () => {
    mockStorage.set('@jack_marvels/student_events_v1', '{bad json');
    await expect(readCachedEvents()).resolves.toBeNull();
    await clearEventsCache();
    expect(mockStorage.has('@jack_marvels/student_events_v1')).toBe(false);
  });
});
