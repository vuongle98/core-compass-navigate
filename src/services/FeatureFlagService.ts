
import { useState, useEffect } from 'react';
import EnhancedApiService from './EnhancedApiService';
import { useAuth } from '@/contexts/AuthContext';

export interface FeatureFlag {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  environment: string;
  createdAt?: string;
  lastUpdated?: string;
  owner?: string;
  category?: string;
  userGroups?: string[]; // User groups that have access to this feature
}

class FeatureFlagService {
  private featureFlags: FeatureFlag[] = [];
  private isLoaded = false;

  constructor() {
    this.loadFeatureFlags();
  }

  // Load feature flags from API or localStorage
  private async loadFeatureFlags(): Promise<void> {
    try {
      const response = await EnhancedApiService.get<FeatureFlag[]>('/api/feature-flags');
      
      if (response.success && response.data) {
        this.featureFlags = response.data;
      } else {
        // Use local mock data if API fails
        this.featureFlags = this.getMockFeatureFlags();
      }
      
      this.isLoaded = true;
    } catch (error) {
      console.error('Failed to load feature flags:', error);
      this.featureFlags = this.getMockFeatureFlags();
      this.isLoaded = true;
    }
  }

  // Get mock feature flags (same as in the FeatureFlags component)
  private getMockFeatureFlags(): FeatureFlag[] {
    return [
      {
        id: 1,
        name: "new_dashboard",
        description: "Enable new dashboard interface",
        enabled: true,
        environment: "All",
        createdAt: "2025-03-15",
        lastUpdated: "2025-04-10",
        owner: "UI Team",
        category: "Interface",
        userGroups: ["ADMIN", "EDITOR"]
      },
      {
        id: 2,
        name: "beta_features",
        description: "Enable beta features for testing",
        enabled: false,
        environment: "Development",
        createdAt: "2025-03-20",
        lastUpdated: "2025-04-05",
        owner: "Product Team",
        category: "Testing",
        userGroups: ["ADMIN"]
      },
      {
        id: 3,
        name: "advanced_analytics",
        description: "Enable advanced analytics module",
        enabled: true,
        environment: "Production",
        createdAt: "2025-02-18",
        lastUpdated: "2025-04-12",
        owner: "Analytics Team",
        category: "Analytics",
        userGroups: ["ADMIN", "EDITOR"]
      },
      {
        id: 4,
        name: "ai_suggestions",
        description: "Enable AI-powered suggestions",
        enabled: false,
        environment: "All",
        createdAt: "2025-03-25",
        lastUpdated: "2025-04-08",
        owner: "AI Team",
        category: "AI & ML",
        userGroups: ["ADMIN"]
      },
      {
        id: 5,
        name: "dark_mode",
        description: "Enable dark mode UI theme",
        enabled: true,
        environment: "All",
        createdAt: "2025-03-10",
        lastUpdated: "2025-04-01",
        owner: "UI Team",
        category: "Interface",
        userGroups: ["ADMIN", "EDITOR", "USER"]
      },
      {
        id: 6,
        name: "enhanced_security",
        description: "Enable additional security measures",
        enabled: true,
        environment: "Production",
        createdAt: "2025-02-28",
        lastUpdated: "2025-04-15",
        owner: "Security Team",
        category: "Security",
        userGroups: ["ADMIN"]
      },
      {
        id: 7,
        name: "chat_system",
        description: "Enable chat functionality",
        enabled: true,
        environment: "All",
        createdAt: "2025-04-10",
        lastUpdated: "2025-04-16",
        owner: "Communication Team",
        category: "Communication",
        userGroups: ["ADMIN", "EDITOR", "USER"]
      },
      {
        id: 8,
        name: "private_messaging",
        description: "Allow private messaging between users",
        enabled: true,
        environment: "All",
        createdAt: "2025-04-10",
        lastUpdated: "2025-04-16",
        owner: "Communication Team",
        category: "Communication",
        userGroups: ["ADMIN", "EDITOR", "USER"]
      },
      {
        id: 9,
        name: "group_chat",
        description: "Allow group chat functionality",
        enabled: true,
        environment: "All",
        createdAt: "2025-04-10",
        lastUpdated: "2025-04-16",
        owner: "Communication Team",
        category: "Communication",
        userGroups: ["ADMIN", "EDITOR"]
      },
    ];
  }

  // Check if a feature is enabled based on name, environment, and user roles
  public isFeatureEnabled(featureName: string, environment = 'All', userRoles: string[] = []): boolean {
    if (!this.isLoaded) {
      return false;
    }

    const feature = this.featureFlags.find(f => f.name === featureName);
    
    if (!feature) {
      return false;
    }

    // Feature must be enabled
    if (!feature.enabled) {
      return false;
    }

    // Check if feature is available in current environment
    if (feature.environment !== 'All' && feature.environment !== environment) {
      return false;
    }

    // Check if user has required role/group (if specified)
    if (feature.userGroups && feature.userGroups.length > 0) {
      const hasRequiredRole = userRoles.some(role => 
        feature.userGroups?.includes(role.toUpperCase())
      );
      
      if (!hasRequiredRole) {
        return false;
      }
    }

    return true;
  }

  // Toggle a feature flag
  public async toggleFeature(id: number, enabled: boolean): Promise<boolean> {
    try {
      const response = await EnhancedApiService.put(`/api/feature-flags/${id}`, { enabled });
      
      if (response.success) {
        // Update local cache
        this.featureFlags = this.featureFlags.map(flag => 
          flag.id === id ? { ...flag, enabled } : flag
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to toggle feature:', error);
      
      // Update local cache even if API fails (for demo)
      this.featureFlags = this.featureFlags.map(flag => 
        flag.id === id ? { ...flag, enabled } : flag
      );
      return true;
    }
  }

  // Get all feature flags
  public getFeatureFlags(): FeatureFlag[] {
    return [...this.featureFlags];
  }
}

// Create singleton instance
const featureFlagService = new FeatureFlagService();
export default featureFlagService;

// React hook to use feature flags
export function useFeatureFlag(featureName: string) {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const userRoles = user?.roles || [];
  
  useEffect(() => {
    // Mock environment - in a real app, this would come from configuration
    const environment = process.env.NODE_ENV === 'development' 
      ? 'Development' 
      : 'Production';
    
    const enabled = featureFlagService.isFeatureEnabled(
      featureName,
      environment,
      Array.isArray(userRoles) 
        ? userRoles.map(r => typeof r === 'string' ? r : r.code)
        : [userRoles as string]
    );
    
    setIsEnabled(enabled);
  }, [featureName, userRoles]);

  return isEnabled;
}
