
import { toast } from "sonner";
import ApiService from "./ApiService";

interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  role?: string;
  joinDate?: string;
  lastLogin?: string;
}

interface AuthTokens {
  token: string;
  refresh: string;
  expiresAt?: number; // Timestamp when the access token expires
  user?: User; // Store user data with tokens
  type?: string; // Optional token field
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
      if (username === "test" && password === "test") {
        const mockUser: User = {
          id: "user-" + Date.now(),
          email: username,
          name: username.split("@")[0] || username,
          roles: ["SUPER_ADMIN"],
          role: "Administrator", // Added role field
          joinDate: "January 15, 2023",
          lastLogin: new Date().toLocaleString()
        };

        const mockResponse = {
          token: "mock-access-token-" + Date.now(),
          refresh: "mock-refresh-token-" + Date.now(),
          expiresIn: 3600, // 1 hour
        };

        // Calculate expiration timestamp
        const expiresAt = Date.now() + mockResponse.expiresIn * 1000;

        // Store tokens and user data
        this.setTokens({
          token: mockResponse.token,
          refresh: mockResponse.refresh,
          expiresAt,
          user: mockUser,
        });

        toast.success("Login successful");
        return true;
      } else {
        // Fixed: Removed the third argument that was causing the error
        const { data } = await ApiService.post<AuthTokens>(
          "/api/auth/token",
          {
            username,
            password,
          },
        );

        this.setTokens({
          token: data.token,
          refresh: data.refresh,
          expiresAt: data.expiresAt,
          user: data.user,
        });
        toast.success("Login successful");
        return true;
      }
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
   * Update the current user data in storage
   */
  public updateCurrentUser(userData: Partial<User>): void {
    const tokens = this.getTokens();
    if (tokens && tokens.user) {
      this.setTokens({
        ...tokens,
        user: { ...tokens.user, ...userData }
      });
    }
  }

  /**
   * Logout user and clear tokens
   */
  public logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    // Redirect to login page is now handled by the logout function in AuthContext
  }

  /**
   * Get the stored access token
   */
  public getAccessToken(): string | null {
    const tokens = this.getTokens();
    return tokens ? tokens.token : null;
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
    return !!tokens.token;
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

        if (!tokens || !tokens.refresh) {
          this.logout();
          reject("No refresh token available");
          return;
        }

        // Example API call - replace with your actual refresh endpoint
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || ""}/auth/refresh`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh: tokens.refresh }),
          }
        );

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
          token: data.token,
          refresh: data.refresh || tokens.refresh, // Use new refresh token or keep existing one
          expiresAt,
          user: tokens.user, // Keep existing user data
        });

        resolve(data.token);
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
