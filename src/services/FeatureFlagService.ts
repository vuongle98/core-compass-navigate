
import LoggingService from './LoggingService';
import { FeatureFlag, FeatureFlagConfig } from '@/types/FeatureFlag';

class FeatureFlagService {
  private static flags: Map<string, FeatureFlag> = new Map();
  private static instance: FeatureFlagService;
  
  private constructor() {
    // Private constructor to enforce singleton
    this.initializeDefaults();
  }
  
  static getInstance() {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }
  
  private initializeDefaults() {
    // Set up default feature flags
    this.registerFeatureFlag({
      key: 'darkMode',
      enabled: true,
      description: 'Enable dark mode UI',
      group: 'ui'
    });
    
    this.registerFeatureFlag({
      key: 'analytics',
      enabled: false,
      description: 'Enable analytics tracking',
      group: 'tracking'
    });
    
    this.registerFeatureFlag({
      key: 'betaFeatures',
      enabled: false,
      description: 'Enable beta features',
      group: 'experimental'
    });
    
    this.registerFeatureFlag({
      key: 'newDashboard',
      enabled: false,
      description: 'Enable new dashboard UI',
      group: 'ui'
    });

    this.registerFeatureFlag({
      key: 'chat_system',
      enabled: true,
      description: 'Enable chat system',
      group: 'feature'
    });
    
    LoggingService.info('feature_flags', 'initialized', 'Feature flags initialized with defaults');
  }
  
  registerFeatureFlag(config: FeatureFlagConfig) {
    try {
      const newFlag: FeatureFlag = {
        ...config,
        lastUpdated: new Date().toISOString()
      };
      
      FeatureFlagService.flags.set(config.key, newFlag);
      LoggingService.debug('feature_flags', 'registered', `Feature flag registered: ${config.key}`);
    } catch (error) {
      LoggingService.warn('feature_flags', 'register_failed', `Failed to register feature flag: ${config.key}`);
    }
  }
  
  isEnabled(key: string): boolean {
    try {
      const flag = FeatureFlagService.flags.get(key);
      if (!flag) {
        LoggingService.warn('feature_flags', 'not_found', `Feature flag not found: ${key}`);
        return false;
      }
      
      return flag.enabled;
    } catch (error) {
      LoggingService.error('feature_flags', 'check_failed', `Error checking feature flag: ${key}`);
      return false;
    }
  }
  
  setFeatureFlag(key: string, enabled: boolean) {
    try {
      const flag = FeatureFlagService.flags.get(key);
      if (!flag) {
        LoggingService.warn('feature_flags', 'update_failed', `Feature flag not found: ${key}`);
        return;
      }
      
      flag.enabled = enabled;
      flag.lastUpdated = new Date().toISOString();
      FeatureFlagService.flags.set(key, flag);
      LoggingService.info('feature_flags', 'updated', `Feature flag updated: ${key} = ${enabled}`);
    } catch (error) {
      LoggingService.error('feature_flags', 'update_failed', `Error updating feature flag: ${key}`);
    }
  }
  
  getAllFlags(): FeatureFlag[] {
    return Array.from(FeatureFlagService.flags.values());
  }
  
  getFlagsByGroup(group: string): FeatureFlag[] {
    try {
      return Array.from(FeatureFlagService.flags.values())
        .filter(flag => flag.group === group);
    } catch (error) {
      LoggingService.error('feature_flags', 'get_group_failed', `Error fetching flags by group: ${group}`);
      return [];
    }
  }

  // Add the missing isFeatureEnabled method required by the hook
  isFeatureEnabled(featureName: string, environment?: string, userRoles?: string[]): boolean {
    try {
      const flag = FeatureFlagService.flags.get(featureName);
      if (!flag) {
        LoggingService.warn('feature_flags', 'not_found', `Feature flag not found: ${featureName}`);
        return false;
      }

      // If flag is not enabled at all, return false
      if (!flag.enabled) return false;

      // Check environment restrictions
      if (flag.environments && flag.environments.length > 0) {
        if (!environment || !flag.environments.includes(environment)) {
          return false;
        }
      }

      // Check role restrictions
      if (flag.roles && flag.roles.length > 0 && userRoles) {
        // Check if user has any of the required roles
        const hasRequiredRole = userRoles.some(role => 
          flag.roles?.includes(role)
        );
        
        if (!hasRequiredRole) return false;
      }

      return true;
    } catch (error) {
      LoggingService.error('feature_flags', 'check_failed', `Error checking feature flag: ${featureName}`);
      return false;
    }
  }

  // Add the refreshFlags method required by AuthContext
  async refreshFlags(): Promise<void> {
    try {
      LoggingService.info('feature_flags', 'refresh', 'Refreshing feature flags');
      
      // In a real implementation, this would fetch flags from an API
      // For now, we'll just log the action and resolve immediately
      
      // Simulate a network request
      await new Promise(resolve => setTimeout(resolve, 100));
      
      LoggingService.info('feature_flags', 'refresh_success', 'Feature flags refreshed successfully');
    } catch (error) {
      LoggingService.error('feature_flags', 'refresh_failed', 'Failed to refresh feature flags', error);
    }
  }
}

export default FeatureFlagService.getInstance();
