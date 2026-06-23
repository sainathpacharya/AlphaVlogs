jest.mock('../../src/utils/api-logger', () => ({
  apiLogger: {
    logRequestStart: jest.fn(),
    logRequestSuccess: jest.fn(),
    logRequestError: jest.fn(),
  },
}));
jest.mock('../../src/services/api', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));
jest.mock('../../src/config/api-config', () => ({
  isMockMode: jest.fn(),
}));

import { schoolService } from '../../src/services/school-service';
import { apiService } from '../../src/services/api';
import { isMockMode } from '../../src/config/api-config';

jest.mock('../../src/constants', () => ({
  API_ENDPOINTS: { SCHOOLS: { GET: '/students/schools' } },
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;
const mockIsMockMode = isMockMode as jest.MockedFunction<typeof isMockMode>;

describe('SchoolService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsMockMode.mockReturnValue(false);
  });

  describe('verifyInvitation', () => {
    it('returns mock invitation in mock mode', async () => {
      mockIsMockMode.mockReturnValue(true);

      const result = await schoolService.verifyInvitation({
        invitationCode: 'ABCD1234',
        studentEmail: 'student@test.com',
      });

      expect(result?.invitationCode).toBe('ABCD1234');
      expect(result?.isUsed).toBe(false);
      expect(mockApiService.post).not.toHaveBeenCalled();
    });

    it('returns data from API on success', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: { id: 'inv_1', invitationCode: 'ABCD1234' } as any,
        statusCode: 200,
      });

      const result = await schoolService.verifyInvitation({
        invitationCode: 'ABCD1234',
        studentEmail: 'student@test.com',
      });

      expect(result?.id).toBe('inv_1');
    });

    it('returns null on API failure', async () => {
      mockApiService.post.mockResolvedValue({
        success: false,
        error: 'Invalid',
        statusCode: 400,
      });

      const result = await schoolService.verifyInvitation({
        invitationCode: 'ABCD1234',
        studentEmail: 'student@test.com',
      });

      expect(result).toBeNull();
    });

    it('returns null when API throws', async () => {
      mockApiService.post.mockRejectedValue(new Error('network'));

      const result = await schoolService.verifyInvitation({
        invitationCode: 'ABCD1234',
        studentEmail: 'student@test.com',
      });

      expect(result).toBeNull();
    });
  });

  describe('registerWithInvitation', () => {
    it('returns mock success in mock mode', async () => {
      mockIsMockMode.mockReturnValue(true);

      const result = await schoolService.registerWithInvitation({
        invitationId: 'inv_1',
        firstName: 'A',
        lastName: 'B',
        password: 'secret',
        grade: '5',
        section: 'A',
      });

      expect(result.success).toBe(true);
      expect(result.userId).toBe('user_static_inv');
    });

    it('maps API response', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: { userId: 'user_99' },
        message: 'Registered',
        statusCode: 200,
      });

      const result = await schoolService.registerWithInvitation({
        invitationId: 'inv_1',
        firstName: 'A',
        lastName: 'B',
        password: 'secret',
        grade: '5',
        section: 'A',
      });

      expect(result.success).toBe(true);
      expect(result.userId).toBe('user_99');
    });

    it('returns failure when API throws', async () => {
      mockApiService.post.mockRejectedValue(new Error('fail'));

      const result = await schoolService.registerWithInvitation({
        invitationId: 'inv_1',
        firstName: 'A',
        lastName: 'B',
        password: 'secret',
        grade: '5',
        section: 'A',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('getSchoolInfo', () => {
    it('finds school from static data in mock mode', async () => {
      mockIsMockMode.mockReturnValue(true);

      const result = await schoolService.getSchoolInfo('1');

      expect(result).toBeTruthy();
    });

    it('fetches school from API', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: { id: '2', name: 'API School' } as any,
        statusCode: 200,
      });

      const result = await schoolService.getSchoolInfo('2');

      expect(mockApiService.get).toHaveBeenCalledWith('/schools/2');
      expect(result?.name).toBe('API School');
    });

    it('returns null when API fails', async () => {
      mockApiService.get.mockResolvedValue({ success: false, error: 'x', statusCode: 404 });

      const result = await schoolService.getSchoolInfo('99');

      expect(result).toBeNull();
    });
  });

  describe('checkSchoolInvitation', () => {
    it('returns false in mock mode', async () => {
      mockIsMockMode.mockReturnValue(true);

      const result = await schoolService.checkSchoolInvitation('test@school.com');

      expect(result.hasInvitation).toBe(false);
    });

    it('maps invitation check response', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: {
          hasInvitation: true,
          schoolName: 'ABC',
          invitationCode: 'CODE1234',
        },
        statusCode: 200,
      });

      const result = await schoolService.checkSchoolInvitation('test@school.com');

      expect(result.hasInvitation).toBe(true);
      expect(result.schoolName).toBe('ABC');
    });
  });

  describe('grades and sections', () => {
    it('returns static grades in mock mode', async () => {
      mockIsMockMode.mockReturnValue(true);

      const grades = await schoolService.getAvailableGrades('1');
      expect(grades).toContain('5');
      expect(grades.length).toBe(12);
    });

    it('returns static sections in mock mode', async () => {
      mockIsMockMode.mockReturnValue(true);

      const sections = await schoolService.getSections('1', '5');
      expect(sections).toEqual(['A', 'B', 'C', 'D']);
    });

    it('fetches grades from API', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: ['1', '2'],
        statusCode: 200,
      });

      const grades = await schoolService.getAvailableGrades('1');
      expect(grades).toEqual(['1', '2']);
    });

    it('fetches sections from API', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: ['A', 'B'],
        statusCode: 200,
      });

      const sections = await schoolService.getSections('1', '5');
      expect(sections).toEqual(['A', 'B']);
    });

    it('returns empty arrays on API errors', async () => {
      mockApiService.get.mockRejectedValue(new Error('fail'));

      await expect(schoolService.getAvailableGrades('1')).resolves.toEqual([]);
      await expect(schoolService.getSections('1', '5')).resolves.toEqual([]);
    });
  });

  describe('validators', () => {
    it('validates invitation code format', () => {
      expect(schoolService.validateInvitationCode('ABCD1234')).toBe(true);
      expect(schoolService.validateInvitationCode('short')).toBe(false);
      expect(schoolService.validateInvitationCode('invalid-code!')).toBe(false);
    });

    it('validates student email', () => {
      expect(schoolService.validateStudentEmail('a@b.com')).toBe(true);
      expect(schoolService.validateStudentEmail('bad-email')).toBe(false);
    });

    it('validates grade and section', () => {
      expect(schoolService.validateGrade('KG')).toBe(true);
      expect(schoolService.validateGrade('11')).toBe(false);
      expect(schoolService.validateSection('A')).toBe(true);
      expect(schoolService.validateSection('123')).toBe(false);
    });
  });
});
