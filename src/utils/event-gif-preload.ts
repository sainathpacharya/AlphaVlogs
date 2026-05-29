import FastImage from 'react-native-fast-image';
import { Event } from '@/types';
import { resolveEventGifUrl } from '@/utils/event-media';

/** Warm disk cache for event GIFs (static catalog). */
export function preloadEventGifs(events: Event[]): void {
  const sources = events
    .map((event) => resolveEventGifUrl(event.eventGif))
    .filter((uri): uri is string => Boolean(uri))
    .map((uri) => ({
      uri,
      cache: FastImage.cacheControl.immutable,
    }));

  if (sources.length > 0) {
    FastImage.preload(sources);
  }
}
