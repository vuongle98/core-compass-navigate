
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
}

export default FeatureFlagService.getInstance();
