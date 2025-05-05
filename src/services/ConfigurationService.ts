import EnhancedApiService from "./EnhancedApiService";
import LoggingService from "./LoggingService";
import { toast } from "sonner";

export interface ConfigurationItem {
  id: number;
  key: string;
  value: string;
  description: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Service for system configuration operations
 */
class ConfigurationService {
  private static API_ENDPOINT = "/api/config";

  /**
   * Get all configuration items
   * @returns List of configuration items
   */
  static async getAll(): Promise<ConfigurationItem[]> {
    try {
      LoggingService.info(
        "configuration",
        "get_all",
        "Fetching all configuration items"
      );
      return await EnhancedApiService.get<ConfigurationItem[]>(
        this.API_ENDPOINT
      );
    } catch (error) {
      LoggingService.error(
        "configuration",
        "get_all_failed",
        "Failed to fetch all configuration items",
        error
      );
      toast.error("Failed to fetch configuration items");
      return [];
    }
  }

  /**
   * Get a configuration item by key
   * @param key The configuration key
   * @returns The configuration item or undefined if not found
   */
  static async getByKey(key: string): Promise<ConfigurationItem | undefined> {
    try {
      LoggingService.info(
        "configuration",
        "get_by_key",
        `Fetching configuration item with key: ${key}`
      );
      return await EnhancedApiService.get<ConfigurationItem>(
        `${this.API_ENDPOINT}/${key}`
      );
    } catch (error) {
      LoggingService.error(
        "configuration",
        "get_by_key_failed",
        `Failed to fetch configuration item with key: ${key}`,
        error
      );
      return undefined;
    }
  }

  /**
   * Update a configuration item
   * @param id The configuration item ID
   * @param value The new value
   * @returns The updated configuration item
   */
  static async update(
    id: number,
    value: string
  ): Promise<ConfigurationItem | undefined> {
    try {
      LoggingService.info(
        "configuration",
        "update",
        `Updating configuration item ${id} with value ${value}`
      );
      return await EnhancedApiService.put<ConfigurationItem>(
        `${this.API_ENDPOINT}/${id}`,
        { value }
      );
    } catch (error) {
      LoggingService.error(
        "configuration",
        "update_failed",
        `Failed to update configuration item ${id} with value ${value}`,
        error
      );
      toast.error("Failed to update configuration item");
      return undefined;
    }
  }

  /**
   * Get configuration for a specific category
   * @param category The category name
   * @returns List of configuration items in the category
   */
  static async getByCategory(category: string): Promise<ConfigurationItem[]> {
    try {
      LoggingService.info(
        "configuration",
        "get_by_category",
        `Fetching configuration items for category: ${category}`
      );
      return await EnhancedApiService.get<ConfigurationItem[]>(
        `${this.API_ENDPOINT}/category/${category}`
      );
    } catch (error) {
      LoggingService.error(
        "configuration",
        "get_by_category_failed",
        `Failed to fetch configuration items for category: ${category}`,
        error
      );
      return [];
    }
  }
}

export default ConfigurationService;
