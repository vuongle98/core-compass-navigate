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

interface ApiResponse<T> {
  data: T;
  error: any;
  message: string;
  success: boolean;
}

class ApiService {
  private static instance: ApiService;
  private baseUrl: string;
  private performanceLogs: PerformanceLog[] = [];

  private constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || "";
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  public setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  public getPerformanceLogs(): PerformanceLog[] {
    return this.performanceLogs;
  }

  public clearPerformanceLogs(): void {
    this.performanceLogs = [];
  }

  private logPerformance(log: PerformanceLog): void {
    this.performanceLogs.push(log);
    if (this.performanceLogs.length > 100) {
      this.performanceLogs.shift();
    }
    console.log(`API ${log.method} ${log.endpoint} - ${log.duration}ms - Status: ${log.status}`);
  }

  public async get<T>(endpoint: string, config: ApiRequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  public async post<T>(endpoint: string, data?: any, config: ApiRequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async put<T>(endpoint: string, data?: any, config: ApiRequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async delete<T>(endpoint: string, config: ApiRequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }

  public async getPaginated<T>(endpoint: string, params: PaginationParams = {}): Promise<ApiResponse<{
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }>> {
    const { page = 0, pageSize = 10, sort, filter, ...restParams } = params;
    
    const queryParams: Record<string, string> = {
      ...restParams,
      page: page.toString(),
      size: pageSize.toString(),
    };
    
    if (sort) {
      queryParams.sort = sort;
    }
    
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
      totalElements: number;
      totalPages: number;
      number: number;
      size: number;
    }>(endpoint, config);

    return response;
  }

  private async request<T>(endpoint: string, config: ApiRequestConfig = {}): Promise<ApiResponse<T>> {
    const { params, requiresAuth = true, ...fetchConfig } = config;
    const startTime = performance.now();
    const method = (config.method || 'GET').toUpperCase();
    
    let url = this.baseUrl + endpoint;
    if (params) {
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join("&");
      
      url += `${url.includes("?") ? "&" : "?"}${queryString}`;
    }

    const headers = new Headers(fetchConfig.headers);
    
    if (!headers.has("Content-Type") && fetchConfig.body) {
      headers.set("Content-Type", "application/json");
    }
    
    if (requiresAuth) {
      if (AuthService.isAuthenticated() && AuthService.needsRefresh()) {
        try {
          await AuthService.refreshToken();
        } catch (error) {
          console.error("Token refresh failed", error);
        }
      }

      const token = AuthService.getAccessToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      } else if (requiresAuth) {
        AuthService.logout();
        throw new Error("Authentication required");
      }
    }

    this.logUserAction('api_request', { 
      endpoint, 
      method,
      timestamp: new Date().toISOString()
    });

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        headers,
      });

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      this.logPerformance({
        endpoint,
        method,
        startTime,
        duration,
        status: response.status,
        success: response.ok
      });

      if (response.status === 401 && requiresAuth) {
        try {
          const newToken = await AuthService.refreshToken();
          
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
        status: 0,
        success: false
      });
      
      console.error("API request error:", error);
      this.handleError(error);
      throw error;
    }
  }

  public logUserAction(actionType: string, data: Record<string, any> = {}): void {
    const logData = {
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
      userId: AuthService.getCurrentUser()?.id || 'anonymous'
    };
    
    console.log(`USER_ACTION: ${actionType}`, logData);
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: "An unexpected error occurred" 
      }));
      
      throw {
        status: response.status,
        message: error.message || response.statusText,
      };
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    
    return {} as ApiResponse<T>;
  }

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
