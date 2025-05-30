import { FeatureFlag } from "@/types/Configuration";
import EnhancedApiService from "./EnhancedApiService";
import LoggingService from "./LoggingService";

/**
 * Service for feature flags operations
 */
class FeatureFlagService {
  private static API_ENDPOINT = "/api/featureFlag";
  private static cachedFlags: Record<string, boolean> = {};

  /**
   * Get all feature flags
   * @returns List of feature flags
   */
  static async getAll(): Promise<FeatureFlag[]> {
    try {
      LoggingService.info(
        "feature_flags",
        "get_all",
        "Fetching all feature flags"
      );
      return (
        await EnhancedApiService.getPaginated<FeatureFlag>(this.API_ENDPOINT)
      ).content;
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
      LoggingService.info(
        "feature_flags",
        "get_by_key",
        `Fetching feature flag with key: ${key}`
      );
      return await EnhancedApiService.get<FeatureFlag>(
        `${this.API_ENDPOINT}/${key}`
      );
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
   * Check if a feature is enabled based on user's environment and roles
   * @param key Feature flag key
   * @param environment Current environment
   * @param roles User roles
   * @returns Whether the feature is enabled
   */
  static isFeatureEnabled(
    key: string,
    environment: string,
    roles: string[]
  ): boolean {
    // Check cached flags first
    if (this.cachedFlags[key] !== undefined) {
      return this.cachedFlags[key];
    }

    // Default to false if not found
    return false;
  }

  /**
   * Refresh all feature flags from the server
   */
  static async refreshFlags(): Promise<void> {
    try {
      const flags = await this.getAll();

      // Update cache
      flags.forEach((flag) => {
        this.cachedFlags[flag.name] = flag.enabled;
      });

      LoggingService.info(
        "feature_flags",
        "refresh_flags",
        "Refreshed feature flags"
      );
    } catch (error) {
      LoggingService.error(
        "feature_flags",
        "refresh_flags_failed",
        "Failed to refresh feature flags",
        error
      );
    }
  }

  /**
   * Toggle a feature flag
   * @param id The feature flag ID
   * @param isActive True to enable, false to disable
   * @returns The updated feature flag
   */
  static async toggle(id: number): Promise<FeatureFlag | undefined> {
    try {
      LoggingService.info(
        "feature_flags",
        "toggle",
        `Toggling feature flag ${id}`
      );
      return await EnhancedApiService.put<FeatureFlag>(
        `${this.API_ENDPOINT}/${id}/toggle`
      );
    } catch (error) {
      LoggingService.error(
        "feature_flags",
        "toggle_failed",
        `Failed to toggle feature flag ${id}`,
        error
      );
      return undefined;
    }
  }

  /**
   * Create a new feature flag
   * @param flag The feature flag to create
   * @returns The created feature flag
   */
  static async create(
    flag: Partial<FeatureFlag>
  ): Promise<FeatureFlag | undefined> {
    try {
      LoggingService.info(
        "feature_flags",
        "create",
        `Creating feature flag ${flag.name}`
      );
      return await EnhancedApiService.post<FeatureFlag>(
        this.API_ENDPOINT,
        flag
      );
    } catch (error) {
      LoggingService.error(
        "feature_flags",
        "create_failed",
        `Failed to create feature flag ${flag.name}`,
        error
      );
      return undefined;
    }
  }
  /**
   * Update an existing feature flag
   * @param flag The feature flag to update
   * @returns The updated feature flag
   */
  static async update(
    id: number,
    flag: Partial<FeatureFlag>
  ): Promise<FeatureFlag | undefined> {
    try {
      LoggingService.info(
        "feature_flags",
        "update",
        `Updating feature flag ${flag.name}`
      );
      return await EnhancedApiService.put<FeatureFlag>(
        `${this.API_ENDPOINT}/${id}`,
        flag
      );
    } catch (error) {
      LoggingService.error(
        "feature_flags",
        "update_failed",
        `Failed to update feature flag ${flag.name}`,
        error
      );
      return undefined;
    }
  }

  /**
   * Delete a feature flag
   * @param id The feature flag ID
   * @returns True if deleted, false otherwise
   */
  static async delete(id: number): Promise<boolean> {
    try {
      LoggingService.info(
        "feature_flags",
        "delete",
        `Deleting feature flag ${id}`
      );
      await EnhancedApiService.delete(`${this.API_ENDPOINT}/${id}`);
      return true;
    } catch (error) {
      LoggingService.error(
        "feature_flags",
        "delete_failed",
        `Failed to delete feature flag ${id}`,
        error
      );
      return false;
    }
  }
}

export default FeatureFlagService;
