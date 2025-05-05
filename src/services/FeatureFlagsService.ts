
import EnhancedApiService from './EnhancedApiService';
import { FeatureFlag } from '@/types/FeatureFlag';
import { ApiResponse, PageData } from '@/types/Common';

class FeatureFlagsService {
  private static BASE_URL = '/api/v1/feature-flags';

  static async getAll(params: any = {}): Promise<PageData<FeatureFlag>> {
    try {
      return await EnhancedApiService.get<PageData<FeatureFlag>>(this.BASE_URL, { params });
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      throw error;
    }
  }

  static async get(id: string): Promise<ApiResponse<FeatureFlag>> {
    try {
      const response = await EnhancedApiService.get<FeatureFlag>(`${this.BASE_URL}/${id}`);
      return {
        success: true,
        message: 'Feature flag retrieved successfully',
        data: response,
        error: null
      };
    } catch (error) {
      console.error(`Error fetching feature flag ${id}:`, error);
      return {
        success: false,
        message: 'Failed to fetch feature flag',
        data: {} as FeatureFlag,
        error: 'An error occurred while fetching the feature flag'
      };
    }
  }

  static async create(data: Partial<FeatureFlag>): Promise<ApiResponse<FeatureFlag>> {
    try {
      const response = await EnhancedApiService.post<FeatureFlag>(this.BASE_URL, data);
      return {
        success: true,
        message: 'Feature flag created successfully',
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Error creating feature flag:', error);
      return {
        success: false,
        message: 'Failed to create feature flag',
        data: {} as FeatureFlag,
        error: 'An error occurred while creating the feature flag'
      };
    }
  }

  static async update(id: string, data: Partial<FeatureFlag>): Promise<ApiResponse<FeatureFlag>> {
    try {
      const response = await EnhancedApiService.put<FeatureFlag>(`${this.BASE_URL}/${id}`, data);
      return {
        success: true,
        message: 'Feature flag updated successfully',
        data: response,
        error: null
      };
    } catch (error) {
      console.error(`Error updating feature flag ${id}:`, error);
      return {
        success: false,
        message: 'Failed to update feature flag',
        data: {} as FeatureFlag,
        error: 'An error occurred while updating the feature flag'
      };
    }
  }

  static async delete(id: string): Promise<ApiResponse<void>> {
    try {
      await EnhancedApiService.delete(`${this.BASE_URL}/${id}`);
      return {
        success: true,
        message: 'Feature flag deleted successfully',
        data: undefined,
        error: null
      };
    } catch (error) {
      console.error(`Error deleting feature flag ${id}:`, error);
      return {
        success: false,
        message: 'Failed to delete feature flag',
        data: undefined,
        error: 'An error occurred while deleting the feature flag'
      };
    }
  }

  static async toggle(id: string, isActive: boolean): Promise<ApiResponse<FeatureFlag>> {
    try {
      const response = await EnhancedApiService.patch<FeatureFlag>(`${this.BASE_URL}/${id}/toggle`, { isActive });
      return {
        success: true,
        message: `Feature flag ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: response,
        error: null
      };
    } catch (error) {
      console.error(`Error toggling feature flag ${id}:`, error);
      return {
        success: false,
        message: 'Failed to toggle feature flag',
        data: {} as FeatureFlag,
        error: 'An error occurred while toggling the feature flag'
      };
    }
  }
  
  static isFeatureEnabled(flagName: string, userId?: string): boolean {
    // Mock implementation, in real world would check against state or API
    return true;
  }
  
  static refreshFlags(): Promise<void> {
    // Mock implementation, in real world would refresh flags from API
    return Promise.resolve();
  }
}

export default FeatureFlagsService;
