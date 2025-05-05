
import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";
import EnhancedApiService from "@/services/EnhancedApiService";
import LoggingService from "@/services/LoggingService";
import { useState, useCallback } from "react";
import { debounce } from "lodash";

export interface ApiDataOptions<T> {
  endpoint: string;
  queryKey: string | string[];
  params?: Record<string, string | number | boolean | undefined>;
  mockData?: T;
  enabled?: boolean;
  refetchInterval?: number;
  refetchOnWindowFocus?: boolean;
  retry?: number;
  retryDelay?: number;
  staleTime?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
  transform?: (data: any) => T;
}

export interface ApiDataResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
  setParams: (params: Record<string, string | number | boolean | undefined>) => void;
}

/**
 * Hook for non-paginated API data fetching with parameter support
 */
export function useApiData<T>(options: ApiDataOptions<T>): ApiDataResult<T> {
  const [params, setParamsState] = useState<Record<string, string | number | boolean | undefined>>(
    options.params || {}
  );

  const fetchData = useCallback(async (): Promise<T> => {
    try {
      LoggingService.info(
        "api_data",
        "fetch_started",
        `Fetching data from ${options.endpoint}`,
        { params }
      );

      const response = await EnhancedApiService.get<T>(options.endpoint, params);
      
      // Apply transform function if provided
      const transformedData = options.transform ? options.transform(response) : response;

      LoggingService.info(
        "api_data",
        "fetch_success",
        `Successfully fetched data from ${options.endpoint}`
      );

      return transformedData;
    } catch (error) {
      LoggingService.error(
        "api_data",
        "fetch_failed",
        `Failed to fetch data from ${options.endpoint}`,
        { error, params }
      );

      // If mock data is provided, use it as fallback
      if (options.mockData !== undefined) {
        LoggingService.info(
          "api_data",
          "using_mock_data",
          `Using mock data for ${options.endpoint}`
        );
        const mockResponse = options.mockData as T;
        return options.transform ? options.transform(mockResponse) : mockResponse;
      }

      throw error;
    }
  }, [options.endpoint, options.mockData, options.transform, params]);

  // Set up query options
  const queryOptions: UseQueryOptions<T, unknown, T, QueryKey> = {
    queryKey: Array.isArray(options.queryKey) 
      ? [...options.queryKey, params] 
      : [options.queryKey, params],
    queryFn: fetchData,
    enabled: options.enabled !== false,
    staleTime: options.staleTime,
    refetchOnWindowFocus: options.refetchOnWindowFocus,
    refetchInterval: options.refetchInterval,
    retry: options.retry,
    retryDelay: options.retryDelay,
    meta: {}
  };

  // Add callbacks to meta
  if (options.onSuccess) {
    queryOptions.meta = {
      ...queryOptions.meta,
      onSuccess: options.onSuccess
    };
  }
  
  if (options.onError) {
    queryOptions.meta = {
      ...queryOptions.meta,
      onError: options.onError
    };
  }

  const { data, isLoading, isError, error, refetch } = useQuery(queryOptions);

  // Debounced parameter update to avoid too many refetches
  const setParams = useCallback(
    debounce(
      (newParams: Record<string, string | number | boolean | undefined>) => {
        LoggingService.info(
          "api_data",
          "params_updated",
          `Updated parameters for ${options.endpoint}`,
          { newParams }
        );
        setParamsState(newParams);
      },
      300
    ),
    []
  );

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    setParams,
  };
}

export default useApiData;
