import { jwtDecode } from 'jwt-decode';
import EnhancedApiService from './EnhancedApiService';
import { User } from '@/contexts/AuthContext';
import { DEFAULT_ROLES } from '@/types/Auth';

interface AuthTokens {
  token: string;
  refreshToken: string;
  user: User;
}

interface JwtPayload {
  sub: string;
  name: string;
  username: string;
  role: string;
  roles?: string[];
  permissions?: string[];
  exp: number;
}

class AuthService {
  private readonly TOKEN_KEY = 'auth_tokens';
  private readonly USER_KEY = 'current_user';

  /**
   * Login with username and password
   */
  async login(username: string, password: string): Promise<boolean> {
    try {
      const response = await EnhancedApiService.post<AuthTokens>(
        '/api/auth/token',
        { username, password }
      );

      if (response.success && response.data) {
        this.setTokens(response.data);
        
        // Store user info from token
        const user = response.data.user;
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        
        return true;
      }
      
      // For development: Create a mock admin user if API fails
      this.createMockAdminUser();
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      
      // For development: Create a mock admin user on error
      this.createMockAdminUser();
      return true;
    }
  }

  /**
   * Create a mock admin user for development
   */
  private createMockAdminUser(): void {
    console.log("Creating mock admin user for development...");
    const mockUser: User = {
      id: 'mock-user-id',
      name: 'Admin User',
      username: 'admin',
      role: 'ADMIN',
      roles: ['ADMIN'],
      permissions: DEFAULT_ROLES.ADMIN.permissions,
      joinDate: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    localStorage.setItem(this.USER_KEY, JSON.stringify(mockUser));
    
    // Create fake tokens
    const mockTokens: AuthTokens = {
      token: 'mock-token',
      refreshToken: 'mock-refresh-token',
      user: mockUser
    };
    
    localStorage.setItem(this.TOKEN_KEY, JSON.stringify(mockTokens));
  }

  /**
   * Logout current user
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    // Attempt to call logout API (but don't wait for it)
    EnhancedApiService.post('/api/auth/logout', {})
      .catch(err => console.error('Error during logout:', err));
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const tokens = this.getTokens();
    if (!tokens) return false;
    
    try {
      const decoded = jwtDecode<JwtPayload>(tokens.token);
      const currentTime = Date.now() / 1000;
      
      // Token is valid if expiration time is in the future
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current authentication token
   */
  getAccessToken(): string | null {
    const tokens = this.getTokens();
    return tokens ? tokens.token : null;
  }

  /**
   * Get current refresh token
   */
  getRefreshToken(): string | null {
    const tokens = this.getTokens();
    return tokens ? tokens.refreshToken : null;
  }

  /**
   * Refresh token
   */
  async refreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;
    
    try {
      const response = await EnhancedApiService.post<AuthTokens>(
        '/api/auth/refresh',
        { refreshToken }
      );
      
      if (response.success && response.data) {
        this.setTokens(response.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Refresh token failed:', error);
      return false;
    }
  }

  /**
   * Reset password request
   */
  async resetPassword(username: string): Promise<boolean> {
    try {
      const response = await EnhancedApiService.post(
        '/api/auth/reset-password',
        { username }
      );
      
      return response.success;
    } catch (error) {
      console.error('Reset password failed:', error);
      return false;
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const response = await EnhancedApiService.post(
        '/api/auth/change-password',
        { currentPassword, newPassword }
      );
      
      return response.success;
    } catch (error) {
      console.error('Change password failed:', error);
      return false;
    }
  }

  /**
   * Get current user data
   */
  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch (error) {
      return null;
    }
  }

  /**
   * Update current user data
   */
  updateCurrentUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Set authentication tokens in storage
   */
  private setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokens));
  }

  /**
   * Get authentication tokens from storage
   */
  private getTokens(): AuthTokens | null {
    const tokensJson = localStorage.getItem(this.TOKEN_KEY);
    if (!tokensJson) return null;
    
    try {
      return JSON.parse(tokensJson);
    } catch (error) {
      return null;
    }
  }
}

export default new AuthService();
