import axios from 'axios';
import { FeatureFlag } from '@/types/FeatureFlag';

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
      const response = await axios.get('/api/feature-flags');
      return response.data; // Assume the API returns the array directly
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      return [];
    }
  }

  getFlag(flagId: string): FeatureFlag | undefined {
    return this.flags.find(flag => flag.id === flagId);
  }

  isFeatureEnabled(flagId: string): boolean {
    const flag = this.getFlag(flagId);
    return flag ? flag.enabled : false; // Default to false if flag not found
  }

  async createFlag(flag: Omit<FeatureFlag, 'id'>): Promise<FeatureFlag | null> {
    try {
      const response = await axios.post('/api/feature-flags', flag);
      const newFlag: FeatureFlag = response.data;
      this.flags.push(newFlag);
      this.notifyListeners();
      return newFlag;
    } catch (error) {
      console.error('Error creating feature flag:', error);
      return null;
    }
  }

  async updateFlag(id: string, updates: Partial<FeatureFlag>): Promise<boolean> {
    try {
      const response = await axios.put(`/api/feature-flags/${id}`, updates);
      return true; // Success is determined by the request not throwing an error
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
}

export default FeatureFlagService;
