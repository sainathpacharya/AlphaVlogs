import { MockWrapperService } from '../../src/services/mock-wrapper';
import { isMockMode } from '../../src/config/api-config';
import { mockApiService } from '../../src/services/mock-api';

jest.mock('../../src/config/api-config', () => ({
  isMockMode: jest.fn(),
}));

jest.mock('../../src/services/mock-api', () => ({
  mockApiService: { login: jest.fn() },
}));

const mockIsMockMode = isMockMode as jest.MockedFunction<typeof isMockMode>;

describe('MockWrapperService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isMockMode', () => {
    it('delegates to api config', () => {
      mockIsMockMode.mockReturnValue(true);
      expect(MockWrapperService.isMockMode()).toBe(true);
      expect(mockIsMockMode).toHaveBeenCalled();
    });
  });

  describe('getMockService', () => {
    it('returns mock API service instance', () => {
      expect(MockWrapperService.getMockService()).toBe(mockApiService);
    });
  });

  describe('convertMockResponse', () => {
    it('converts successful mock response', () => {
      const result = MockWrapperService.convertMockResponse({
        success: true,
        data: { id: '1' },
        statusCode: 200,
      });
      expect(result).toEqual({
        success: true,
        data: { id: '1' },
        statusCode: 200,
      });
    });

    it('defaults statusCode on success', () => {
      const result = MockWrapperService.convertMockResponse({
        success: true,
        data: { ok: true },
      });
      expect(result.statusCode).toBe(200);
    });

    it('converts failed mock response', () => {
      const result = MockWrapperService.convertMockResponse({
        success: false,
        error: 'Bad request',
        statusCode: 400,
      });
      expect(result).toEqual({
        success: false,
        error: 'Bad request',
        statusCode: 400,
      });
    });

    it('uses default error message when missing', () => {
      const result = MockWrapperService.convertMockResponse({ success: false });
      expect(result.error).toBe('Request failed');
      expect(result.statusCode).toBe(400);
    });
  });

  describe('hasData', () => {
    it('returns true when response has data', () => {
      expect(
        MockWrapperService.hasData({ success: true, data: { x: 1 } }),
      ).toBe(true);
    });

    it('returns false when data is missing', () => {
      expect(MockWrapperService.hasData({ success: true })).toBe(false);
      expect(MockWrapperService.hasData({ success: false, error: 'x' })).toBe(false);
    });
  });

  describe('hasError', () => {
    it('returns true for error responses', () => {
      expect(
        MockWrapperService.hasError({ success: false, error: 'fail' }),
      ).toBe(true);
    });

    it('returns false for success responses', () => {
      expect(
        MockWrapperService.hasError({ success: true, data: {} }),
      ).toBe(false);
    });
  });
});
