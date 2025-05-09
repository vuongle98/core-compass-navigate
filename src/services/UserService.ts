import EnhancedApiService from "./EnhancedApiService";
import LoggingService from "./LoggingService";
import { User, UserProfile } from "@/types/Auth";

/**
 * Service for user related operations
 */
class UserService {
  private static API_ENDPOINT = "/api/user";

  /**
   * Get a paginated list of user users
   * @param params - Optional parameters for pagination and filtering
   * @returns A paginated list of users
   */
  static async getUsers(params?: Record<string, string>) {
    try {
      LoggingService.info("user_service", "get_users", "Fetching users");
      return await EnhancedApiService.getPaginated<User>(
        this.API_ENDPOINT,
        {},
        params
      );
    } catch (error) {
      LoggingService.error(
        "user_service",
        "get_users_failed",
        "Failed to fetch users",
        error
      );
      throw error;
    }
  }

  /**
   * Get a single user post by ID
   * @param id - ID of the user to fetch
   * @returns The user object
   */
  static async getUser(id: number): Promise<User> {
    try {
      LoggingService.info("user_service", "get_user", `Fetching user ${id}`);
      return await EnhancedApiService.get<User>(`${this.API_ENDPOINT}/${id}`);
    } catch (error) {
      LoggingService.error(
        "user_service",
        "get_user_failed",
        `Failed to fetch user ${id}`,
        error
      );
      return {} as User;
    }
  }

  /**
   * Create a new user user
   * @param data - User data to create
   * @returns The created user
   * @throws Error if the creation fails
   */
  static async createUser(data: Partial<User>): Promise<User> {
    try {
      LoggingService.info("user_service", "create_user", "Creating new user");
      return await EnhancedApiService.post<User>(this.API_ENDPOINT, data);
    } catch (error) {
      LoggingService.error(
        "user_service",
        "create_user_failed",
        "Failed to create user",
        error
      );
      return {} as User;
    }
  }

  /**
   * Update an existing user user
   * @param id - ID of the user to update
   * @param data - Updated user data
   * @returns The updated user
   * @throws Error if the update fails
   * @description This method updates an existing user with the provided data.
   */
  static async updateUser(id: number, data: Partial<User>): Promise<User> {
    try {
      LoggingService.info("user_service", "update_user", `Updating user ${id}`);
      return await EnhancedApiService.put<User>(
        `${this.API_ENDPOINT}/${id}`,
        data
      );
    } catch (error) {
      LoggingService.error(
        "user_service",
        "update_user_failed",
        `Failed to update user ${id}`,
        error
      );
      return {} as User;
    }
  }

  /**
   * Update a user's profile information
   * @param id - ID of the user to update profile
   * @param profileData - Profile data to update
   * @returns The updated user profile
   * @throws Error if the update fails
   */
  static async updateProfile(
    id: number | string,
    profileData: Partial<UserProfile>
  ): Promise<UserProfile> {
    try {
      const userId = typeof id === "number" ? id : parseInt(id);
      LoggingService.info(
        "user_service",
        "update_profile",
        `Updating profile for user ${userId}`
      );
      return await EnhancedApiService.put<UserProfile>(
        `${this.API_ENDPOINT}/${userId}/profile`,
        profileData
      );
    } catch (error) {
      LoggingService.error(
        "user_service",
        "update_profile_failed",
        `Failed to update profile for user ${id}`,
        error
      );
      throw error;
    }
  }

  /**
   * Delete a user user
   * @param id - ID of the user to delete
   * @throws Error if the deletion fails
   * @description This method deletes a user by its ID.
   */
  static async deleteUser(id: number | string): Promise<void> {
    try {
      LoggingService.info("user_service", "delete_user", `Deleting user ${id}`);
      await EnhancedApiService.delete(`${this.API_ENDPOINT}/${id}`);
    } catch (error) {
      LoggingService.error(
        "user_service",
        "delete_user_failed",
        `Failed to delete user ${id}`,
        error
      );
      throw error;
    }
  }
}

export default UserService;
