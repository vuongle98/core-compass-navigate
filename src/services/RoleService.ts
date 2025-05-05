import EnhancedApiService from "./EnhancedApiService";
import LoggingService from "./LoggingService";
import { Role } from "@/types/Auth";

/**
 * Service for role related operations
 */
class RoleService {
  private static API_ENDPOINT = "/api/role";

  /**
   * Get a paginated list of role roles
   * @param params - Optional parameters for pagination and filtering
   * @returns A paginated list of roles
   */
  static async getRoles(params?: Record<string, string>) {
    try {
      LoggingService.info("role_service", "get_roles", "Fetching roles");
      return await EnhancedApiService.getPaginated<Role>(
        this.API_ENDPOINT,
        {},
        params
      );
    } catch (error) {
      LoggingService.error(
        "role_service",
        "get_roles_failed",
        "Failed to fetch roles",
        error
      );
      throw error;
    }
  }

  /**
   * Get a single role post by ID
   * @param id - ID of the role to fetch
   * @returns The role object
   */
  static async getRole(id: number): Promise<Role> {
    try {
      LoggingService.info("role_service", "get_role", `Fetching role ${id}`);
      return await EnhancedApiService.get<Role>(`${this.API_ENDPOINT}/${id}`);
    } catch (error) {
      LoggingService.error(
        "role_service",
        "get_role_failed",
        `Failed to fetch role ${id}`,
        error
      );
      return {} as Role;
    }
  }

  /**
   * Create a new role role
   * @param data - Role data to create
   * @returns The created role
   * @throws Error if the creation fails
   */
  static async createRole(data: Partial<Role>): Promise<Role> {
    try {
      LoggingService.info("role_service", "create_role", "Creating new role");
      return await EnhancedApiService.post<Role>(this.API_ENDPOINT, data);
    } catch (error) {
      LoggingService.error(
        "role_service",
        "create_role_failed",
        "Failed to create role",
        error
      );
      return {} as Role;
    }
  }

  /**
   * Update an existing role role
   * @param id - ID of the role to update
   * @param data - Updated role data
   * @returns The updated role
   * @throws Error if the update fails
   * @description This method updates an existing role with the provided data.
   */
  static async updateRole(id: number, data: Partial<Role>): Promise<Role> {
    try {
      LoggingService.info("role_service", "update_role", `Updating role ${id}`);
      return await EnhancedApiService.put<Role>(
        `${this.API_ENDPOINT}/${id}`,
        data
      );
    } catch (error) {
      LoggingService.error(
        "role_service",
        "update_role_failed",
        `Failed to update role ${id}`,
        error
      );
      return {} as Role;
    }
  }

  /**
   * Delete a role role
   * @param id - ID of the role to delete
   * @throws Error if the deletion fails
   * @description This method deletes a role by its ID.
   */
  static async deleteRole(id: number): Promise<void> {
    try {
      LoggingService.info("role_service", "delete_role", `Deleting role ${id}`);
      await EnhancedApiService.delete(`${this.API_ENDPOINT}/${id}`);
    } catch (error) {
      LoggingService.error(
        "role_service",
        "delete_role_failed",
        `Failed to delete role ${id}`,
        error
      );
      throw error;
    }
  }
}

export default RoleService;
