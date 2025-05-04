
import EnhancedApiService from "./EnhancedApiService";
import LoggingService from "./LoggingService";
import { jwtDecode } from "jwt-decode";

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  expires_in?: number;
}

/**
 * Authentication Service for login, logout, and token management
 */
class AuthService {
  private static readonly TOKEN_KEY = "auth_token";
  private static readonly REFRESH_TOKEN_KEY = "refresh_token";
  
  /**
   * Login with username and password
   */
  public async login(username: string, password: string) {
    LoggingService.info("auth", "login_attempt", "User attempting to login", { username });
    
    try {
      const response = await EnhancedApiService.post<AuthResponse>("/api/auth/login", {
        username,
        password,
      });
      
      this.setAuthToken(response.access_token);
      this.setRefreshToken(response.refresh_token);
      
      LoggingService.info("auth", "login_success", "User login successful", { username });
      return response;
    } catch (error) {
      LoggingService.error("auth", "login_failed", "User login failed", { username, error });
      throw error;
    }
  }
  
  /**
   * Register a new user
   */
  public async register(data: any) {
    LoggingService.info("auth", "register_attempt", "User attempting to register");
    
    try {
      const response = await EnhancedApiService.post<AuthResponse>("/api/auth/register", data);
      
      this.setAuthToken(response.access_token);
      this.setRefreshToken(response.refresh_token);
      
      LoggingService.info("auth", "register_success", "User registration successful");
      return response;
    } catch (error) {
      LoggingService.error("auth", "register_failed", "User registration failed", { error });
      throw error;
    }
  }
  
  /**
   * Logout the current user and clear tokens
   */
  public async logout() {
    try {
      await EnhancedApiService.post("/api/auth/logout", {});
    } catch (error) {
      // Ignore errors on logout endpoint
      LoggingService.warn("auth", "logout_endpoint_error", "Error calling logout endpoint");
    } finally {
      this.clearTokens();
      LoggingService.info("auth", "logout", "User logged out");
    }
  }
  
  /**
   * Refresh the access token using the refresh token
   */
  public async refreshToken() {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      LoggingService.error("auth", "refresh_token_missing", "Refresh token not found");
      throw new Error("No refresh token available");
    }
    
    try {
      LoggingService.info("auth", "token_refresh_attempt", "Attempting to refresh token");
      
      const response = await EnhancedApiService.post<AuthResponse>("/api/auth/refresh", {
        refresh_token: refreshToken,
      });
      
      this.setAuthToken(response.access_token);
      
      if (response.refresh_token) {
        this.setRefreshToken(response.refresh_token);
      }
      
      LoggingService.info("auth", "token_refresh_success", "Token refresh successful");
      return response;
    } catch (error) {
      LoggingService.error("auth", "token_refresh_failed", "Token refresh failed", { error });
      this.clearTokens();
      throw error;
    }
  }
  
  /**
   * Get the current logged in user
   */
  public async getCurrentUser() {
    try {
      return await EnhancedApiService.get("/api/auth/me");
    } catch (error) {
      LoggingService.error("auth", "get_user_failed", "Failed to get current user", { error });
      throw error;
    }
  }
  
  /**
   * Check if the user is authenticated
   */
  public isAuthenticated(): boolean {
    const token = this.getAuthToken();
    return !!token && !this.isTokenExpired(token);
  }
  
  /**
   * Get the authentication token
   */
  public getAuthToken(): string | null {
    return localStorage.getItem(AuthService.TOKEN_KEY);
  }
  
  /**
   * Get the refresh token
   */
  public getRefreshToken(): string | null {
    return localStorage.getItem(AuthService.REFRESH_TOKEN_KEY);
  }
  
  /**
   * Get parsed user data from the token
   */
  public getTokenPayload() {
    const token = this.getAuthToken();
    if (!token) return null;
    
    try {
      return jwtDecode<any>(token);
    } catch (error) {
      LoggingService.error("auth", "token_decode_failed", "Failed to decode token", { error });
      return null;
    }
  }
  
  /**
   * Set the authentication token
   */
  private setAuthToken(token: string): void {
    localStorage.setItem(AuthService.TOKEN_KEY, token);
  }
  
  /**
   * Set the refresh token
   */
  private setRefreshToken(token: string): void {
    localStorage.setItem(AuthService.REFRESH_TOKEN_KEY, token);
  }
  
  /**
   * Clear all auth tokens
   */
  private clearTokens(): void {
    localStorage.removeItem(AuthService.TOKEN_KEY);
    localStorage.removeItem(AuthService.REFRESH_TOKEN_KEY);
  }
  
  /**
   * Check if the token is expired
   */
  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<any>(token);
      const currentTime = Date.now() / 1000;
      
      // Handle tokens without an expiration
      if (!decoded.exp) return false;
      
      return decoded.exp < currentTime;
    } catch (error) {
      LoggingService.error("auth", "token_validation_failed", "Failed to validate token expiration", { error });
      return true;
    }
  }
}

// Export as singleton
export default new AuthService();
