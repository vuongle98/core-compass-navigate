
import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, QueryKey } from "@tanstack/react-query";
import EnhancedApiService from "@/services/EnhancedApiService";
import useLocalStorage from "./use-local-storage";
import useDebounce from "./use-debounce";
import { PaginatedData, PaginationOptions } from "@/types/Common";

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
  isPaginated?: boolean;
}

export function useApiQuery<T>({
  endpoint,
  queryKey,
  initialPage = 0,
  initialPageSize = 10,
  initialFilters = {},
  persistFilters = false,
  persistKey,
  debounceMs = 300,
  mockData,
  onError,
  isPaginated = true,
}: UseApiQueryProps<T>) {
  const storageKey = persistKey || `filters-${endpoint.replace(/\//g, "-")}`;
  const [filtersState, setFiltersState] =
    useState<ApiQueryFilters>(initialFilters);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  
  // Prevents multiple refetches
  const isInitialMount = useRef(true);

  // Use debounce for filter changes to prevent too many API calls
  const debouncedFilters = useDebounce(filtersState, debounceMs);

  // Load persisted filters from localStorage if enabled
  const [persistedFilters, setPersistedFilters] =
    useLocalStorage<ApiQueryFilters>(
      persistFilters ? storageKey : "",
      initialFilters
    );

  // Initialize filters from persisted if available
  useEffect(() => {
    if (persistFilters && Object.keys(persistedFilters).length > 0 && isInitialMount.current) {
      setFiltersState(persistedFilters);
      isInitialMount.current = false;
    }
  }, [persistFilters, persistedFilters]);

  // Update persisted filters when filters change
  const setFilters = useCallback(
    (newFilters: ApiQueryFilters) => {
      setFiltersState(newFilters);
      if (persistFilters) {
        setPersistedFilters(newFilters);
      }
      // Reset to first page when filters change
      setPage(0);
    },
    [persistFilters, setPersistedFilters]
  );

  // Helper to set search term
  const setSearch = useCallback(
    (searchTerm: string) => {
      setFilters({ ...filtersState, search: searchTerm });
    },
    [filtersState, setFilters]
  );

  // Reset filters to initial state
  const resetFilters = useCallback(() => {
    setFiltersState(initialFilters);
    if (persistFilters) {
      setPersistedFilters(initialFilters);
    }
    setPage(0);
  }, [initialFilters, persistFilters, setPersistedFilters]);

  // Convert filters to query params
  const buildQueryParams = useCallback(
    (currentFilters: ApiQueryFilters): PaginationOptions => {
      const params: PaginationOptions = {
        page,
        size: pageSize,
      };

      // Add valid filter values to query params
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          params[key] = value;
        }
      });

      return params;
    },
    [page, pageSize]
  );

  // API query with pagination and filters
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...queryKey, page, pageSize, debouncedFilters],
    queryFn: async () => {
      try {
        const params = buildQueryParams(debouncedFilters);

        if (isPaginated) {
          const response = await EnhancedApiService.getPaginated<T>(
            endpoint,
            params
          );
          return response;
        } else {
          // For non-paginated endpoints
          const response = await EnhancedApiService.get<T[]>(endpoint, params);
          // Convert to paginated format for consistency
          return {
            content: response,
            totalElements: response.length,
            totalPages: 1,
            number: 0,
            size: response.length,
          } as PaginatedData<T>;
        }
      } catch (err) {
        // Handle mock data for testing or development
        if (mockData) {
          console.warn("Using mock data for", endpoint);
          return mockData;
        }
        throw err;
      }
    },
    staleTime: 30000, // Cache results for 30 seconds to prevent rapid refetching
    meta: {
      onError: onError,
    },
  });

  // Force refetch only when page or pageSize changes explicitly by user action
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;
  
  useEffect(() => {
    // Skip the initial render to prevent duplicate calls
    if (!isInitialMount.current) {
      refetchRef.current();
    }
  }, [page, pageSize]);

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
    filters: filtersState,
    setFilters,
    setSearch,
    resetFilters,
    refresh,
  };
}

export default useApiQuery;
