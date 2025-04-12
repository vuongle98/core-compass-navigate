import AuthService from "./AuthService";
import { toast } from "sonner";

interface ApiRequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean>;
  requiresAuth?: boolean;
}

interface PaginationParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  filter?: Record<string, any>;
  [key: string]: any;
}

interface PerformanceLog {
  endpoint: string;
  method: string;
  startTime: number;
  duration: number;
  status: number;
  success: boolean;
}

class ApiService {
  private static instance: ApiService;
  private baseUrl: string;
  private performanceLogs: PerformanceLog[] = [];

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
   * Get performance logs
   */
  public getPerformanceLogs(): PerformanceLog[] {
    return this.performanceLogs;
  }

  /**
   * Clear performance logs
   */
  public clearPerformanceLogs(): void {
    this.performanceLogs = [];
  }

  /**
   * Log API performance metrics
   */
  private logPerformance(log: PerformanceLog): void {
    this.performanceLogs.push(log);
    // Keep only the last 100 logs
    if (this.performanceLogs.length > 100) {
      this.performanceLogs.shift();
    }
    console.log(`API ${log.method} ${log.endpoint} - ${log.duration}ms - Status: ${log.status}`);
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
   * Get data with pagination, sorting and filtering support
   */
  public async getPaginated<T>(endpoint: string, params: PaginationParams = {}): Promise<{
    data: T[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  }> {
    const { page = 1, pageSize = 10, sort, filter, ...restParams } = params;
    
    const queryParams: Record<string, string> = {
      ...restParams,
      page: page.toString(),
      size: pageSize.toString(),
    };
    
    // Add sorting parameters if provided
    if (sort) {
      queryParams.sort = sort;
    }
    
    // Add filtering parameters if provided
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams[`filter[${key}]`] = String(value);
        }
      });
    }
    
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
   * Base request method with token refresh handling and performance logging
   */
  private async request<T>(endpoint: string, config: ApiRequestConfig = {}): Promise<T> {
    const { params, requiresAuth = true, ...fetchConfig } = config;
    const startTime = performance.now();
    const method = (config.method || 'GET').toUpperCase();
    
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

    // Log the request for user action tracing
    this.logUserAction('api_request', { 
      endpoint, 
      method,
      timestamp: new Date().toISOString()
    });

    // Make the request
    try {
      const response = await fetch(url, {
        ...fetchConfig,
        headers,
      });

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      // Log performance metrics
      this.logPerformance({
        endpoint,
        method,
        startTime,
        duration,
        status: response.status,
        success: response.ok
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

          const retryEndTime = performance.now();
          this.logPerformance({
            endpoint,
            method,
            startTime,
            duration: Math.round(retryEndTime - startTime),
            status: retryResponse.status,
            success: retryResponse.ok
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
      const endTime = performance.now();
      
      this.logPerformance({
        endpoint,
        method,
        startTime,
        duration: Math.round(endTime - startTime),
        status: 0, // Network error or other failure
        success: false
      });
      
      console.error("API request error:", error);
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Log user actions for analytics
   */
  public logUserAction(actionType: string, data: Record<string, any> = {}): void {
    // Add common data
    const logData = {
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
      userId: AuthService.getCurrentUser()?.id || 'anonymous'
    };
    
    console.log(`USER_ACTION: ${actionType}`, logData);
    
    // Here you could send the log to your analytics system
    // Example: this.post('/analytics/log', { type: actionType, data: logData });
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
