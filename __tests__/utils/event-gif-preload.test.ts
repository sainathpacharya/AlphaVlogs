import FastImage from 'react-native-fast-image';
import { Event } from '@/types';
import { preloadEventGifs } from '../../src/utils/event-gif-preload';

jest.mock('../../src/config/api-config', () => ({
  isMockMode: () => false,
}));

jest.mock('../../src/constants', () => ({
  getApiBaseUrl: () => 'https://api.alphavlogs.com',
}));

describe('event-gif-preload utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('preloads resolved GIF URLs with immutable cache control', () => {
    const events: Event[] = [
      {
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
      },
      {
        id: '2',
        title: 'Dancing',
        description: '',
        category: '',
        isActive: true,
        startDate: '',
        endDate: '',
        canUpload: true,
        uploadStartDate: '',
        uploadEndDate: '',
        createdAt: '',
        eventGif: 'https://cdn.example.com/dance.gif',
      },
    ];

    preloadEventGifs(events);

    expect(FastImage.preload).toHaveBeenCalledWith([
      {
        uri: 'https://api.alphavlogs.com/assets/gifs/singing.gif',
        cache: FastImage.cacheControl.immutable,
      },
      {
        uri: 'https://cdn.example.com/dance.gif',
        cache: FastImage.cacheControl.immutable,
      },
    ]);
  });

  it('skips preload when no valid GIF URLs exist', () => {
    preloadEventGifs([
      {
        id: '1',
        title: 'No GIF',
        description: '',
        category: '',
        isActive: true,
        startDate: '',
        endDate: '',
        canUpload: false,
        uploadStartDate: '',
        uploadEndDate: '',
        createdAt: '',
        eventGif: '',
      },
    ]);

    expect(FastImage.preload).not.toHaveBeenCalled();
  });
});
