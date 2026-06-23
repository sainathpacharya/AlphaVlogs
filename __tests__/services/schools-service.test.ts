import { schoolsService } from '../../src/services/schools-service';
import { isMockMode } from '../../src/config/api-config';

jest.mock('../../src/config/api-config', () => ({
  isMockMode: jest.fn(),
}));

jest.mock('../../src/constants', () => ({
  getApiBaseUrl: () => 'http://192.168.29.26:8080',
  API_ENDPOINTS: {
    SCHOOLS: { GET: '/students/schools' },
  },
}));

const mockIsMockMode = isMockMode as jest.MockedFunction<typeof isMockMode>;

describe('SchoolsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('returns static data in mock mode', async () => {
    mockIsMockMode.mockReturnValue(true);

    const result = await schoolsService.getSchools();

    expect(result.success).toBe(true);
    expect(result.data?.schools).toBeDefined();
    expect(Array.isArray(result.data?.schools)).toBe(true);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('fetches schools from API when not in mock mode', async () => {
    mockIsMockMode.mockReturnValue(false);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        message: 'OK',
        data: { schools: [{ id: 1, name: 'Test School' }], message: 'OK' },
      }),
    });

    const result = await schoolsService.getSchools();

    expect(global.fetch).toHaveBeenCalledWith(
      'http://192.168.29.26:8080/students/schools',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result.success).toBe(true);
    expect(result.data?.schools).toHaveLength(1);
    expect(result.statusCode).toBe(200);
  });

  it('throws on non-ok response then falls back to static data', async () => {
    mockIsMockMode.mockReturnValue(false);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Server error' }),
    });

    const result = await schoolsService.getSchools();

    expect(result.success).toBe(true);
    expect(result.data?.schools?.length).toBeGreaterThan(0);
  });

  it('falls back to static data on network error', async () => {
    mockIsMockMode.mockReturnValue(false);
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network down'));

    const result = await schoolsService.getSchools();

    expect(result.success).toBe(true);
    expect(result.data?.schools).toBeDefined();
  });
});
