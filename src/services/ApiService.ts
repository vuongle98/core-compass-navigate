
import AuthService from "./AuthService";
import { toast } from "sonner";

interface ApiRequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean>;
  requiresAuth?: boolean;
}

interface PaginationParams {
  page?: number;
  pageSize?: number;
  [key: string]: any;
}

class ApiService {
  private static instance: ApiService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || "";
  }

  // Singleton pattern
  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  /**
   * Set the base URL for API requests
   */
  public setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Make a GET request
   */
  public async get<T>(endpoint: string, config: ApiRequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  /**
   * Make a POST request
   */
  public async post<T>(endpoint: string, data?: any, config: ApiRequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Make a PUT request
   */
  public async put<T>(endpoint: string, data?: any, config: ApiRequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Make a DELETE request
   */
  public async delete<T>(endpoint: string, config: ApiRequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }

  /**
   * Get data with pagination support
   */
  public async getPaginated<T>(endpoint: string, params: PaginationParams = {}): Promise<{
    data: T[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  }> {
    const { page = 1, pageSize = 10, ...restParams } = params;
    
    const queryParams = {
      ...restParams,
      page: page.toString(),
      size: pageSize.toString(),
    };
    
    const config: ApiRequestConfig = {
      params: queryParams,
      requiresAuth: true,
    };

    const response = await this.get<{
      data: T[];
      totalItems: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
    }>(endpoint, config);

    return response;
  }

  /**
   * Base request method with token refresh handling
   */
  private async request<T>(endpoint: string, config: ApiRequestConfig = {}): Promise<T> {
    const { params, requiresAuth = true, ...fetchConfig } = config;
    
    // Construct URL with query parameters
    let url = this.baseUrl + endpoint;
    if (params) {
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join("&");
      
      url += `${url.includes("?") ? "&" : "?"}${queryString}`;
    }

    // Apply default headers
    const headers = new Headers(fetchConfig.headers);
    
    if (!headers.has("Content-Type") && fetchConfig.body) {
      headers.set("Content-Type", "application/json");
    }
    
    // Add auth token if required
    if (requiresAuth) {
      // Check if token needs refresh before making the request
      if (AuthService.isAuthenticated() && AuthService.needsRefresh()) {
        try {
          await AuthService.refreshToken();
        } catch (error) {
          // If refresh fails, user will be logged out
          console.error("Token refresh failed", error);
        }
      }

      const token = AuthService.getAccessToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      } else if (requiresAuth) {
        // Redirect to login if no token and auth is required
        AuthService.logout();
        throw new Error("Authentication required");
      }
    }

    // Make the request
    try {
      const response = await fetch(url, {
        ...fetchConfig,
        headers,
      });

      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401 && requiresAuth) {
        try {
          // Try to refresh the token
          const newToken = await AuthService.refreshToken();
          
          // Retry the original request with the new token
          headers.set("Authorization", `Bearer ${newToken}`);
          
          const retryResponse = await fetch(url, {
            ...fetchConfig,
            headers,
          });

          return this.handleResponse<T>(retryResponse);
        } catch (error) {
          // If refresh fails, redirect to login
          AuthService.logout();
          throw new Error("Session expired. Please login again.");
        }
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error("API request error:", error);
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: "An unexpected error occurred" 
      }));
      
      throw {
        status: response.status,
        message: error.message || response.statusText,
      };
    }

    // Check if response is empty
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    
    return {} as T;
  }

  /**
   * Centralized error handling
   */
  private handleError(error: any): void {
    let message = "An unexpected error occurred";
    
    if (error.message) {
      message = error.message;
    }
    
    toast.error("API Error", {
      description: message,
    });
  }
}

export default ApiService.getInstance();
