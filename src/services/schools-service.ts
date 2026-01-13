/**
 * Schools Service - Handles school-related API calls
 */

import { API_ENDPOINTS, APP_CONFIG } from '@/constants';
import { ApiResponse } from '@/types';
import { MockWrapperService } from './mock-wrapper';

export interface School {
  id: number;
  createdOn: string;
  schoolCode: string;
  name: string;
  establishedYear: number;
  schoolType: 'PRIVATE' | 'GOVERNMENT_AIDED' | 'OTHER';
  boardOfAffiliation: string;
  mediumOfInstruction: string;
  principalName: string;
  contactNumber: string;
  email: string;
  address: string;
  location: string;
  pincode: string;
  updatedAt: string;
}

export interface SchoolsResponse {
  schools: School[];
  message: string;
}

class SchoolsService {
  private baseUrl = APP_CONFIG.apiUrl;

  /**
   * Fetch all schools from the API
   */
  async getSchools(): Promise<ApiResponse<SchoolsResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.SCHOOLS.GET}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch schools');
      }

      return {
        success: true,
        data: data.data,
        message: data.message || 'Schools fetched successfully',
        statusCode: response.status,
      };
    } catch (error) {
      console.error('SchoolsService.getSchools error:', error);

      // Return mock data in case of error
      return MockWrapperService.convertMockResponse({
        success: true,
        data: {
          schools: [
            {
              id: 1,
              createdOn: '2025-09-11T10:46:10.000+00:00',
              schoolCode: 'SCH001',
              name: 'National Public School',
              establishedYear: 1995,
              schoolType: 'PRIVATE' as const,
              boardOfAffiliation: 'CBSE',
              mediumOfInstruction: 'English',
              principalName: 'Dr. Ramesh Kumar',
              contactNumber: '080-26543210',
              email: 'info@vidyanikethan.edu.in',
              address: 'Rajaji Nagar, Bangalore, Karnataka',
              location: 'Bangalore, Karnataka',
              pincode: '560010',
              updatedAt: '2025-09-11T10:46:10.000+00:00',
            },
            {
              id: 2,
              createdOn: '2025-09-11T10:46:10.000+00:00',
              schoolCode: 'SCH002',
              name: 'Modern High School for Girls',
              establishedYear: 1980,
              schoolType: 'PRIVATE' as const,
              boardOfAffiliation: 'ICSE',
              mediumOfInstruction: 'English',
              principalName: 'Mrs. Anjali Sen',
              contactNumber: '033-23351234',
              email: 'contact@modernhigh.edu.in',
              address: 'Salt Lake, Kolkata, West Bengal',
              location: 'Kolkata, West Bengal',
              pincode: '700091',
              updatedAt: '2025-09-11T10:46:10.000+00:00',
            },
            {
              id: 3,
              createdOn: '2025-09-11T10:46:10.000+00:00',
              schoolCode: 'SCH003',
              name: 'Kendriya Vidyalaya No.1',
              establishedYear: 1965,
              schoolType: 'GOVERNMENT_AIDED' as const,
              boardOfAffiliation: 'CBSE',
              mediumOfInstruction: 'Hindi, English',
              principalName: 'Mr. Rajeev Sharma',
              contactNumber: '011-23745678',
              email: 'principal@kendriya.gov.in',
              address: 'Connaught Place, New Delhi',
              location: 'New Delhi',
              pincode: '110001',
              updatedAt: '2025-09-11T10:46:10.000+00:00',
            },
            {
              id: 4,
              createdOn: '2025-09-11T10:46:10.000+00:00',
              schoolCode: 'SCH004',
              name: 'Padma Seshadri Bala Bhavan',
              establishedYear: 1958,
              schoolType: 'PRIVATE' as const,
              boardOfAffiliation: 'STATE BOARD',
              mediumOfInstruction: 'English, Tamil',
              principalName: 'Mrs. Lalitha Subramanian',
              contactNumber: '044-24567890',
              email: 'info@psbb.edu.in',
              address: 'Gandhi Road, Chennai, Tamil Nadu',
              location: 'Chennai, Tamil Nadu',
              pincode: '600017',
              updatedAt: '2025-09-11T10:46:10.000+00:00',
            },
            {
              id: 5,
              createdOn: '2025-09-11T10:46:10.000+00:00',
              schoolCode: 'SCH005',
              name: 'DAV Public School',
              establishedYear: 1972,
              schoolType: 'PRIVATE' as const,
              boardOfAffiliation: 'CBSE',
              mediumOfInstruction: 'English, Marathi',
              principalName: 'Dr. Meera Joshi',
              contactNumber: '020-25512345',
              email: 'contact@davpune.edu.in',
              address: 'Shivaji Nagar, Pune, Maharashtra',
              location: 'Pune, Maharashtra',
              pincode: '411005',
              updatedAt: '2025-09-11T10:46:10.000+00:00',
            },
            {
              id: 9999,
              createdOn: '2025-09-11T11:21:59.000+00:00',
              schoolCode: 'SCH_OTHER',
              name: 'Other (Enter manually)',
              establishedYear: 0,
              schoolType: 'OTHER' as const,
              boardOfAffiliation: 'N/A',
              mediumOfInstruction: 'N/A',
              principalName: 'N/A',
              contactNumber: 'N/A',
              email: 'other@school.com',
              address: 'N/A',
              location: 'N/A',
              pincode: '000000',
              updatedAt: '2025-09-11T11:21:59.000+00:00',
            },
          ],
          message: 'Schools fetched successfully',
        },
        statusCode: 200,
      });
    }
  }
}

export const schoolsService = new SchoolsService();
