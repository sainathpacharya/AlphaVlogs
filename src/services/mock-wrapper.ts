import { mockApiService } from './mock-api';
import { isMockMode } from '@/config/api-config';

// Mock wrapper service that provides a unified interface
export class MockWrapperService {
  // Check if mock mode is enabled
  static isMockMode() {
    return isMockMode();
  }

  // Get mock service instance
  static getMockService() {
    return mockApiService;
  }

  // Helper to convert mock response to standard API response format
  static convertMockResponse<T>(mockResponse: any): any {
    if (mockResponse.success && 'data' in mockResponse) {
      return {
        success: true,
        data: mockResponse.data,
        statusCode: mockResponse.statusCode || 200
      };
    } else {
      return {
        success: false,
        error: mockResponse.error || 'Request failed',
        statusCode: mockResponse.statusCode || 400
      };
    }
  }

  // Helper to check if response has data
  static hasData(response: any): response is { success: true; data: any } {
    return response.success && 'data' in response && response.data !== undefined;
  }

  // Helper to check if response has error
  static hasError(response: any): response is { success: false; error: string } {
    return !response.success && 'error' in response;
  }
}

// Export the mock wrapper
export default MockWrapperService;
