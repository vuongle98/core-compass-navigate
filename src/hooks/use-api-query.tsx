
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient, QueryKey } from '@tanstack/react-query';
import EnhancedApiService from '@/services/EnhancedApiService';
import { PaginatedData, PaginationOptions } from '@/services/EnhancedApiService';
import { toast } from 'sonner';
import useLocalStorage from './use-local-storage';

export interface ApiQueryFilters {
  [key: string]: string | number | boolean | null | undefined;
}

interface UseApiQueryProps<T> {
  endpoint: string;
  queryKey: QueryKey;
  initialPage?: number;
  initialPageSize?: number;
  initialFilters?: ApiQueryFilters;
  persistFilters?: boolean;
  persistKey?: string;
  debounceMs?: number;
  mockData?: PaginatedData<T>;
  onError?: (error: Error) => void;
}

interface PaginatedResponse<T> extends PaginatedData<T> {}

export function useApiQuery<T>({
  endpoint,
  queryKey,
  initialPage = 0,
  initialPageSize = 10,
  initialFilters = {},
  persistFilters = false,
  persistKey,
  debounceMs = 0,
  mockData,
  onError,
}: UseApiQueryProps<T>) {
  const storageKey = persistKey || `filters-${endpoint.replace(/\//g, '-')}`;
  const [filters, setFiltersState] = useState<ApiQueryFilters>(initialFilters);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const queryClient = useQueryClient();
  
  // Load persisted filters from localStorage if enabled
  const [persistedFilters, setPersistedFilters] = useLocalStorage<ApiQueryFilters>(
    persistFilters ? storageKey : '',
    initialFilters
  );

  // Initialize filters from persisted if available
  useEffect(() => {
    if (persistFilters && Object.keys(persistedFilters).length > 0) {
      setFiltersState(persistedFilters);
    }
  }, [persistFilters, persistedFilters]);

  // Update persisted filters when filters change
  const setFilters = useCallback((newFilters: ApiQueryFilters) => {
    setFiltersState(newFilters);
    if (persistFilters) {
      setPersistedFilters(newFilters);
    }
    // Reset to first page when filters change
    setPage(0);
  }, [persistFilters, setPersistedFilters]);

  // Reset filters to initial state
  const resetFilters = useCallback(() => {
    setFiltersState(initialFilters);
    if (persistFilters) {
      setPersistedFilters(initialFilters);
    }
    setPage(0);
  }, [initialFilters, persistFilters, setPersistedFilters]);

  // Convert filters to query params
  const buildQueryParams = useCallback((currentFilters: ApiQueryFilters): PaginationOptions => {
    const params: PaginationOptions = { 
      page, 
      size: pageSize 
    };
    
    // Add valid filter values to query params
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params[key] = value;
      }
    });
    
    return params;
  }, [page, pageSize]);

  // API query with pagination and filters
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...queryKey, page, pageSize, filters],
    queryFn: async () => {
      try {
        const params = buildQueryParams(filters);
        const response = await EnhancedApiService.getPaginated<T>(endpoint, params);
        return response;
      } catch (err) {
        // Handle mock data for testing or development
        if (mockData) {
          console.warn('Using mock data for', endpoint);
          return mockData;
        }
        throw err;
      }
    },
    meta: {
      onError: onError
    }
  });

  // Total items count
  const totalItems = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;
  const isError = !!error;

  // Manual refresh function
  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    data: data?.content || [],
    isLoading,
    isError,
    error,
    page,
    pageSize,
    setPage,
    setPageSize,
    totalItems,
    totalPages,
    filters,
    setFilters,
    resetFilters,
    refresh,
  };
}

export default useApiQuery;
