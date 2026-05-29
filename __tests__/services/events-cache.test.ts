import { readCachedEvents, writeCachedEvents } from '../../src/services/events-cache';
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

jest.mock('@/config/api-config', () => ({
  isMockMode: () => false,
}));

jest.mock('@/constants', () => ({
  getApiBaseUrl: () => 'http://192.168.29.26:8080',
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
});
