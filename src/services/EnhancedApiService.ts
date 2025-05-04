
import axios, { AxiosRequestConfig, AxiosRequestHeaders } from "axios";
import { toast } from "sonner";
import { getAccessToken, removeAccessToken } from "./TokenService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// Paginated response interface
export interface PaginatedData<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

// Pagination options interface
export interface PaginationOptions {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

class EnhancedApiService {
  static axiosInstance: any;

  static initialize() {
    EnhancedApiService.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json"
      }
    });

    EnhancedApiService.axiosInstance.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        if (error.response?.status === 401) {
          removeAccessToken();
          window.location.href = "/login";
          toast.error("Your session has expired. Please log in again.");
        }
        return Promise.reject(error);
      }
    );
  }

  static addAuthToken(config: AxiosRequestConfig) {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }

  static handleApiError(error: any, url: string, method: string) {
    const errorData = {
      code: "API_ERROR",
      message: "API request failed",
      details: {
        url,
        method,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      }
    };
    console.error("API Error:", errorData);
    toast.error(`API request failed: ${error.message}`);
  }

  static async get<T>(url: string, params?: any, headers?: any): Promise<T> {
    try {
      const config: AxiosRequestConfig = {
        params,
        headers: headers || {}
      };
      this.addAuthToken(config);
      const response = await this.axiosInstance.get(url, config);
      return response.data;
    } catch (error) {
      this.handleApiError(error, url, "GET");
      throw error;
    }
  }

  static async post<T>(url: string, data?: any, headers?: any): Promise<T> {
    try {
      const config: AxiosRequestConfig = {
        headers: headers || {}
      };
      this.addAuthToken(config);
      const response = await this.axiosInstance.post(url, data, config);
      return response.data;
    } catch (error) {
      this.handleApiError(error, url, "POST");
      throw error;
    }
  }

  static async put<T>(url: string, data?: any, headers?: any): Promise<T> {
    try {
      const config: AxiosRequestConfig = {
        headers: headers || {}
      };
      this.addAuthToken(config);
      const response = await this.axiosInstance.put(url, data, config);
      return response.data;
    } catch (error) {
      this.handleApiError(error, url, "PUT");
      throw error;
    }
  }

  static async delete<T>(url: string, headers?: any): Promise<T> {
    try {
      const config: AxiosRequestConfig = {
        headers: headers || {}
      };
      this.addAuthToken(config);
      const response = await this.axiosInstance.delete(url, config);
      return response.data;
    } catch (error) {
      this.handleApiError(error, url, "DELETE");
      throw error;
    }
  }

  static async getPaginated<T>(url: string, options: PaginationOptions = {}, params: any = {}): Promise<PaginatedData<T>> {
    const queryParams = {
      page: options.page !== undefined ? options.page : 0,
      size: options.size || 10,
      ...params
    };
    
    if (options.sort) {
      queryParams.sort = `${options.sort},${options.direction || 'asc'}`;
    }

    return this.get<PaginatedData<T>>(url, queryParams);
  }

  static setHeader(header: string, value: string) {
    EnhancedApiService.axiosInstance.defaults.headers.common[header] = value;
  }

  static removeHeader(header: string) {
    delete EnhancedApiService.axiosInstance.defaults.headers.common[header];
  }

  static logUserAction(action: string, details?: any) {
    console.log(`[USER_ACTION] ${action}`, details);
  }
}

EnhancedApiService.initialize();

export default EnhancedApiService;
