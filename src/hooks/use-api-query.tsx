
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import EnhancedApiService, { 
  PaginationOptions, 
  PaginatedData 
} from "@/services/EnhancedApiService";
import LoggingService from "@/services/LoggingService";
import { debounce } from 'lodash';

export interface ApiQueryFilters {
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface ApiQueryOptions<T> {
  endpoint: string;
  queryKey: string | string[];
  initialFilters?: ApiQueryFilters;
  initialSort?: string | string[];
  initialPage?: number;
  initialPageSize?: number;
  mockData?: PaginatedData<T>;
  persistFilters?: boolean;
  debounceMs?: number;
  onError?: (error: unknown) => void;
}

export interface ApiQueryResult<T> {
  data: T[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  filters: ApiQueryFilters;
  sort: string | string[] | undefined;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilters: (filters: ApiQueryFilters) => void;
  setSort: (sort: string | string[]) => void;
  setSearch: (search: string) => void;
  resetFilters: () => void;
  refresh: () => void;
}

/**
 * Hook for API data fetching with filter, pagination and sorting support
 */
export function useApiQuery<T>(options: ApiQueryOptions<T>): ApiQueryResult<T> {
  // URL search params for persisting filters
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get initial values, either from URL params (if persistFilters) or from options
  const getInitialValue = <V,>(
    key: string, 
    defaultValue: V,
    parser?: (value: string) => V
  ): V => {
    if (options.persistFilters && searchParams.has(key)) {
      const value = searchParams.get(key);
      if (value !== null && parser) {
        return parser(value);
      }
      return value as unknown as V;
    }
    return defaultValue;
  };

  // State for pagination, filters, and sorting
  const [page, setPageInternal] = useState(
    getInitialValue('page', options.initialPage || 0, Number)
  );
  const [pageSize, setPageSizeInternal] = useState(
    getInitialValue('pageSize', options.initialPageSize || 10, Number)
  );
  const [filters, setFiltersInternal] = useState<ApiQueryFilters>(
    options.persistFilters 
      ? Object.fromEntries(
          Array.from(searchParams.entries()).filter(
            ([key]) => !['page', 'pageSize', 'sort', 'search'].includes(key)
          )
        )
      : options.initialFilters || {}
  );
  const [sort, setSortInternal] = useState<string | string[] | undefined>(
    getInitialValue('sort', options.initialSort, 
      (val) => val.includes(',') ? val.split(',') : val
    )
  );

  // Build query key
  const queryKey = useMemo(() => {
    const baseKey = Array.isArray(options.queryKey) ? options.queryKey : [options.queryKey];
    return [...baseKey, page, pageSize, sort, filters];
  }, [options.queryKey, page, pageSize, sort, filters]);

  // Create query function
  const fetchData = useCallback(async () => {
    const paginationOptions: PaginationOptions = {
      page,
      pageSize,
      sort,
      search: filters.search,
      filter: { ...filters }
    };
    
    // Remove search from filters as it's passed separately
    if (paginationOptions.filter?.search) {
      delete paginationOptions.filter.search;
    }

    LoggingService.debug(
      "api_query", 
      "fetch_data", 
      `Fetching ${options.endpoint} with options`,
      { paginationOptions }
    );

    const response = await EnhancedApiService.getPaginated<T>(
      options.endpoint, 
      paginationOptions,
      options.mockData
    );
    
    return response.data;
  }, [options.endpoint, options.mockData, page, pageSize, sort, filters]);

  // Setup the query
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: fetchData,
    meta: options.onError ? {
      onError: options.onError
    } : undefined,
  });

  // Update URL params if persistFilters is enabled
  useEffect(() => {
    if (options.persistFilters) {
      const newParams = new URLSearchParams();
      
      // Add pagination
      newParams.set("page", page.toString());
      newParams.set("pageSize", pageSize.toString());
      
      // Add sort
      if (sort) {
        if (Array.isArray(sort)) {
          newParams.set("sort", sort.join(","));
        } else {
          newParams.set("sort", sort);
        }
      }
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          newParams.set(key, value.toString());
        }
      });
      
      setSearchParams(newParams);
    }
  }, [options.persistFilters, page, pageSize, sort, filters, setSearchParams]);

  // Debounced search handler
  const debouncedSetSearch = useMemo(
    () => debounce((search: string) => {
      setFiltersInternal(current => ({ ...current, search }));
      
      LoggingService.info(
        "api_query", 
        "search_applied", 
        `Applied search: ${search}`,
        { endpoint: options.endpoint, search }
      );
    }, options.debounceMs || 300),
    [options.debounceMs, options.endpoint]
  );

  // Page change handler
  const setPage = useCallback((newPage: number) => {
    setPageInternal(newPage);
    
    LoggingService.info(
      "api_query", 
      "page_changed", 
      `Changed page to ${newPage}`,
      { endpoint: options.endpoint, page: newPage }
    );
  }, [options.endpoint]);

  // Page size change handler
  const setPageSize = useCallback((newSize: number) => {
    setPageSizeInternal(newSize);
    setPageInternal(0); // Reset to first page when changing page size
    
    LoggingService.info(
      "api_query", 
      "page_size_changed", 
      `Changed page size to ${newSize}`,
      { endpoint: options.endpoint, pageSize: newSize }
    );
  }, [options.endpoint]);

  // Filters change handler
  const setFilters = useCallback((newFilters: ApiQueryFilters) => {
    setFiltersInternal(newFilters);
    setPageInternal(0); // Reset to first page when changing filters
    
    LoggingService.info(
      "api_query", 
      "filters_changed", 
      `Applied new filters`,
      { endpoint: options.endpoint, filters: newFilters }
    );
  }, [options.endpoint]);

  // Search change handler
  const setSearch = useCallback((search: string) => {
    debouncedSetSearch(search);
  }, [debouncedSetSearch]);

  // Sort change handler
  const setSort = useCallback((newSort: string | string[]) => {
    setSortInternal(newSort);
    
    LoggingService.info(
      "api_query", 
      "sort_changed", 
      `Applied new sort`,
      { endpoint: options.endpoint, sort: newSort }
    );
  }, [options.endpoint]);

  // Reset filters handler
  const resetFilters = useCallback(() => {
    setFiltersInternal(options.initialFilters || {});
    setSortInternal(options.initialSort);
    setPageInternal(0);
    
    LoggingService.info(
      "api_query", 
      "filters_reset", 
      `Reset all filters`,
      { endpoint: options.endpoint }
    );
  }, [options.endpoint, options.initialFilters, options.initialSort]);

  const refresh = useCallback(() => {
    refetch();
    
    LoggingService.info(
      "api_query", 
      "data_refreshed", 
      `Manually refreshed data`,
      { endpoint: options.endpoint }
    );
  }, [refetch, options.endpoint]);

  return {
    data: data?.content || [],
    isLoading,
    isError,
    error,
    page,
    pageSize,
    totalItems: data?.totalElements || 0,
    totalPages: data?.totalPages || 0,
    filters,
    sort,
    setPage,
    setPageSize,
    setFilters,
    setSearch,
    setSort,
    resetFilters,
    refresh
  };
}

export default useApiQuery;
