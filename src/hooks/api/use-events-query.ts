import { useQuery } from '@tanstack/react-query';
import { eventsService } from '@/services/events-service';
import { DashboardEventCardItem } from '@/components/DashboardEventCard';
import { resolveDashboardEventId } from '@/utils/event-icons';
import { resolveEventGifUrl } from '@/utils/event-media';
import { queryKeys } from '@/lib/query-keys';

const EVENTS_STALE_TIME = 7 * 24 * 60 * 60 * 1000;

function mapEventsToCards(
  list: Array<{ id: string | number; title: string; eventGif?: string | null }>,
): DashboardEventCardItem[] {
  return list.map(event => ({
    id: String(event.id),
    iconId: resolveDashboardEventId({
      id: event.id,
      title: event.title,
    }),
    title: event.title,
    gifUrl: resolveEventGifUrl(event.eventGif),
  }));
}

export function useEventsQuery() {
  return useQuery({
    queryKey: queryKeys.events.list(),
    queryFn: async () => {
      const response = await eventsService.getEvents();
      const list = response.data?.data;

      if (!response.success || !Array.isArray(list)) {
        throw new Error(
          response.error || response.message || 'Failed to load events.',
        );
      }

      return mapEventsToCards(list);
    },
    staleTime: EVENTS_STALE_TIME,
    gcTime: EVENTS_STALE_TIME,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}
