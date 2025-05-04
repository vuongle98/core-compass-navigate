
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import TokenService, * as TokenServiceExports from './TokenService';
import LoggingService from './LoggingService';

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
}

class EnhancedApiService {
  private static instance: AxiosInstance;

  /**
   * Initialize the API service
   */
  private static initialize(): void {
    if (!this.instance) {
      this.instance = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL || '',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      // Request interceptor to add auth token
      this.instance.interceptors.request.use(
        (config) => {
          const token = TokenService.getToken();
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );

      // Response interceptor for error handling
      this.instance.interceptors.response.use(
        (response) => response,
        async (error) => {
          const originalRequest = error.config;

          // Handle token refresh for 401 errors
          if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
              await TokenService.refreshToken();
              const token = TokenService.getToken();
              this.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
              return this.instance(originalRequest);
            } catch (refreshError) {
              return Promise.reject(refreshError);
            }
          }

          return Promise.reject(error);
        }
      );
    }
  }

  /**
   * Make a GET request
   */
  public static async get<T>(url: string, params?: any, headers?: any): Promise<T> {
    this.initialize();
    LoggingService.info('api', 'get', `GET ${url}`);
    
    try {
      const response = await this.instance.get<T>(url, { params, headers });
      return response.data;
    } catch (error) {
      LoggingService.error('api', 'get_failed', `GET ${url} failed`, error);
      throw error;
    }
  }

  /**
   * Make a POST request
   */
  public static async post<T>(url: string, data?: any, headers?: any): Promise<T> {
    this.initialize();
    LoggingService.info('api', 'post', `POST ${url}`);
    
    try {
      const response = await this.instance.post<T>(url, data, { headers });
      return response.data;
    } catch (error) {
      LoggingService.error('api', 'post_failed', `POST ${url} failed`, error);
      throw error;
    }
  }

  /**
   * Make a PUT request
   */
  public static async put<T>(url: string, data?: any, headers?: any): Promise<T> {
    this.initialize();
    LoggingService.info('api', 'put', `PUT ${url}`);
    
    try {
      const response = await this.instance.put<T>(url, data, { headers });
      return response.data;
    } catch (error) {
      LoggingService.error('api', 'put_failed', `PUT ${url} failed`, error);
      throw error;
    }
  }

  /**
   * Make a DELETE request
   */
  public static async delete<T>(url: string, headers?: any): Promise<T> {
    this.initialize();
    LoggingService.info('api', 'delete', `DELETE ${url}`);
    
    try {
      const response = await this.instance.delete<T>(url, { headers });
      return response.data;
    } catch (error) {
      LoggingService.error('api', 'delete_failed', `DELETE ${url} failed`, error);
      throw error;
    }
  }

  /**
   * Get paginated data
   */
  public static async getPaginated<T>(
    url: string, 
    options?: PaginationOptions,
    headers?: any
  ): Promise<PaginatedData<T>> {
    const params = {
      page: options?.page || 0,
      size: options?.size || 10,
      sort: options?.sort || 'id,desc',
      ...options
    };
    
    const response = await this.get<PaginatedData<T>>(url, params, headers);
    return response;
  }

  /**
   * Log user action
   */
  public static logUserAction(action: string, details?: any): void {
    LoggingService.logUserAction(action, details);
  }
}

export default EnhancedApiService;
