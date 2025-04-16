import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import LoggingService from "./LoggingService";
import AuthService from "./AuthService";

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

// Add custom metadata property to AxiosRequestConfig
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: Record<string, any>;
  }
}

// Type definitions for API responses
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedData<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  sort?: string | string[];
  filter?: Record<string, string | number | boolean | string[]>;
  search?: string;
}

/**
 * Enhanced API Service with logging, retry logic, and better error handling
 */
class EnhancedApiService {
  private static instance: EnhancedApiService;
  private apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      "Content-Type": "application/json",
    },
  });

  private constructor() {
    this.setupInterceptors();
  }

  public static getInstance(): EnhancedApiService {
    if (!EnhancedApiService.instance) {
      EnhancedApiService.instance = new EnhancedApiService();
    }
    return EnhancedApiService.instance;
  }

  /**
   * Set up request and response interceptors
   */
  private setupInterceptors(): void {
    // Add request interceptor for auth token
    this.apiClient.interceptors.request.use(
      (config) => {
        const token = AuthService.getAccessToken();
        const isAuthEndpoint = config.url?.includes("/api/auth");

        if (token && !isAuthEndpoint) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log the request
        const startTime = LoggingService.logApiRequest(
          config.url || "",
          config.method?.toUpperCase() || "GET",
          config.data
        );
        
        // Store start time for calculating duration
        config.metadata = { startTime };
        
        return config;
      },
      (error) => {
        LoggingService.logApiError(
          error.config?.url || "unknown",
          error.config?.method?.toUpperCase() || "UNKNOWN",
          error,
          Date.now()
        );
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling and logging
    this.apiClient.interceptors.response.use(
      (response) => {
        const { config } = response;
        const startTime = config?.metadata?.startTime || Date.now();
        
        // Log successful response
        LoggingService.logApiResponse(
          config.url || "",
          config.method?.toUpperCase() || "GET",
          response.status,
          response.data,
          startTime
        );
        
        return response;
      },
      async (error: AxiosError) => {
        const { config, response } = error;
        if (!config) return Promise.reject(error);
        
        const startTime = config?.metadata?.startTime || Date.now();
        const retryCount = config?.metadata?.retryCount || 0;
        
        // Log the error
        LoggingService.logApiError(
          config.url || "unknown",
          config.method?.toUpperCase() || "UNKNOWN",
          error,
          startTime
        );

        // Handle auth errors
        if (response?.status === 401) {
          // Try to refresh token if not already a refresh request
          if (!config.url?.includes('/auth/refresh')) {
            try {
              await AuthService.refreshToken();
              // Retry with new token
              const token = AuthService.getAccessToken();
              if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                return this.apiClient(config);
              }
            } catch (refreshError) {
              // If refresh fails, redirect to login
              AuthService.logout();
              window.location.href = "/login";
              return Promise.reject(error);
            }
          } else {
            // If refresh token request failed, logout
            AuthService.logout();
            window.location.href = "/login";
            return Promise.reject(error);
          }
        }

        // Auto retry on network errors or 5xx server errors
        if (
          (error.code === "ECONNABORTED" || 
           error.code === "ERR_NETWORK" || 
           (response && response.status >= 500)) && 
          retryCount < MAX_RETRIES
        ) {
          // Exponential backoff
          const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 1000;
          LoggingService.debug(
            "api", 
            "retry_attempt", 
            `Retrying request to ${config.url} (${retryCount + 1}/${MAX_RETRIES}) after ${delay}ms`
          );
          
          return new Promise((resolve) => {
            setTimeout(() => {
              // Update retry count
              const newConfig = { ...config };
              if (!newConfig.metadata) {
                newConfig.metadata = {};
              }
              newConfig.metadata.retryCount = retryCount + 1;
              resolve(this.apiClient(newConfig));
            }, delay);
          });
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Generic request function with fallback to mock data
   */
  public async request<T>(
    url: string,
    options: AxiosRequestConfig = {},
    mockData?: T
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.apiClient(
        url,
        options
      );
      return response.data;
    } catch (error) {
      // If mock data provided and we're in development, return it
      if (mockData !== undefined && (import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_DATA === "true")) {
        LoggingService.info(
          "api",
          "using_mock_data",
          `Using mock data for ${url}`
        );
        return {
          data: mockData,
          success: true,
          message: "Using mock data",
        };
      }
      throw error;
    }
  }

  /**
   * Build query string from pagination options
   */
  private buildQueryParams(options?: PaginationOptions): string {
    if (!options) return "";
    
    const params = new URLSearchParams();
    
    // Add pagination
    if (options.page !== undefined) {
      params.append("page", options.page.toString());
    }
    
    if (options.pageSize !== undefined) {
      params.append("size", options.pageSize.toString());
    }
    
    // Add sorting
    if (options.sort) {
      if (Array.isArray(options.sort)) {
        options.sort.forEach(sort => params.append("sort", sort));
      } else {
        params.append("sort", options.sort);
      }
    }
    
    // Add search
    if (options.search) {
      params.append("search", options.search);
    }
    
    // Add filters
    if (options.filter && Object.keys(options.filter).length > 0) {
      Object.entries(options.filter).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(`filter[${key}]`, v.toString()));
          } else {
            params.append(`filter[${key}]`, value.toString());
          }
        }
      });
    }
    
    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
  }

  /**
   * HTTP method wrappers
   */
  public async get<T>(
    url: string,
    params?: Record<string, any>,
    mockData?: T
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      url, 
      { method: "GET", params },
      mockData
    );
  }

  public async post<T>(
    url: string,
    data: unknown,
    mockData?: T
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      url,
      { method: "POST", data },
      mockData
    );
  }

  public async put<T>(
    url: string,
    data: unknown,
    mockData?: T
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      url,
      { method: "PUT", data },
      mockData
    );
  }

  public async patch<T>(
    url: string,
    data: unknown,
    mockData?: T
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      url,
      { method: "PATCH", data },
      mockData
    );
  }

  public async delete<T>(
    url: string,
    mockData?: T
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      url,
      { method: "DELETE" },
      mockData
    );
  }

  /**
   * Get paginated data with automatic query param building
   */
  public async getPaginated<T>(
    endpoint: string,
    options: PaginationOptions = {},
    mockData?: PaginatedData<T>
  ): Promise<ApiResponse<PaginatedData<T>>> {
    const queryString = this.buildQueryParams(options);
    return this.request<PaginatedData<T>>(
      `${endpoint}${queryString}`,
      { method: "GET" },
      mockData || {
        content: [] as T[],
        totalElements: 0,
        totalPages: 0,
        number: options.page || 0,
        size: options.pageSize || 10,
      }
    );
  }

  /**
   * Log a user action
   */
  public logUserAction(
    module: string,
    action: string,
    message: string,
    data?: Record<string, any>
  ): void {
    LoggingService.logUserAction(module, action, message, data);
  }
}

export default EnhancedApiService.getInstance();
