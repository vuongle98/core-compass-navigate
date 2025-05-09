import EnhancedApiService from "./EnhancedApiService";
import LoggingService from "./LoggingService";
import { FileItem } from "../types/Storage";

/**
 * Service for file related operations
 */
class FileService {
  private static API_ENDPOINT = "/api/file";

  /**
   * Get a paginated list of file Files
   * @param params - Optional parameters for pagination and filtering
   * @returns A paginated list of Files
   */
  static async getFiles(params?: Record<string, string>) {
    try {
      LoggingService.info("file_service", "get_files", "Fetching Files");
      return await EnhancedApiService.getPaginated<FileItem>(
        this.API_ENDPOINT,
        {},
        params
      );
    } catch (error) {
      LoggingService.error(
        "file_service",
        "get_files_failed",
        "Failed to fetch Files",
        error
      );
      throw error;
    }
  }

  /**
   * Get a single file post by ID
   * @param id - ID of the file to fetch
   * @returns The file object
   */
  static async getFile(id: number): Promise<FileItem> {
    try {
      LoggingService.info("file_service", "get_file", `Fetching file ${id}`);
      return await EnhancedApiService.get<FileItem>(
        `${this.API_ENDPOINT}/${id}`
      );
    } catch (error) {
      LoggingService.error(
        "file_service",
        "get_file_failed",
        `Failed to fetch file ${id}`,
        error
      );
      return {} as FileItem;
    }
  }

  /**
   * Create a new file file
   * @param data - File data to create
   * @returns The created file
   * @throws Error if the creation fails
   */
  static async createFile(data: Partial<FileItem>): Promise<FileItem> {
    try {
      LoggingService.info("file_service", "create_file", "Creating new file");
      return await EnhancedApiService.post<FileItem>(this.API_ENDPOINT, data);
    } catch (error) {
      LoggingService.error(
        "file_service",
        "create_file_failed",
        "Failed to create file",
        error
      );
      return {} as FileItem;
    }
  }

  /**
   * Update an existing file file
   * @param id - ID of the file to update
   * @param data - Updated file data
   * @returns The updated file
   * @throws Error if the update fails
   * @description This method updates an existing file with the provided data.
   */
  static async updateFile(
    id: number,
    data: Partial<FileItem>
  ): Promise<FileItem> {
    try {
      LoggingService.info("file_service", "update_file", `Updating file ${id}`);
      return await EnhancedApiService.put<FileItem>(
        `${this.API_ENDPOINT}/${id}`,
        data
      );
    } catch (error) {
      LoggingService.error(
        "file_service",
        "update_file_failed",
        `Failed to update file ${id}`,
        error
      );
      return {} as FileItem;
    }
  }

  /**
   * Delete a file file
   * @param id - ID of the file to delete
   * @throws Error if the deletion fails
   * @description This method deletes a file by its ID.
   */
  static async deleteFile(id: number): Promise<void> {
    try {
      LoggingService.info("file_service", "delete_file", `Deleting file ${id}`);
      await EnhancedApiService.delete(`${this.API_ENDPOINT}/${id}`);
    } catch (error) {
      LoggingService.error(
        "file_service",
        "delete_file_failed",
        `Failed to delete file ${id}`,
        error
      );
      throw error;
    }
  }

  /**
   * Download a file
   * @param id - ID of the file to download
   * @returns A promise that resolves to the file blob
   * @throws Error if the download fails
   */
  static async downloadFile(id: number): Promise<Blob> {
    try {
      LoggingService.info(
        "file_service",
        "download_file",
        `Downloading file ${id}`
      );
      return await EnhancedApiService.get<Blob>(
        `${this.API_ENDPOINT}/${id}/download`,
        {},
        {},
        "blob"
      );
    } catch (error) {
      LoggingService.error(
        "file_service",
        "download_file_failed",
        `Failed to download file ${id}`,
        error
      );
      throw error;
    }
  }
}

export default FileService;
