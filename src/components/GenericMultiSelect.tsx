import React, { useEffect, useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

import useApiQuery from "@/hooks/use-api-query";

interface GenericMultiSelectProps<T> {
  value: Array<string | number>;
  onChange: (value: Array<string | number>) => void;
  endpoint: string;
  queryKey: string | any[];
  getOptionLabel: (option: T) => React.ReactNode;
  getOptionValue: (option: T) => string | number;
  label?: string;
  disabled?: boolean;
  placeholder?: string;
  transformData?: (data: any) => T[];
}

function GenericMultiSelect<T>({
  value,
  onChange,
  endpoint,
  queryKey,
  getOptionLabel,
  getOptionValue,
  label = "Select",
  disabled = false,
  placeholder = "Select options...",
  transformData,
}: GenericMultiSelectProps<T>) {

  const [allOptions, setAllOptions] = React.useState<T[]>([]);
  const [isFetchingMore, setIsFetchingMore] = React.useState(false);
  const [last, setLast] = React.useState(false);

  const [page, setPage] = React.useState(0);

  const {
    data,
    isLoading,
    error,
    refresh,
    pageSize,
    setPageSize,
    totalPages
  } = useApiQuery<T>({
    endpoint: endpoint.includes("page=") ? endpoint.replace(/page=\d+/, `page=${page}`) : `${endpoint}${endpoint.includes("?") ? "&" : "?"}page=${page}`,
    queryKey: Array.isArray(queryKey) ? [...queryKey, page] : [queryKey, page],
    initialPage: 0,
    initialPageSize: 10,
    mockData: { content: [], totalElements: 0, totalPages: 1, number: 0, size: 1000 },
  });

  React.useEffect(() => {
    let pageOptions: T[] = [];
    let isLast = true;
    if (transformData) {
      pageOptions = transformData(data);
    } else if (data && Array.isArray(data)) {
      pageOptions = data;
    }

    // Use page and totalPages to determine last page
    isLast = typeof totalPages === "number" ? page >= totalPages - 1 : true;
    setLast(isLast);
    setIsFetchingMore(false);

    console.log("pageOptions", pageOptions);
    console.log("isLast", isLast);

    if (page === 0) {
      // Only update if new options are different
      if (JSON.stringify(allOptions) !== JSON.stringify(pageOptions)) {
        setAllOptions(pageOptions);
      }
    } else if (pageOptions.length > 0) {
      // Only add truly new options
      const newOptions = pageOptions.filter(
        (option) => !allOptions.some((existing) => getOptionValue(existing) === getOptionValue(option))
      );
      if (newOptions.length > 0) {
        setAllOptions((prev) => [...prev, ...newOptions]);
      }
    }
    // eslint-disable-next-line
  }, [data, page]); // Remove transformData unless memoized


  const handleFetchMore = () => {
    if (!last && !isFetchingMore) {
      setIsFetchingMore(true);
      setPage((prev) => prev + 1);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 24 && !last && !isFetchingMore) {
      handleFetchMore();
    }
  };

  const handleSelect = (optionValue: string | number) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((id) => id !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };


  return (
    <div>
      {label && <label className="block mb-1 font-medium">{label}</label>}
      {isLoading && page === 0 ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : error ? (
        <div className="text-destructive">{String(error)}</div>
      ) : (
        <Select disabled={disabled}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent onScroll={handleScroll} style={{ maxHeight: 300, overflowY: 'auto' }}>
            {allOptions.map((option) => {
              const optionValue = getOptionValue(option);
              return (
                <SelectItem
                  key={optionValue}
                  value={String(optionValue)}
                  onClick={() => handleSelect(optionValue)}
                  className={value.includes(optionValue) ? "bg-primary/10" : ""}
                >
                  {getOptionLabel(option)}
                </SelectItem>
              );
            })}
            {isFetchingMore && (
              <div className="flex justify-center py-2 text-xs text-muted-foreground">Loading more...</div>
            )}
            {!isFetchingMore && last && allOptions.length === 0 && (
              <div className="flex justify-center py-2 text-xs text-muted-foreground">No options</div>
            )}
          </SelectContent>
        </Select>
      )}
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {allOptions
            .filter((option) => value.includes(getOptionValue(option)))
            .map((option) => (
              <span key={getOptionValue(option)} className="px-2 py-1 rounded bg-primary/10 text-xs">
                {getOptionLabel(option)}
              </span>
            ))}
        </div>
      )}
    </div>
  );
}


export default GenericMultiSelect;
