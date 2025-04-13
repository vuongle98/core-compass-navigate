
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.example.com';
const API_TIMEOUT = 30000; // 30 seconds

// Type definitions for API responses
interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

interface PaginatedData<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

interface PaginationOptions {
  page?: number;
  pageSize?: number;
  sort?: string;
  filter?: Record<string, string | number | boolean>;
}

interface UserActionData {
  [key: string]: any;
}

// Helper function to simulate API delay in development
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Configure axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error codes
    if (error.response) {
      const { status } = error.response;
      
      // Auth errors
      if (status === 401) {
        // Token expired or invalid
        // Redirect to login or refresh token
        console.log('Authentication error - redirecting to login');
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
      
      // Permission errors
      if (status === 403) {
        console.error('Permission denied');
        // Show permission denied message
      }
      
      // Not found
      if (status === 404) {
        console.error('Resource not found');
        // Handle not found
      }
      
      // Validation errors
      if (status === 422) {
        console.error('Validation failed', error.response.data);
        // Return validation errors to form
      }
      
      // Server errors
      if (status >= 500) {
        console.error('Server error', error.response.data);
        // Show server error notification
      }
    } else if (error.request) {
      // Network error (no response received)
      console.error('Network error - no response received');
      // Show network error notification
    } else {
      // Something happened in setting up the request
      console.error('Error', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Generic request function
const makeRequest = async <T>(
  url: string, 
  options: AxiosRequestConfig = {}
): Promise<ApiResponse<T>> => {
  try {
    // For development without a real API, simulate responses
    if (import.meta.env.DEV || import.meta.env.VITE_MOCK_API === 'true') {
      await sleep(300);
      
      // Log the request for development
      console.log(`API ${options.method || 'GET'} ${url} - 200ms - Status: 200`);
      
      return {
        data: {} as T,
        status: 200,
        statusText: 'OK',
      };
    }
    
    // Make the actual API call
    const startTime = Date.now();
    const response: AxiosResponse<T> = await apiClient(url, options);
    const duration = Date.now() - startTime;
    
    // Log response time for performance monitoring
    console.log(`API ${options.method || 'GET'} ${url} - ${duration}ms - Status: ${response.status}`);
    console.log('API response:', response.data);
    
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  } catch (error) {
    // Error handling is done in the axios interceptor
    throw error;
  }
};

// HTTP method wrappers
const get = async <T>(url: string, params?: object): Promise<ApiResponse<T>> => {
  return makeRequest<T>(url, { method: 'GET', params });
};

const post = async <T>(url: string, data: object): Promise<ApiResponse<T>> => {
  return makeRequest<T>(url, { method: 'POST', data });
};

const put = async <T>(url: string, data: object): Promise<ApiResponse<T>> => {
  return makeRequest<T>(url, { method: 'PUT', data });
};

const patch = async <T>(url: string, data: object): Promise<ApiResponse<T>> => {
  return makeRequest<T>(url, { method: 'PATCH', data });
};

const del = async <T>(url: string): Promise<ApiResponse<T>> => {
  return makeRequest<T>(url, { method: 'DELETE' });
};

// Pagination helper
const getPaginated = async <T>(endpoint: string, options: PaginationOptions = {}): Promise<ApiResponse<PaginatedData<T>>> => {
  try {
    // Mock response for development
    if (import.meta.env.DEV || import.meta.env.VITE_MOCK_API === 'true') {
      await sleep(500);
      
      // Return mock data in the correct format expected by the DataTable component
      return {
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: options.page || 0,
          size: options.pageSize || 10,
        },
        status: 200,
        statusText: 'OK',
      };
    }
    
    // Build query parameters for pagination, sorting, and filtering
    const queryParams = new URLSearchParams();
    
    if (options.page !== undefined) {
      queryParams.append('page', options.page.toString());
    }
    
    if (options.pageSize !== undefined) {
      queryParams.append('size', options.pageSize.toString());
    }
    
    if (options.sort) {
      queryParams.append('sort', options.sort);
    }
    
    // Add filters if present
    if (options.filter && Object.keys(options.filter).length > 0) {
      Object.entries(options.filter).forEach(([key, value]) => {
        queryParams.append(`filter[${key}]`, value.toString());
      });
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    // Make the request
    const response = await makeRequest<PaginatedData<T>>(`${endpoint}${queryString}`, {
      method: 'GET'
    });
    
    return response;
  } catch (error) {
    console.error('Error fetching paginated data:', error);
    throw error;
  }
};

// User action logging for analytics
const logUserAction = (action: string, data: UserActionData = {}) => {
  // Add timestamp and user info
  const eventData = {
    ...data,
    timestamp: new Date().toISOString(),
    userId: localStorage.getItem('userId') || `user-${Date.now()}`
  };
  
  // Log to console in development
  console.info('USER_ACTION:', action, eventData);
  
  // In a real app, send to analytics service or API
  if (import.meta.env.PROD) {
    post('/api/analytics/events', {
      action,
      data: eventData
    }).catch(err => console.error('Failed to log user action:', err));
  }
};

// Export the API service
const ApiService = {
  get,
  post,
  put,
  patch,
  delete: del,
  getPaginated,
  logUserAction
};

export default ApiService;
