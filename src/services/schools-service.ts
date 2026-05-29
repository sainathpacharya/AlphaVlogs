/**
 * Schools Service - Handles school-related API calls.
 * Uses static data when API_CONFIG.MODE === 'mock' (no network).
 */

import { API_ENDPOINTS, getApiBaseUrl } from '@/constants';
import { ApiResponse } from '@/types';
import { MockWrapperService } from './mock-wrapper';
import { isMockMode } from '@/config/api-config';

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
  private get baseUrl() {
    return getApiBaseUrl();
  }

  /**
   * Fetch all schools from the API (or static data when in mock mode)
   */
  async getSchools(): Promise<ApiResponse<SchoolsResponse>> {
    try {
      if (isMockMode()) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const staticData = require('../data/schools.json') as { schools: School[]; message: string };
        return {
          success: true,
          data: staticData,
          message: staticData.message || 'Schools fetched successfully',
          statusCode: 200,
        };
      }

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

      // Return static data in case of error (offline/fallback)
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const staticData = require('../data/schools.json') as { schools: School[]; message: string };
      return {
        success: true,
        data: staticData,
        message: staticData.message || 'Schools fetched successfully',
        statusCode: 200,
      };
    }
  }
}

export const schoolsService = new SchoolsService();
