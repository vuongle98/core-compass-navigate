
import axios from 'axios';
import { FeatureFlag, FeatureFlagResponse } from '@/types/FeatureFlag';

class FeatureFlagService {
  private static instance: FeatureFlagService;
  private flags: FeatureFlag[] = [];
  private listeners: ((flags: FeatureFlag[]) => void)[] = [];

  private constructor() {
    this.initializeFlags();
  }

  public static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  private async initializeFlags(): Promise<void> {
    try {
      const initialFlags = await this.getAllFlags();
      this.flags = initialFlags;
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to initialize feature flags:', error);
    }
  }

  async getAllFlags(): Promise<FeatureFlag[]> {
    try {
      const response = await axios.get<FeatureFlagResponse>('/api/feature-flags');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      return [];
    }
  }

  getFlag(flagId: string): FeatureFlag | undefined {
    return this.flags.find(flag => flag.id === flagId);
  }

  isFeatureEnabled(flagId: string, environment?: string, roles?: string[]): boolean {
    const flag = this.getFlag(flagId);
    
    // If flag doesn't exist, it's disabled
    if (!flag) return false;
    
    // Check if the flag is globally enabled
    if (!flag.enabled) return false;
    
    // Check environment restrictions if applicable
    if (environment && flag.audience === environment) return true;
    
    // Check role restrictions if applicable
    if (roles && roles.length > 0 && flag.audience) {
      // If flag audience is specific to a role, check if user has that role
      return roles.some(role => flag.audience === role);
    }
    
    // If no specific restrictions, respect the enabled flag
    return flag.enabled;
  }

  async createFlag(flag: Omit<FeatureFlag, 'id'>): Promise<FeatureFlag | null> {
    try {
      const response = await axios.post<{ success: boolean, data: FeatureFlag }>('/api/feature-flags', flag);
      if (response.data && response.data.success) {
        const newFlag: FeatureFlag = response.data.data;
        this.flags.push(newFlag);
        this.notifyListeners();
        return newFlag;
      }
      return null;
    } catch (error) {
      console.error('Error creating feature flag:', error);
      return null;
    }
  }

  async updateFlag(id: string, updates: Partial<FeatureFlag>): Promise<boolean> {
    try {
      const response = await axios.put(`/api/feature-flags/${id}`, updates);
      if (response.status >= 200 && response.status < 300) {
        // Update local cache if the API call was successful
        this.flags = this.flags.map(flag =>
          flag.id === id ? { ...flag, ...updates } : flag
        );
        this.notifyListeners();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating feature flag:', error);
      return false;
    }
  }

  async deleteFlag(flagId: string): Promise<boolean> {
    try {
      await axios.delete(`/api/feature-flags/${flagId}`);
      this.flags = this.flags.filter(flag => flag.id !== flagId);
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Error deleting feature flag:', error);
      return false;
    }
  }

  subscribe(listener: (flags: FeatureFlag[]) => void): void {
    this.listeners.push(listener);
  }

  unsubscribe(listener: (flags: FeatureFlag[]) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.flags));
  }

  async setFlagState(flagId: string, enabled: boolean): Promise<boolean> {
    try {
      const response = await axios.patch(`/api/feature-flags/${flagId}`, { enabled });
      if (response.status === 200) {
        this.flags = this.flags.map(flag =>
          flag.id === flagId ? { ...flag, enabled } : flag
        );
        this.notifyListeners();
        return true;
      } else {
        console.error('Failed to set flag state:', response.status, response.data);
        return false;
      }
    } catch (error) {
      console.error('Error setting flag state:', error);
      return false;
    }
  }

  // Add static method for refreshFlags
  static async refreshFlags(): Promise<boolean> {
    return FeatureFlagService.getInstance().refreshFlags();
  }

  // Add the refreshFlags method
  async refreshFlags(): Promise<boolean> {
    try {
      const flags = await this.getAllFlags();
      this.flags = flags;
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Error refreshing feature flags:', error);
      return false;
    }
  }

  // Static method for isFeatureEnabled
  static isFeatureEnabled(flagId: string, environment?: string, roles?: string[]): boolean {
    return FeatureFlagService.getInstance().isFeatureEnabled(flagId, environment, roles);
  }
}

export default FeatureFlagService;
