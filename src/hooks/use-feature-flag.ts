
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import featureFlagService from '@/services/FeatureFlagService';

// Hook to check if a feature is enabled for the current user
export function useFeatureFlag(featureName: string): boolean {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsEnabled(false);
      return;
    }

    // Get user roles
    const userRoles = Array.isArray(user.roles)
      ? user.roles.map(role => typeof role === 'string' ? role : role.code)
      : [user.role];

    // Determine environment
    const environment = process.env.NODE_ENV === 'production' ? 'Production' : 'Development';
    
    // Check if feature is enabled
    const enabled = featureFlagService.isFeatureEnabled(
      featureName,
      environment,
      userRoles
    );

    setIsEnabled(enabled);
  }, [featureName, user]);

  return isEnabled;
}

export default useFeatureFlag;
