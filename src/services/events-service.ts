import apiService from './api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse, Event, PaginatedResponse } from '@/types';
import { MockWrapperService } from './mock-wrapper';
import { apiLogger } from '@/utils/api-logger';

export interface EventsQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  isActive?: boolean;
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

      const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
      const result = await apiService.get<PaginatedResponse<Event>>(`/events${queryString}`);
      apiLogger.logServiceCall('EventsService', 'getEvents', params, result);
      return result;
    } catch (error) {
      apiLogger.logServiceCall('EventsService', 'getEvents', params, null, error);
      throw error;
    }
  }

  async getEventById(id: string): Promise<ApiResponse<EventDetailResponse>> {
    try {
      const result = await apiService.get<EventDetailResponse>(`/events/${id}`);
      apiLogger.logServiceCall('EventsService', 'getEventById', { id }, result);
      return result;
    } catch (error) {
      apiLogger.logServiceCall('EventsService', 'getEventById', { id }, null, error);
      throw error;
    }
  }

  async getEventCategories(): Promise<ApiResponse<string[]>> {
    try {
      const result = await apiService.get<string[]>('/events/categories');
      apiLogger.logServiceCall('EventsService', 'getEventCategories', null, result);
      return result;
    } catch (error) {
      apiLogger.logServiceCall('EventsService', 'getEventCategories', null, null, error);
      throw error;
    }
  }

  async getEventsByCategory(category: string): Promise<ApiResponse<Event[]>> {
    try {
      const result = await apiService.get<Event[]>(`/events?category=${category}`);
      apiLogger.logServiceCall('EventsService', 'getEventsByCategory', { category }, result);
      return result;
    } catch (error) {
      apiLogger.logServiceCall('EventsService', 'getEventsByCategory', { category }, null, error);
      throw error;
    }
  }

  async searchEvents(query: string): Promise<ApiResponse<Event[]>> {
    try {
      const result = await apiService.get<Event[]>(`/events?search=${encodeURIComponent(query)}`);
      apiLogger.logServiceCall('EventsService', 'searchEvents', { query }, result);
      return result;
    } catch (error) {
      apiLogger.logServiceCall('EventsService', 'searchEvents', { query }, null, error);
      throw error;
    }
  }
}

export const eventsService = new EventsService();
export default eventsService;
