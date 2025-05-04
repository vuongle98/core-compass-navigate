import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AuthService from './AuthService';
import LoggingService from './LoggingService';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/**
 * Enhanced API Service with built-in authentication, logging, and error handling
 */
class EnhancedApiService {
  private readonly axiosInstance: AxiosInstance;
  private readonly baseURL: string;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    this.initializeRequestInterceptor();
    this.initializeResponseInterceptor();
  }
  
  /**
   * Initialize request interceptor to add authentication token
   */
  private initializeRequestInterceptor = () => {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        LoggingService.debug('api_request', 'request_intercepted', `Request to ${config.url}`, {
          method: config.method,
          headers: config.headers,
          data: config.data,
        });
        
        return EnhancedApiService.addAuthHeader(config);
      },
      (error: AxiosError) => {
        LoggingService.error('api_request', 'request_failed', 'Request failed before sending', { error });
        return Promise.reject(error);
      }
    );
  };
  
  /**
   * Initialize response interceptor to handle errors and log responses
   */
  private initializeResponseInterceptor = () => {
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        LoggingService.debug('api_response', 'response_received', `Response from ${response.config.url}`, {
          status: response.status,
          data: response.data,
        });
        return response;
      },
      async (error: AxiosError) => {
        LoggingService.error('api_response', 'response_error', 'Response error', { error });
        
        if (error.response?.status === 401) {
          try {
            // Attempt to refresh the token
            await AuthService.refreshToken();
            
            // Retry the original request
            return this.axiosInstance.request(EnhancedApiService.addAuthHeader(error.config as AxiosRequestConfig));
          } catch (refreshError) {
            LoggingService.error('api_response', 'token_refresh_failed', 'Token refresh failed', { error: refreshError });
            // Redirect to login or handle unauthorized state
            AuthService.logout();
            window.location.href = '/login';
            return Promise.reject(error);
          }
        }
        
        return Promise.reject(error);
      }
    );
  };
  
  /**
   * Prepare headers with auth token if available
   */
  private static getHeaders(contentType = 'application/json'): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Accept': 'application/json',
    };

    // Use getAccessToken instead of non-existent method
    const token = AuthService.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }
  
  /**
   * GET request
   */
  public async get<T>(endpoint: string, params: any = {}, mockData?: T): Promise<T> {
    try {
      const response = await this.axiosInstance.get<T>(endpoint, { params });
      return response.data;
    } catch (error) {
      LoggingService.error('api_request', 'get_failed', `GET request to ${endpoint} failed`, { error, params });
      if (mockData !== undefined) {
        LoggingService.info('api_request', 'using_mock_data', `Using mock data for ${endpoint}`);
        return mockData;
      }
      throw error;
    }
  }
  
  /**
   * POST request
   */
  public async post<T>(endpoint: string, data: any = {}, options: any = {}): Promise<T> {
    try {
      const response = await this.axiosInstance.post<T>(endpoint, data, options);
      return response.data;
    } catch (error) {
      LoggingService.error('api_request', 'post_failed', `POST request to ${endpoint} failed`, { error, data });
      throw error;
    }
  }
  
  /**
   * PUT request
   */
  public async put<T>(endpoint: string, data: any = {}, options: any = {}): Promise<T> {
    try {
      const response = await this.axiosInstance.put<T>(endpoint, data, options);
      return response.data;
    } catch (error) {
      LoggingService.error('api_request', 'put_failed', `PUT request to ${endpoint} failed`, { error, data });
      throw error;
    }
  }
  
  /**
   * DELETE request
   */
  public async delete<T>(endpoint: string, options: any = {}): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<T>(endpoint, options);
      return response.data;
    } catch (error) {
      LoggingService.error('api_request', 'delete_failed', `DELETE request to ${endpoint} failed`, { error });
      throw error;
    }
  }
  
  /**
   * GET request with pagination support
   */
  public async getPaginated<T>(
    endpoint: string,
    params: { page: number; pageSize: number; filter?: Record<string, string | number | boolean | string[]> }
  ): Promise<PaginatedResponse<T>> {
    try {
      const response = await this.axiosInstance.get<PaginatedResponse<T>>(endpoint, { params });
      return response.data;
    } catch (error) {
      LoggingService.error('api_request', 'get_paginated_failed', `GET request to ${endpoint} failed`, { error, params });
      throw error;
    }
  }
  
  /**
   * Add authentication header to fetch options
   */
  private static addAuthHeader(options: AxiosRequestConfig): AxiosRequestConfig {
    // Use getAccessToken instead of non-existent method
    const token = AuthService.getAccessToken();
    
    if (token && options.headers) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return options;
  }
}

// Use environment variable for base URL
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const apiService = new EnhancedApiService(baseURL);

export default apiService;
