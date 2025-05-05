
import EnhancedApiService from "./EnhancedApiService";
import LoggingService from "./LoggingService";

export interface FeatureFlag {
  id: number;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Service for feature flags operations
 */
class FeatureFlagsService {
  private static API_ENDPOINT = "/api/feature-flags";

  /**
   * Get all feature flags
   * @returns List of feature flags
   */
  static async getAll(): Promise<FeatureFlag[]> {
    try {
      LoggingService.info("feature_flags", "get_all", "Fetching all feature flags");
      return await EnhancedApiService.get<FeatureFlag[]>(this.API_ENDPOINT);
    } catch (error) {
      LoggingService.error(
        "feature_flags",
        "get_all_failed",
        "Failed to fetch all feature flags",
        error
      );
      return [];
    }
  }

  /**
   * Get a feature flag by key
   * @param key The feature flag key
   * @returns The feature flag or undefined if not found
   */
  static async getByKey(key: string): Promise<FeatureFlag | undefined> {
    try {
      LoggingService.info("feature_flags", "get_by_key", `Fetching feature flag with key: ${key}`);
      return await EnhancedApiService.get<FeatureFlag>(`${this.API_ENDPOINT}/${key}`);
    } catch (error) {
      LoggingService.error(
        "feature_flags",
        "get_by_key_failed",
        `Failed to fetch feature flag with key: ${key}`,
        error
      );
      return undefined;
    }
  }

  /**
   * Check if a feature flag is enabled
   * @param key The feature flag key
   * @returns True if enabled, false otherwise
   */
  static async isEnabled(key: string): Promise<boolean> {
    try {
      const flag = await this.getByKey(key);
      return flag?.enabled || false;
    } catch (error) {
      LoggingService.error(
        "feature_flags",
        "is_enabled_failed",
        `Failed to check if feature flag is enabled: ${key}`,
        error
      );
      return false;
    }
  }

  /**
   * Toggle a feature flag
   * @param id The feature flag ID
   * @param enabled True to enable, false to disable
   * @returns The updated feature flag
   */
  static async toggle(id: number, enabled: boolean): Promise<FeatureFlag | undefined> {
    try {
      LoggingService.info("feature_flags", "toggle", `Toggling feature flag ${id} to ${enabled}`);
      return await EnhancedApiService.put<FeatureFlag>(`${this.API_ENDPOINT}/${id}/toggle`, { enabled });
    } catch (error) {
      LoggingService.error(
        "feature_flags",
        "toggle_failed",
        `Failed to toggle feature flag ${id} to ${enabled}`,
        error
      );
      return undefined;
    }
  }
}

export default FeatureFlagsService;
