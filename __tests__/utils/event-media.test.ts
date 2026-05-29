import { resolveEventGifUrl } from '../../src/utils/event-media';

jest.mock('../../src/config/api-config', () => ({
  isMockMode: () => false,
}));

jest.mock('../../src/constants', () => ({
  getApiBaseUrl: () => 'http://192.168.29.26:8080',
}));

describe('resolveEventGifUrl', () => {
  it('returns null for empty path', () => {
    expect(resolveEventGifUrl(null)).toBeNull();
    expect(resolveEventGifUrl('')).toBeNull();
  });

  it('returns absolute URLs unchanged', () => {
    expect(resolveEventGifUrl('https://cdn.example.com/a.gif')).toBe(
      'https://cdn.example.com/a.gif',
    );
  });

  it('prefixes API base URL for server-relative paths', () => {
    expect(resolveEventGifUrl('/assets/gifs/singing.gif')).toBe(
      'http://192.168.29.26:8080/assets/gifs/singing.gif',
    );
  });
});
