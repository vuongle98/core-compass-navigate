import { PaginationOptions } from "@/types/Common";
import EnhancedApiService from "./EnhancedApiService";
import LoggingService from "./LoggingService";
import { Permission } from "@/types/Auth";

/**
 * Service for permission related operations
 */
class PermissionService {
  private static API_ENDPOINT = "/api/permission";

  /**
   * Get a paginated list of permission Permissions
   * @param params - Optional parameters for pagination and filtering
   * @returns A paginated list of Permissions
   */
  static async getPermissions(params?: PaginationOptions) {
    try {
      LoggingService.info(
        "permission_service",
        "get_permissions",
        "Fetching Permissions"
      );
      return await EnhancedApiService.getPaginated<Permission>(
        this.API_ENDPOINT,
        params,
        {}
      );
    } catch (error) {
      LoggingService.error(
        "permission_service",
        "get_permissions_failed",
        "Failed to fetch Permissions",
        error
      );
      throw error;
    }
  }

  /**
   * Get a single permission post by ID
   * @param id - ID of the permission to fetch
   * @returns The permission object
   */
  static async getPermission(id: number): Promise<Permission> {
    try {
      LoggingService.info(
        "permission_service",
        "get_permission",
        `Fetching permission ${id}`
      );
      return await EnhancedApiService.get<Permission>(
        `${this.API_ENDPOINT}/${id}`
      );
    } catch (error) {
      LoggingService.error(
        "permission_service",
        "get_permission_failed",
        `Failed to fetch permission ${id}`,
        error
      );
      return {} as Permission;
    }
  }

  /**
   * Create a new permission permission
   * @param data - Permission data to create
   * @returns The created permission
   * @throws Error if the creation fails
   */
  static async createPermission(
    data: Partial<Permission>
  ): Promise<Permission> {
    try {
      LoggingService.info(
        "permission_service",
        "create_permission",
        "Creating new permission"
      );
      return await EnhancedApiService.post<Permission>(this.API_ENDPOINT, data);
    } catch (error) {
      LoggingService.error(
        "permission_service",
        "create_permission_failed",
        "Failed to create permission",
        error
      );
      return {} as Permission;
    }
  }

  /**
   * Update an existing permission permission
   * @param id - ID of the permission to update
   * @param data - Updated permission data
   * @returns The updated permission
   * @throws Error if the update fails
   * @description This method updates an existing permission with the provided data.
   */
  static async updatePermission(
    id: number,
    data: Partial<Permission>
  ): Promise<Permission> {
    try {
      LoggingService.info(
        "permission_service",
        "update_permission",
        `Updating permission ${id}`
      );
      return await EnhancedApiService.put<Permission>(
        `${this.API_ENDPOINT}/${id}`,
        data
      );
    } catch (error) {
      LoggingService.error(
        "permission_service",
        "update_permission_failed",
        `Failed to update permission ${id}`,
        error
      );
      return {} as Permission;
    }
  }

  /**
   * Delete a permission permission
   * @param id - ID of the permission to delete
   * @throws Error if the deletion fails
   * @description This method deletes a permission by its ID.
   */
  static async deletePermission(id: number): Promise<void> {
    try {
      LoggingService.info(
        "permission_service",
        "delete_permission",
        `Deleting permission ${id}`
      );
      await EnhancedApiService.delete(`${this.API_ENDPOINT}/${id}`);
    } catch (error) {
      LoggingService.error(
        "permission_service",
        "delete_permission_failed",
        `Failed to delete permission ${id}`,
        error
      );
      throw error;
    }
  }
}

export default PermissionService;
