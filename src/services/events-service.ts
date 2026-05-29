import apiService from './api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse, Event, PaginatedResponse } from '@/types';
import { MockWrapperService } from './mock-wrapper';
import { apiLogger } from '@/utils/api-logger';
import { parseApiErrorMessage } from '@/utils/api-response';
import { formatEventTitle } from '@/utils/event-icons';
import { preloadEventGifs } from '@/utils/event-gif-preload';
import {
  readCachedEvents,
  readStaleCachedEvents,
  writeCachedEvents,
} from './events-cache';

/** API may return a raw array or { success, data: [...] }. */
export function resolveEventsPayload(apiResult: unknown): unknown {
  if (Array.isArray(apiResult)) {
    return apiResult;
  }
  if (apiResult && typeof apiResult === 'object') {
    const record = apiResult as Record<string, unknown>;
    return (
      record.data ??
      record.events ??
      record.studentEvents ??
      record.items ??
      record.list ??
      apiResult
    );
  }
  return apiResult;
}

function normalizeApiEvent(raw: Record<string, unknown>, index: number): Event {
  const id = String(
    raw.id ??
      raw.eventId ??
      raw.eventMasterId ??
      raw.eventCode ??
      raw.code ??
      `event_${index}`,
  );
  const rawTitle = String(
    raw.title ??
      raw.name ??
      raw.eventName ??
      raw.eventTitle ??
      raw.eventMasterName ??
      raw.displayName ??
      '',
  );
  const title = rawTitle ? formatEventTitle(rawTitle) : '';
  return {
    id,
    title,
    description: raw.description == null ? '' : String(raw.description),
    category: String(raw.category ?? ''),
    eventGif: raw.eventGif ? String(raw.eventGif) : undefined,
    isActive: raw.isActive !== false,
    startDate: String(raw.startDate ?? ''),
    endDate: String(raw.endDate ?? ''),
    canUpload: raw.canUpload !== false,
    uploadStartDate: String(raw.uploadStartDate ?? ''),
    uploadEndDate: String(raw.uploadEndDate ?? ''),
    createdAt: String(raw.createdAt ?? ''),
    allowedRoles: Array.isArray(raw.allowedRoles)
      ? (raw.allowedRoles as number[])
      : undefined,
  };
}

function extractEventsList(payload: unknown): Event[] {
  if (!payload) return [];
  if (Array.isArray(payload)) {
    return payload
      .map((item, index) => normalizeApiEvent(item as Record<string, unknown>, index))
      .filter((e) => e.title.trim().length > 0);
  }
  const record = payload as Record<string, unknown>;
  const nested =
    record.data ??
    record.events ??
    record.studentEvents ??
    record.items ??
    record.list ??
    record.content ??
    record.records;
  return extractEventsList(nested);
}

function paginatedFromEvents(events: Event[]): ApiResponse<PaginatedResponse<Event>> {
  return {
    success: true,
    data: {
      data: events,
      pagination: {
        page: 1,
        limit: events.length,
        total: events.length,
        totalPages: 1,
      },
      success: true,
      statusCode: 200,
    },
    statusCode: 200,
  };
}

export interface EventsQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  isActive?: boolean;
  /** Bypass AsyncStorage cache and refetch from API. */
  forceRefresh?: boolean;
}

export interface EventDetailResponse extends Event {
  rules?: string[];
  prizes?: string[];
  participants?: number;
}

class EventsService {
  async getEvents(params?: EventsQueryParams): Promise<ApiResponse<PaginatedResponse<Event>>> {
    try {
      if (MockWrapperService.isMockMode()) {
        const mockService = MockWrapperService.getMockService();
        const mockParams = {
          category: params?.category,
          search: params?.search,
          include: params?.category ? ['categories'] : undefined,
        };
        const response = await mockService.getEvents(mockParams);

        if (response.success && response.data) {
          const result = {
            success: true,
            data: {
              data: response.data.events,
              pagination: {
                page: 1,
                limit: response.data.events.length,
                total: response.data.total,
                totalPages: 1,
              },
              success: true,
              statusCode: 200,
            },
            statusCode: 200,
          };
          apiLogger.logMockCall('EventsService', 'getEvents', params, result);
          return result;
        }

        const errorResult = {
          success: false,
          error: 'Failed to fetch events',
          statusCode: 400,
        };
        apiLogger.logMockCall('EventsService', 'getEvents', params, errorResult);
        return errorResult;
      }

      if (!params?.forceRefresh) {
        const cached = await readCachedEvents();
        if (cached?.length) {
          preloadEventGifs(cached);
          const fromCache = paginatedFromEvents(cached);
          apiLogger.logServiceCall('EventsService', 'getEvents', params, {
            ...fromCache,
            fromCache: true,
          });
          return fromCache;
        }
      }

      const queryParams = {...params};
      delete queryParams.forceRefresh;
      const queryString = queryParams
        ? `?${new URLSearchParams(queryParams as Record<string, string>).toString()}`
        : '';
      const result = await apiService.get<PaginatedResponse<Event> | Event[]>(
        `${API_ENDPOINTS.STUDENTS.EVENTS}${queryString}`,
      );
      const events = extractEventsList(resolveEventsPayload(result));

      if (events.length > 0) {
        await writeCachedEvents(events);
        preloadEventGifs(events);
        const normalized = paginatedFromEvents(events);
        apiLogger.logServiceCall('EventsService', 'getEvents', params, normalized);
        return normalized;
      }

      const staleCache = await readStaleCachedEvents();
      if (staleCache?.length) {
        preloadEventGifs(staleCache);
        return paginatedFromEvents(staleCache);
      }

      const wrapped =
        result && typeof result === 'object' && !Array.isArray(result)
          ? (result as ApiResponse<unknown>)
          : null;
      const apiMessage =
        parseApiErrorMessage(result) ||
        (typeof wrapped?.error === 'string' ? wrapped.error : undefined);
      const failedRequest =
        wrapped?.success === false ||
        (typeof wrapped?.statusCode === 'number' && wrapped.statusCode >= 400);

      if (__DEV__) {
        console.warn('[EventsService] No events parsed from /api/students/events', {
          statusCode: wrapped?.statusCode,
          apiMessage,
          isArray: Array.isArray(result),
          sample: Array.isArray(result) ? result[0] : wrapped?.data,
        });
      }

      if (failedRequest) {
        const errorResult = {
          success: false,
          error: apiMessage || 'Failed to load events',
          statusCode: wrapped?.statusCode || 401,
        };
        apiLogger.logServiceCall('EventsService', 'getEvents', params, null, errorResult);
        return errorResult;
      }

      return paginatedFromEvents([]);
    } catch (error) {
      apiLogger.logServiceCall('EventsService', 'getEvents', params, null, error);
      throw error;
    }
  }

  async getEventById(id: string): Promise<ApiResponse<EventDetailResponse>> {
    try {
      if (MockWrapperService.isMockMode()) {
        const mockService = MockWrapperService.getMockService();
        const response = await mockService.getEventById(id, ['guidelines', 'categories', 'related']);
        const converted = MockWrapperService.convertMockResponse(response);
        apiLogger.logMockCall('EventsService', 'getEventById', { id }, converted);
        return converted;
      }
      const result = await apiService.get<EventDetailResponse>(
        `${API_ENDPOINTS.STUDENTS.EVENTS}/${id}`,
      );
      apiLogger.logServiceCall('EventsService', 'getEventById', { id }, result);
      return result;
    } catch (error) {
      apiLogger.logServiceCall('EventsService', 'getEventById', { id }, null, error);
      throw error;
    }
  }

  async getEventCategories(): Promise<ApiResponse<string[]>> {
    try {
      if (MockWrapperService.isMockMode()) {
        const mockService = MockWrapperService.getMockService();
        const response = await mockService.getEvents({ include: ['categories'] });
        const categories = response.success && response.data ? (response.data as any).categories || [] : [];
        const result = { success: true, data: categories, statusCode: 200 };
        apiLogger.logMockCall('EventsService', 'getEventCategories', null, result);
        return result;
      }
      const result = await apiService.get<string[]>(`${API_ENDPOINTS.STUDENTS.EVENTS}/categories`);
      apiLogger.logServiceCall('EventsService', 'getEventCategories', null, result);
      return result;
    } catch (error) {
      apiLogger.logServiceCall('EventsService', 'getEventCategories', null, null, error);
      throw error;
    }
  }

  async getEventsByCategory(category: string): Promise<ApiResponse<Event[]>> {
    try {
      if (MockWrapperService.isMockMode()) {
        const mockService = MockWrapperService.getMockService();
        const response = await mockService.getEvents({ category });
        const events = response.success && response.data ? (response.data as any).events || [] : [];
        const result = { success: true, data: events, statusCode: 200 };
        apiLogger.logMockCall('EventsService', 'getEventsByCategory', { category }, result);
        return result;
      }
      const result = await apiService.get<Event[]>(
        `${API_ENDPOINTS.STUDENTS.EVENTS}?category=${encodeURIComponent(category)}`,
      );
      const events = extractEventsList(result.data ?? result);
      const normalized = { success: true, data: events, statusCode: 200 };
      apiLogger.logServiceCall('EventsService', 'getEventsByCategory', { category }, normalized);
      return normalized;
    } catch (error) {
      apiLogger.logServiceCall('EventsService', 'getEventsByCategory', { category }, null, error);
      throw error;
    }
  }

  async searchEvents(query: string): Promise<ApiResponse<Event[]>> {
    try {
      if (MockWrapperService.isMockMode()) {
        const mockService = MockWrapperService.getMockService();
        const response = await mockService.getEvents({ search: query });
        const events = response.success && response.data ? (response.data as any).events || [] : [];
        const result = { success: true, data: events, statusCode: 200 };
        apiLogger.logMockCall('EventsService', 'searchEvents', { query }, result);
        return result;
      }
      const result = await apiService.get<Event[]>(
        `${API_ENDPOINTS.STUDENTS.EVENTS}?search=${encodeURIComponent(query)}`,
      );
      const events = extractEventsList(result.data ?? result);
      const normalized = { success: true, data: events, statusCode: 200 };
      apiLogger.logServiceCall('EventsService', 'searchEvents', { query }, normalized);
      return normalized;
    } catch (error) {
      apiLogger.logServiceCall('EventsService', 'searchEvents', { query }, null, error);
      throw error;
    }
  }
}

export const eventsService = new EventsService();
export default eventsService;
