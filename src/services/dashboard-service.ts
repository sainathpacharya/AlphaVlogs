import { apiService } from './api';
import { DashboardData } from '@/types';
import { API_ENDPOINTS } from '@/constants';
import { MockWrapperService } from './mock-wrapper';

class DashboardService {
  async getDashboard(): Promise<DashboardData> {
    if (MockWrapperService.isMockMode()) {
      const mockResponse = await MockWrapperService.getMockService().getDashboard();
      return mockResponse.data;
    }

    const response = await apiService.get<DashboardData>(API_ENDPOINTS.DASHBOARD.GET);
    return response.data!;
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
