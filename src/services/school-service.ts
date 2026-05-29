import { apiService } from './api';
import { SchoolInvitation, School } from '@/types';
import { API_ENDPOINTS } from '@/constants';
import { isMockMode } from '@/config/api-config';

export interface VerifyInvitationRequest {
  invitationCode: string;
  studentEmail: string;
}

export interface RegisterWithInvitationRequest {
  invitationId: string;
  firstName: string;
  lastName: string;
  password: string;
  grade: string;
  section: string;
  parentEmail?: string;
  parentPhone?: string;
}

class SchoolService {
  // Verify school invitation
  async verifyInvitation(data: VerifyInvitationRequest): Promise<SchoolInvitation | null> {
    try {
      if (isMockMode()) {
        return {
          id: 'inv_static_001',
          schoolId: '1',
          invitationCode: data.invitationCode || 'STATIC01',
          studentEmail: data.studentEmail,
          parentEmail: undefined,
          grade: '5',
          section: 'A',
          isUsed: false,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        };
      }
      const response = await apiService.post<SchoolInvitation>(
        API_ENDPOINTS.SCHOOLS.GET,
        data
      );
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error('Error verifying invitation:', error);
      return null;
    }
  }

  // Register user with school invitation
  async registerWithInvitation(data: RegisterWithInvitationRequest): Promise<{
    success: boolean;
    message: string;
    userId?: string;
  }> {
    try {
      if (isMockMode()) {
        return { success: true, message: 'Registration successful', userId: 'user_static_inv' };
      }
      const response = await apiService.post(
        API_ENDPOINTS.SCHOOLS.GET,
        data
      );
      return {
        success: response.success,
        message: response.message || 'Registration successful',
        userId: response.data?.userId,
      };
    } catch (error) {
      console.error('Error registering with invitation:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.',
      };
    }
  }

  // Get school information
  async getSchoolInfo(schoolId: string): Promise<School | null> {
    try {
      if (isMockMode()) {
        const staticData = require('../data/schools.json') as { schools: Array<Record<string, unknown>> };
        const school = staticData.schools.find((s: any) => String(s.id) === String(schoolId));
        return school ? (school as unknown as School) : null;
      }
      const response = await apiService.get<School>(`/schools/${schoolId}`);
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error('Error fetching school info:', error);
      return null;
    }
  }

  // Check if email is from invited school
  async checkSchoolInvitation(email: string): Promise<{
    hasInvitation: boolean;
    schoolName?: string;
    invitationCode?: string;
  }> {
    try {
      if (isMockMode()) {
        return { hasInvitation: false };
      }
      const response = await apiService.get(`/schools/check-invitation?email=${email}`);
      return {
        hasInvitation: response.success && response.data?.hasInvitation,
        schoolName: response.data?.schoolName,
        invitationCode: response.data?.invitationCode,
      };
    } catch (error) {
      console.error('Error checking school invitation:', error);
      return { hasInvitation: false };
    }
  }

  // Get available grades for school
  async getAvailableGrades(schoolId: string): Promise<string[]> {
    try {
      if (isMockMode()) {
        return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
      }
      const response = await apiService.get<string[]>(`/schools/${schoolId}/grades`);
      return response.success ? response.data || [] : [];
    } catch (error) {
      console.error('Error fetching grades:', error);
      return [];
    }
  }

  // Get sections for a specific grade
  async getSections(schoolId: string, grade: string): Promise<string[]> {
    try {
      if (isMockMode()) {
        return ['A', 'B', 'C', 'D'];
      }
      const response = await apiService.get<string[]>(
        `/schools/${schoolId}/grades/${grade}/sections`
      );
      return response.success ? response.data || [] : [];
    } catch (error) {
      console.error('Error fetching sections:', error);
      return [];
    }
  }

  // Validate invitation code format
  validateInvitationCode(code: string): boolean {
    // Invitation code should be 8-12 characters alphanumeric
    const codeRegex = /^[A-Za-z0-9]{8,12}$/;
    return codeRegex.test(code);
  }

  // Validate student email format
  validateStudentEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate grade format (KG to 10th class)
  validateGrade(grade: string): boolean {
    const validGrades = ['KG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    return validGrades.includes(grade);
  }

  // Validate section format
  validateSection(section: string): boolean {
    // Section should be 1-2 characters (A, B, C, etc.)
    const sectionRegex = /^[A-Za-z]{1,2}$/;
    return sectionRegex.test(section);
  }
}

export const schoolService = new SchoolService();
export default schoolService;
