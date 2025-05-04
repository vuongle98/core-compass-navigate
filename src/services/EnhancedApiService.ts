import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import LoggingService from './LoggingService';
import AuthService from './AuthService';
import ServiceRegistry from './ServiceRegistry';

// Define custom type for request config with meta information
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  meta?: {
    startTime: number;
    [key: string]: any;
  };
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
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
  size?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  [key: string]: any;
}

/**
 * Enhanced API service with logging, authentication, and error handling
 */
class EnhancedApiService {
  private axiosInstance: AxiosInstance;
  private baseURL: string = import.meta.env.VITE_API_BASE_URL || '/api';
  
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    this.setupInterceptors();
  }
  
  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Start timing for performance logging
        const startTime = Date.now();
        const customConfig = config as CustomAxiosRequestConfig;
        customConfig.meta = { startTime };
        
        // Add auth token if available
        const token = AuthService.getAccessToken();
        if (token) {
          config.headers = config.headers || {};
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Log the request
        LoggingService.logApiRequest(
          config.url || '',
          config.method?.toUpperCase() || 'UNKNOWN', 
          config.data,
          startTime
        );
        
        return customConfig;
      },
      (error) => {
        LoggingService.error(
          'api',
          'request_error',
          'Request failed',
          { error: error.message }
        );
        return Promise.reject(error);
      }
    );
    
    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Get timing info
        const customConfig = response.config as CustomAxiosRequestConfig;
        const startTime = customConfig.meta?.startTime || Date.now() - 100;
        
        // Log the response
        LoggingService.logApiResponse(
          response.config.url || '',
          response.config.method?.toUpperCase() || 'UNKNOWN',
          response.status,
          response.data,
          startTime
        );
        
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig & { _retry?: boolean };
        const startTime = originalRequest?.meta?.startTime || Date.now() - 100;
        
        // Log the error
        LoggingService.logApiError(
          originalRequest?.url || 'unknown',
          originalRequest?.method?.toUpperCase() || 'UNKNOWN',
          error,
          startTime
        );
        
        // Handle 401 Unauthorized errors
        if (error.response?.status === 401 && !originalRequest?._retry) {
          originalRequest._retry = true;
          
          try {
            // Try to refresh the token
            const refreshed = await AuthService.refreshAuth();
            
            if (refreshed) {
              // Retry with new token
              const token = AuthService.getAccessToken();
              if (token && originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
              }
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            LoggingService.error(
              'api',
              'token_refresh_error',
              'Failed to refresh token',
              { error: refreshError }
            );
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Log user activity through the API service
   */
  public logUserAction(module: string, action: string, data?: Record<string, any>): void {
    LoggingService.logUserAction(module, action, `User performed ${action} in ${module}`, data);
  }
  
  /**
   * Generic get request
   */
  public async get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, { 
      params, 
      ...config 
    });
    return response.data;
  }
  
  /**
   * Generic post request
   */
  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }
  
  /**
   * Generic put request
   */
  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }
  
  /**
   * Generic delete request
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }
  
  /**
   * Generic patch request
   */
  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }
  
  /**
   * Handle paginated requests
   */
  public async getPaginated<T>(
    url: string, 
    options: PaginationOptions = { page: 0, size: 10 }
  ): Promise<PaginatedData<T>> {
    const params = {
      page: options.page || 0,
      size: options.size || 10,
      ...options
    };
    
    const response = await this.axiosInstance.get<PaginatedData<T>>(url, { params });
    return response.data;
  }
  
  /**
   * Get base URL
   */
  public getBaseURL(): string {
    return this.baseURL;
  }
  
  /**
   * Get axios instance for direct use if needed
   */
  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
  
  /**
   * Format URL with path parameters
   */
  public formatUrl(url: string, params: Record<string, string | number>): string {
    let formattedUrl = url;
    Object.entries(params).forEach(([key, value]) => {
      formattedUrl = formattedUrl.replace(`:${key}`, String(value));
    });
    return formattedUrl;
  }
}

// Create and export singleton instance
const enhancedApiService = new EnhancedApiService();
export default enhancedApiService;
