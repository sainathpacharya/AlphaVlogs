import { isMockMode } from '@/config/api-config';
import { getApiBaseUrl } from '@/constants';

/**
 * Turn API paths like `/assets/gifs/singing.gif` into full URLs
 * (e.g. `http://192.168.29.26:8080/assets/gifs/singing.gif`).
 */
export function resolveEventGifUrl(eventGif?: string | null): string | null {
  if (!eventGif?.trim()) {
    return null;
  }

  const path = eventGif.trim();
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (isMockMode()) {
    return null;
  }

  const base = getApiBaseUrl().replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
