import { dashboardService } from '../../src/services/dashboard-service';

// Mock the API service
jest.mock('../../src/services/api', () => ({
  apiService: {
    get: jest.fn(),
  },
}));

describe('Dashboard Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(dashboardService).toBeDefined();
  });

  it('should have getDashboard method', () => {
    expect(dashboardService.getDashboard).toBeDefined();
    expect(typeof dashboardService.getDashboard).toBe('function');
  });
});
