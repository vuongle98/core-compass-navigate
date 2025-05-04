
import { DEFAULT_ROLES } from '@/types/Auth';
import { FeatureFlag } from '@/types/FeatureFlag';
import LoggingService from './LoggingService';

class FeatureFlagService {
  private static features: FeatureFlag[] = [
    {
      id: "new-dashboard",
      key: "new-dashboard",
      name: "New Dashboard UI",
      description: "Enable the new dashboard UI",
      enabled: true,
      environments: ["development", "staging"],
      roles: ["ADMIN", "EDITOR"]
    },
    {
      id: "advanced-analytics",
      key: "advanced-analytics",
      name: "Advanced Analytics",
      description: "Enable advanced analytics features",
      enabled: false,
      environments: ["development"],
      roles: ["ADMIN"]
    },
    {
      id: "beta-features",
      key: "beta-features",
      name: "Beta Features",
      description: "Enable experimental beta features",
      enabled: true,
      environments: ["development"],
      roles: ["ADMIN", "MODERATOR"]
    }
  ];

  /**
   * Check if a feature is enabled
   */
  public static isFeatureEnabled(
    featureKey: string,
    environment: string,
    userRoles: string[]
  ): boolean {
    try {
      // Find the feature by key
      const feature = this.features.find(f => f.key === featureKey || f.id === featureKey);
      
      // If feature doesn't exist, it's disabled
      if (!feature) {
        LoggingService.warning('feature_flags', 'feature_not_found', `Feature not found: ${featureKey}`);
        return false;
      }
      
      // If feature is not enabled globally, it's disabled
      if (!feature.enabled) {
        return false;
      }
      
      // Check environment
      if (feature.environments && feature.environments.length > 0) {
        const envMatch = feature.environments.some(env => 
          env.toLowerCase() === environment.toLowerCase() || env === '*' || env === 'all'
        );
        
        if (!envMatch) {
          return false;
        }
      }
      
      // Check user roles
      if (feature.roles && feature.roles.length > 0) {
        // Admin always has access to all features
        if (userRoles.some(role => role === 'ADMIN' || role === 'admin')) {
          return true;
        }
        
        // For other roles, check if there's a match
        const roleMatch = feature.roles.some(role => 
          userRoles.some(userRole => 
            userRole.toUpperCase() === role.toUpperCase()
          )
        );
        
        if (!roleMatch) {
          return false;
        }
      }
      
      // All checks passed, feature is enabled
      return true;
    } catch (error) {
      LoggingService.error('feature_flags', 'check_failed', `Error checking feature: ${featureKey}`, error);
      return false;
    }
  }

  /**
   * Refresh feature flags from server/storage
   */
  public static async refreshFlags(): Promise<void> {
    try {
      LoggingService.info('feature_flags', 'refresh', 'Refreshing feature flags');
      // In a real app, this would fetch from an API
      // For now, we'll just use a timeout to simulate a network request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      LoggingService.info('feature_flags', 'refresh_complete', 'Feature flags refreshed');
      return;
    } catch (error) {
      LoggingService.error('feature_flags', 'refresh_failed', 'Failed to refresh feature flags', error);
      throw error;
    }
  }

  /**
   * Get all features
   */
  public static getAllFeatures(): FeatureFlag[] {
    return [...this.features];
  }

  /**
   * Update a feature flag
   */
  public static updateFeature(featureId: string, updatedFeature: Partial<FeatureFlag>): boolean {
    const index = this.features.findIndex(f => f.id === featureId);
    
    if (index === -1) {
      return false;
    }
    
    this.features[index] = {
      ...this.features[index],
      ...updatedFeature,
      updatedAt: new Date().toISOString()
    };
    
    return true;
  }
}

export default FeatureFlagService;
