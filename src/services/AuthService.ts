
import EnhancedApiService from './EnhancedApiService';
import LoggingService from './LoggingService';
import { jwtDecode } from 'jwt-decode';

// Define the User interface
export interface User {
  id: string;
  username: string;
  email?: string;
  name: string;
  role: string;
  roles?: string[];
  permissions?: string[];
  joinDate?: string;
  lastLogin?: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private currentUser: User | null = null;
  
  constructor() {
    this.loadTokensFromStorage();
    LoggingService.info('auth', 'service_initialized', 'Auth service initialized');
  }
  
  /**
   * Login with username/email and password
   */
  public async login(email: string, password: string): Promise<User> {
    try {
      const response = await EnhancedApiService.post<ApiResponse<AuthResponse>>('/api/auth/login', { email, password });
      
      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
      this.currentUser = response.data.user;
      
      this.saveTokensToStorage();
      
      LoggingService.info('auth', 'login_success', 'User logged in successfully');
      
      return this.currentUser;
    } catch (error) {
      LoggingService.error('auth', 'login_failed', 'Login failed', { error });
      throw error;
    }
  }
  
  /**
   * Register a new user
   */
  public async register(userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<User> {
    try {
      const response = await EnhancedApiService.post<ApiResponse<AuthResponse>>('/api/auth/register', userData);
      
      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
      this.currentUser = response.data.user;
      
      this.saveTokensToStorage();
      
      LoggingService.info('auth', 'register_success', 'User registered successfully');
      
      return this.currentUser;
    } catch (error) {
      LoggingService.error('auth', 'register_failed', 'Registration failed', { error });
      throw error;
    }
  }
  
  /**
   * Refresh authentication token
   */
  public async refreshAuth(): Promise<boolean> {
    try {
      if (!this.refreshToken) {
        LoggingService.warn('auth', 'refresh_token_missing', 'No refresh token available');
        return false;
      }
      
      const response = await EnhancedApiService.post<ApiResponse<AuthResponse>>('/api/auth/refresh', {
        refresh_token: this.refreshToken
      });
      
      this.accessToken = response.data.access_token;
      this.currentUser = response.data.user;
      
      if (response.data.refresh_token) {
        this.refreshToken = response.data.refresh_token;
      }
      
      this.saveTokensToStorage();
      
      LoggingService.info('auth', 'token_refreshed', 'Token refreshed successfully');
      
      return true;
    } catch (error) {
      LoggingService.error('auth', 'token_refresh_failed', 'Token refresh failed', { error });
      this.logout();
      return false;
    }
  }
  
  /**
   * Log out current user
   */
  public logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.currentUser = null;
    
    // Clear from storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    LoggingService.info('auth', 'logout', 'User logged out');
  }
  
  /**
   * Get the current user information
   */
  public getCurrentUser(): User | null {
    return this.currentUser;
  }
  
  /**
   * Update current user information
   */
  public async updateCurrentUser(userData: Partial<User>): Promise<User> {
    try {
      const response = await EnhancedApiService.put<ApiResponse<User>>('/api/auth/user', userData);
      this.currentUser = response.data;
      localStorage.setItem('user', JSON.stringify(this.currentUser));
      
      LoggingService.info('auth', 'user_updated', 'User information updated');
      
      return this.currentUser;
    } catch (error) {
      LoggingService.error('auth', 'user_update_failed', 'Failed to update user information', { error });
      throw error;
    }
  }
  
  /**
   * Reset password
   */
  public async resetPassword(email: string): Promise<void> {
    try {
      await EnhancedApiService.post('/api/auth/reset-password', { email });
      LoggingService.info('auth', 'reset_password_requested', 'Password reset requested');
    } catch (error) {
      LoggingService.error('auth', 'reset_password_failed', 'Password reset request failed', { error });
      throw error;
    }
  }
  
  /**
   * Change password
   */
  public async changePassword(data: { 
    currentPassword: string; 
    newPassword: string; 
    confirmPassword: string 
  }): Promise<void> {
    try {
      await EnhancedApiService.post('/api/auth/change-password', data);
      LoggingService.info('auth', 'password_changed', 'Password changed successfully');
    } catch (error) {
      LoggingService.error('auth', 'password_change_failed', 'Password change failed', { error });
      throw error;
    }
  }
  
  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!this.accessToken && !this.isTokenExpired();
  }
  
  /**
   * Check if token is expired
   */
  public isTokenExpired(): boolean {
    if (!this.accessToken) {
      return true;
    }
    
    try {
      const decoded: any = jwtDecode(this.accessToken);
      if (!decoded.exp) return true;
      
      // Check if token expired (with 10 second buffer)
      return decoded.exp * 1000 < Date.now() + 10000;
    } catch (err) {
      LoggingService.error('auth', 'token_validation_failed', 'Failed to validate token', { err });
      return true;
    }
  }
  
  /**
   * Get access token
   */
  public getAccessToken(): string | null {
    return this.accessToken;
  }
  
  /**
   * Get refresh token (for internal service use)
   */
  public getRefreshToken(): string | null {
    return this.refreshToken;
  }
  
  /**
   * Load tokens from local storage
   */
  private loadTokensFromStorage(): void {
    try {
      this.accessToken = localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');
      
      const userJson = localStorage.getItem('user');
      if (userJson) {
        this.currentUser = JSON.parse(userJson);
      }
      
      LoggingService.debug('auth', 'tokens_loaded', 'Tokens loaded from storage');
    } catch (error) {
      LoggingService.error('auth', 'load_tokens_failed', 'Failed to load tokens from storage', { error });
      this.accessToken = null;
      this.refreshToken = null;
    }
  }
  
  /**
   * Save tokens to local storage
   */
  private saveTokensToStorage(): void {
    try {
      if (this.accessToken) {
        localStorage.setItem('access_token', this.accessToken);
      }
      
      if (this.refreshToken) {
        localStorage.setItem('refresh_token', this.refreshToken);
      }
      
      if (this.currentUser) {
        localStorage.setItem('user', JSON.stringify(this.currentUser));
      }
      
      LoggingService.debug('auth', 'tokens_saved', 'Tokens saved to storage');
    } catch (error) {
      LoggingService.error('auth', 'save_tokens_failed', 'Failed to save tokens to storage', { error });
    }
  }
}

const authService = new AuthService();
export default authService;
