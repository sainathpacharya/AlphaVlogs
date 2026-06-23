import { dashboardService } from '../../src/services/dashboard-service';
import { apiService } from '../../src/services/api';
import { MockWrapperService } from '../../src/services/mock-wrapper';

jest.mock('../../src/services/api', () => ({
  apiService: { get: jest.fn() },
}));

jest.mock('../../src/services/mock-wrapper', () => ({
  MockWrapperService: {
    isMockMode: jest.fn(),
    getMockService: jest.fn(),
  },
}));

jest.mock('../../src/constants', () => ({
  API_ENDPOINTS: { DASHBOARD: { GET: '/dashboard' } },
}));

const mockApi = apiService as jest.Mocked<typeof apiService>;
const mockWrapper = MockWrapperService as jest.Mocked<typeof MockWrapperService>;

describe('dashboard-service integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWrapper.isMockMode.mockReturnValue(false);
  });

  it('returns dashboard data from API', async () => {
    const payload = { user: { id: '1' }, events: [], stats: {} };
    mockApi.get.mockResolvedValue({ success: true, data: payload, statusCode: 200 });

    await expect(dashboardService.getDashboard()).resolves.toEqual(payload);
    expect(mockApi.get).toHaveBeenCalledWith('/dashboard');
  });

  it('returns mock dashboard in mock mode', async () => {
    mockWrapper.isMockMode.mockReturnValue(true);
    mockWrapper.getMockService.mockReturnValue({
      getDashboard: jest.fn().mockResolvedValue({ user: { id: 'user_001' }, events: [] }),
    } as never);

    const result = await dashboardService.getDashboard();

    expect(result.user.id).toBe('user_001');
  });
});
