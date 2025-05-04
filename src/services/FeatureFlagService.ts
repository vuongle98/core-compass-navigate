
import EnhancedApiService from './EnhancedApiService';
import { FeatureFlag } from '@/types/FeatureFlag';

class FeatureFlagService {
  private static flagCache: Map<string, FeatureFlag> = new Map();
  private static lastFetch: number = 0;
  private static cacheDuration: number = 5 * 60 * 1000; // 5 minutes

  /**
   * Fetches all feature flags from the API
   */
  public static async getFlags(): Promise<FeatureFlag[]> {
    try {
      // Only fetch if cache is expired
      const now = Date.now();
      if (now - this.lastFetch > this.cacheDuration) {
        const response = await EnhancedApiService.get<FeatureFlag[]>('/api/feature-flags');
        
        // Update cache
        this.flagCache.clear();
        response.forEach(flag => {
          this.flagCache.set(flag.key, flag);
        });
        
        this.lastFetch = now;
        return response;
      }
      
      // Return from cache
      return Array.from(this.flagCache.values());
    } catch (error) {
      console.error('Failed to fetch feature flags:', error);
      return Array.from(this.flagCache.values());
    }
  }

  /**
   * Refreshes the feature flag cache
   */
  public static async refreshFlags(): Promise<void> {
    try {
      const response = await EnhancedApiService.get<FeatureFlag[]>('/api/feature-flags');
      
      // Update cache
      this.flagCache.clear();
      response.forEach(flag => {
        this.flagCache.set(flag.key, flag);
      });
      
      this.lastFetch = Date.now();
    } catch (error) {
      console.error('Failed to refresh feature flags:', error);
    }
  }

  /**
   * Checks if a feature flag is enabled
   * @param flagKey The feature flag key
   * @param environment Current environment
   * @param userRoles User roles to check against
   * @returns boolean indicating if the feature is enabled
   */
  public static isFeatureEnabled(flagKey: string, environment: string, userRoles: string[]): boolean {
    const flag = this.flagCache.get(flagKey);
    
    // If flag doesn't exist, default to disabled
    if (!flag) {
      return false;
    }
    
    // Check if flag is globally enabled
    if (!flag.enabled) {
      return false;
    }
    
    // Check environment restrictions
    if (flag.environments && flag.environments.length > 0) {
      if (!flag.environments.includes(environment)) {
        return false;
      }
    }
    
    // Check role restrictions
    if (flag.roles && flag.roles.length > 0) {
      // If no user roles or no match, feature is disabled
      if (!userRoles || userRoles.length === 0) {
        return false;
      }
      
      // Check if user has any of the required roles
      const hasRequiredRole = userRoles.some(role => 
        flag.roles!.includes(role)
      );
      
      if (!hasRequiredRole) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Updates a feature flag
   * @param flag The feature flag to update
   */
  public static async updateFlag(flag: FeatureFlag): Promise<FeatureFlag> {
    const response = await EnhancedApiService.put<FeatureFlag>(`/api/feature-flags/${flag.id}`, flag);
    
    // Update cache
    this.flagCache.set(flag.key, response);
    
    return response;
  }

  /**
   * Creates a new feature flag
   * @param flag The feature flag to create
   */
  public static async createFlag(flag: FeatureFlag): Promise<FeatureFlag> {
    const response = await EnhancedApiService.post<FeatureFlag>('/api/feature-flags', flag);
    
    // Update cache
    this.flagCache.set(flag.key, response);
    
    return response;
  }

  /**
   * Deletes a feature flag
   * @param id The ID of the feature flag to delete
   */
  public static async deleteFlag(id: string): Promise<void> {
    await EnhancedApiService.delete(`/api/feature-flags/${id}`);
    
    // Remove from cache
    for (const [key, flag] of this.flagCache.entries()) {
      if (flag.id === id) {
        this.flagCache.delete(key);
        break;
      }
    }
  }
}

export default FeatureFlagService;
