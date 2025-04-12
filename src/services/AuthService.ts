
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number; // Timestamp when the access token expires
  user?: User; // Store user data with tokens
}

class AuthService {
  private static instance: AuthService;
  private readonly TOKEN_KEY = "auth_tokens";
  private refreshPromise: Promise<string> | null = null;

  // Singleton pattern
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Login user and store tokens
   */
  public async login(username: string, password: string): Promise<boolean> {
    try {
      // For development/testing - use mock data instead of API call
      
      // Generate mock tokens and user data
      const mockUser: User = {
        id: "user-" + Date.now(),
        email: username,
        name: username.split('@')[0] || username,
        role: "admin"
      };
      
      const mockResponse = {
        accessToken: "mock-access-token-" + Date.now(),
        refreshToken: "mock-refresh-token-" + Date.now(),
        expiresIn: 3600 // 1 hour
      };
      
      // Calculate expiration timestamp
      const expiresAt = Date.now() + mockResponse.expiresIn * 1000;

      // Store tokens and user data
      this.setTokens({
        accessToken: mockResponse.accessToken,
        refreshToken: mockResponse.refreshToken,
        expiresAt,
        user: mockUser
      });

      toast.success("Login successful");
      return true;
      
      /* Commented out actual API call for now */
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed", {
        description: "An unexpected error occurred",
      });
      return false;
    }
  }

  /**
   * Get current user data
   */
  public getCurrentUser(): User | null {
    const tokens = this.getTokens();
    return tokens?.user || null;
  }

  /**
   * Logout user and clear tokens
   */
  public logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    // Redirect to login page
    window.location.href = "/login";
  }

  /**
   * Get the stored access token
   */
  public getAccessToken(): string | null {
    const tokens = this.getTokens();
    return tokens ? tokens.accessToken : null;
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    const tokens = this.getTokens();
    if (!tokens) return false;
    
    // If we have an expiration time, check if the token is still valid
    if (tokens.expiresAt) {
      return tokens.expiresAt > Date.now();
    }
    
    // If no expiration time is stored, just check if we have an access token
    return !!tokens.accessToken;
  }

  /**
   * Refresh the access token using the refresh token
   */
  public async refreshToken(): Promise<string> {
    // If a refresh operation is already in progress, return that promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Create a new refresh promise
    this.refreshPromise = new Promise(async (resolve, reject) => {
      try {
        const tokens = this.getTokens();
        
        if (!tokens || !tokens.refreshToken) {
          this.logout();
          reject("No refresh token available");
          return;
        }

        // Example API call - replace with your actual refresh endpoint
        const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        });

        if (!response.ok) {
          this.logout();
          reject("Failed to refresh token");
          return;
        }

        const data = await response.json();
        
        // Calculate expiration timestamp if expiresIn is provided
        let expiresAt: number | undefined;
        if (data.expiresIn) {
          expiresAt = Date.now() + data.expiresIn * 1000;
        }

        // Store new tokens, but keep existing user data
        this.setTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken || tokens.refreshToken, // Use new refresh token or keep existing one
          expiresAt,
          user: tokens.user // Keep existing user data
        });

        resolve(data.accessToken);
      } catch (error) {
        console.error("Token refresh error:", error);
        this.logout();
        reject("Failed to refresh authentication");
      } finally {
        this.refreshPromise = null;
      }
    });

    return this.refreshPromise;
  }

  /**
   * Check if token needs refresh based on expiration time
   */
  public needsRefresh(): boolean {
    const tokens = this.getTokens();
    if (!tokens || !tokens.expiresAt) return false;
    
    // Refresh if less than 5 minutes remaining
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    return tokens.expiresAt - Date.now() < bufferTime;
  }

  /**
   * Store authentication tokens
   */
  private setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokens));
  }

  /**
   * Get stored authentication tokens
   */
  private getTokens(): AuthTokens | null {
    const tokensStr = localStorage.getItem(this.TOKEN_KEY);
    return tokensStr ? JSON.parse(tokensStr) : null;
  }
}

export default AuthService.getInstance();
