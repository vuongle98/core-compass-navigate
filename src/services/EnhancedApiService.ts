import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import TokenService from "./TokenService";
import LoggingService from "./LoggingService";
import { ApiResponse, PaginatedData, PaginationOptions } from "@/types/Common";

class EnhancedApiService {
  private static instance: AxiosInstance;

  /**
   * Initialize the API service
   */
  private static initialize(): void {
    if (!this.instance) {
      this.instance = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL || "",
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      });

      // Request interceptor to add auth token
      this.instance.interceptors.request.use(
        (config) => {
          const token = TokenService.getToken();
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          } else {
            config.headers.Authorization = "";
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
              this.instance.defaults.headers.common[
                "Authorization"
              ] = `Bearer ${token}`;
              return this.instance(originalRequest);
            } catch (refreshError) {
              LoggingService.error(
                "api",
                "token_refresh_failed",
                "Token refresh failed",
                refreshError
              );
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
  public static async get<T>(
    url: string,
    params?: Record<string, unknown>,
    headers?: Record<string, string>,
    responseType: AxiosRequestConfig["responseType"] = "json"
  ): Promise<T> {
    this.initialize();
    LoggingService.info("api", "get", `GET ${url}`);

    try {
      const response = await this.instance.get<ApiResponse<T>>(url, {
        params,
        headers,
        responseType,
      });

      if (responseType === "blob") {
        return response.data as unknown as T;
      }

      return response.data.data;
    } catch (error) {
      LoggingService.error("api", "get_failed", `GET ${url} failed`, error);
      throw error;
    }
  }

  /**
   * Make a POST request
   */
  public static async post<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    this.initialize();
    LoggingService.info("api", "post", `POST ${url}`);

    try {
      const response = await this.instance.post<ApiResponse<T>>(
        url,
        data,
        config
      );
      return response.data.data;
    } catch (error) {
      LoggingService.error("api", "post_failed", `POST ${url} failed`, error);
      throw error;
    }
  }

  /**
   * Make a PUT request
   */
  public static async put<T, D = unknown>(
    url: string,
    data?: D,
    headers?: Record<string, string>
  ): Promise<T> {
    this.initialize();
    LoggingService.info("api", "put", `PUT ${url}`);

    try {
      const response = await this.instance.put<ApiResponse<T>>(url, data, {
        headers,
      });
      return response.data.data;
    } catch (error) {
      LoggingService.error("api", "put_failed", `PUT ${url} failed`, error);
      throw error;
    }
  }

  /**
   * Make a PATCH request
   */
  public static async patch<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    this.initialize();
    LoggingService.info("api", "patch", `PATCH ${url}`);

    try {
      const response = await this.instance.patch<ApiResponse<T>>(
        url,
        data,
        config
      );
      return response.data.data;
    } catch (error) {
      LoggingService.error("api", "patch_failed", `PATCH ${url} failed`, error);
      throw error;
    }
  }

  /**
   * Make a DELETE request
   */
  public static async delete<T>(
    url: string,
    headers?: Record<string, string>
  ): Promise<T> {
    this.initialize();
    LoggingService.info("api", "delete", `DELETE ${url}`);

    try {
      const response = await this.instance.delete<ApiResponse<T>>(url, {
        headers,
      });
      return response.data.data;
    } catch (error) {
      LoggingService.error(
        "api",
        "delete_failed",
        `DELETE ${url} failed`,
        error
      );
      throw error;
    }
  }

  /**
   * Get paginated data
   */
  public static async getPaginated<T>(
    url: string,
    options?: PaginationOptions,
    headers?: Record<string, string>
  ): Promise<PaginatedData<T>> {
    const params = {
      page: options?.page || 0,
      size: options?.size || 10,
      sort: options?.sort || "id,desc",
      ...options,
    };

    const response = await this.get<PaginatedData<T>>(url, params, headers);
    return response;
  }

  /**
   * Log user actions
   */
  static logUserAction(
    module: string,
    action: string,
    description: string | Record<string, unknown>,
    metadata?: Record<string, unknown>
  ) {
    return LoggingService.logUserAction(module, action, description, metadata);
  }
}

export default EnhancedApiService;
