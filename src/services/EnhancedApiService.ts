import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosResponse, AxiosRequestHeaders } from 'axios';
import { toast } from 'sonner';
import { getAccessToken, removeAccessToken } from './TokenService';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface ApiException {
  code: string;
  message: string;
  details?: any;
}

class EnhancedApiService {
  private static axiosInstance: AxiosInstance;

  static initialize() {
    EnhancedApiService.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    EnhancedApiService.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          removeAccessToken();
          window.location.href = '/login';
          toast.error('Your session has expired. Please log in again.');
        }
        return Promise.reject(error);
      }
    );
  }

  private static addAuthToken(config: AxiosRequestConfig): void {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  private static handleApiError(error: any, url: string, method: string): void {
    const errorData: ApiException = {
      code: 'API_ERROR',
      message: 'API request failed',
      details: {
        url: url,
        method: method,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      },
    };

    console.error('API Error:', errorData);
    toast.error(`API request failed: ${error.message}`);
  }

  static async get<T>(url: string, params?: any, headers?: AxiosRequestHeaders): Promise<T> {
    try {
      const config: AxiosRequestConfig = {
        params,
        headers: headers || {} as AxiosRequestHeaders
      };
      
      // Add authentication token if available
      this.addAuthToken(config);

      const response = await axios.get(url, config);
      return response.data;
    } catch (error) {
      this.handleApiError(error, url, 'GET');
      throw error;
    }
  }

  static async post<T>(url: string, data: any, headers?: AxiosRequestHeaders): Promise<T> {
    try {
      const config: AxiosRequestConfig = {
        headers: headers || {} as AxiosRequestHeaders,
      };
      this.addAuthToken(config);
      const response = await axios.post(url, data, config);
      return response.data;
    } catch (error) {
      this.handleApiError(error, url, 'POST');
      throw error;
    }
  }

  static async put<T>(url: string, data: any, headers?: AxiosRequestHeaders): Promise<T> {
    try {
      const config: AxiosRequestConfig = {
        headers: headers || {} as AxiosRequestHeaders,
      };
      this.addAuthToken(config);
      const response = await axios.put(url, data, config);
      return response.data;
    } catch (error) {
      this.handleApiError(error, url, 'PUT');
      throw error;
    }
  }

  static async delete<T>(url: string, headers?: AxiosRequestHeaders): Promise<T> {
    try {
      const config: AxiosRequestConfig = {
        headers: headers || {} as AxiosRequestHeaders,
      };
      this.addAuthToken(config);
      const response = await axios.delete(url, config);
      return response.data;
    } catch (error) {
      this.handleApiError(error, url, 'DELETE');
      throw error;
    }
  }

  static setHeader(header: string, value: string): void {
    EnhancedApiService.axiosInstance.defaults.headers.common[header] = value;
  }

  static removeHeader(header: string): void {
    delete EnhancedApiService.axiosInstance.defaults.headers.common[header];
  }
}

EnhancedApiService.initialize();

export default EnhancedApiService;
