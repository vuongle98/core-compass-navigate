import EnhancedApiService from "./EnhancedApiService";
import LoggingService from "./LoggingService";
import { FileItem } from "../types/Storage";
import { SearchResult } from "@/types/Common";

/**
 * Service for file related operations
 */
class SearchService {
  private static API_ENDPOINT = "/api/search";

  /**
   * Get a paginated list of file Files
   * @param params - Optional parameters for pagination and filtering
   * @returns A paginated list of Files
   */
  static async searchMenu(params?: Record<string, string>) {
    try {
      LoggingService.info("file_service", "get_files", "Fetching Files");
      return await EnhancedApiService.getPaginated<SearchResult>(
        this.API_ENDPOINT,
        {},
        params
      );
    } catch (error) {
      LoggingService.error(
        "search_service",
        "get_search_menu_failed",
        "Failed to fetch search menu",
        error
      );
      throw error;
    }
  }
}

export default SearchService;
