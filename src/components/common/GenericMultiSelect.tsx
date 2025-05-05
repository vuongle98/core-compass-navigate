
import React, { useEffect, useState, useRef } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Search, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

import useApiQuery from "@/hooks/use-api-query";

interface GenericMultiSelectProps<T> {
  /**
   * The selected values - can be an array of primitive values (string|number)
   * or an array of objects that match type T
   */
  value: T[];
  onChange: (value: T[]) => void;
  endpoint: string;
  queryKey: string | any[];
  getOptionLabel: (option: T) => React.ReactNode;
  getOptionValue: (option: T) => string | number;
  label?: string;
  disabled?: boolean;
  placeholder?: string;
  transformData?: (data: any) => T[];
  maxHeight?: number;
  showSelectedTags?: boolean;
  className?: string;
  initialSearch?: string;
  /**
   * Determines if the component allows multiple selections (default) or just a single selection
   */
  multiple?: boolean;
  /**
   * Show checkboxes in multiple selection mode
   */
  showCheckboxes?: boolean;
  /**
   * Optional custom label styling
   */
  labelClassName?: string;
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
  maxHeight = 300,
  showSelectedTags = true,
  className = "",
  initialSearch = "",
  multiple = true,
  showCheckboxes = true,
  labelClassName = "",
}: GenericMultiSelectProps<T>) {
  const [allOptions, setAllOptions] = React.useState<T[]>([]);
  const [isFetchingMore, setIsFetchingMore] = React.useState(false);
  const [last, setLast] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState(initialSearch);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    data,
    isLoading,
    error,
    refresh,
    pageSize,
    setPageSize,
    setPage,
    page,
    totalPages,
    setSearch: apiSetSearch,
  } = useApiQuery<T>({
    endpoint,
    queryKey: Array.isArray(queryKey) ? [...queryKey] : [queryKey],
    initialPage: 0,
    initialPageSize: 10,
    initialFilters: initialSearch ? { search: initialSearch } : undefined,
    mockData: {
      content: [],
      totalElements: 0,
      totalPages: 1,
      number: 0,
      size: 1000,
    },
    debounceMs: 300,
  });

  useEffect(() => {
    let pageOptions: T[] = [];

    if (transformData) {
      pageOptions = transformData(data);
    } else if (data && Array.isArray(data)) {
      pageOptions = data;
    }

    const isLast =
      typeof totalPages === "number" ? page >= totalPages - 1 : true;
    setLast(isLast);
    setIsFetchingMore(false);

    setAllOptions((prev) => {
      if (page === 0) {
        return pageOptions;
      }

      const existingIds = new Set(prev.map((item) => getOptionValue(item)));
      const newOptions = pageOptions.filter(
        (item) => !existingIds.has(getOptionValue(item))
      );

      return [...prev, ...newOptions];
    });
  }, [data, page, totalPages]);

  // Handle search changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value;
    setSearch(newSearch);
    setPage(0); // Reset to first page on search
    apiSetSearch(newSearch);
  };

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleFetchMore = () => {
    if (!last && !isFetchingMore) {
      setIsFetchingMore(true);
      setPage(page + 1);
    }
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Improved scroll detection function
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    const scrollThreshold = 50;

    if (
      scrollHeight - scrollTop - clientHeight < scrollThreshold &&
      !last &&
      !isFetchingMore
    ) {
      handleFetchMore();
    }
  };

  // Get normalized values (extract IDs from objects)
  const getNormalizedValues = (): Array<string | number> => {
    if (!Array.isArray(value)) return [];

    return value.map((val) => {
      if (typeof val === "string" || typeof val === "number") {
        return val;
      }
      // Handle object values using getOptionValue
      return getOptionValue(val);
    });
  };

  // Unified value handling for both objects and primitives
  const handleSelect = (optionValue: T) => {
    if (!multiple) {
      onChange([optionValue]);
      setIsOpen(false);
      return;
    }

    const newValues = value.some(
      (v) => getOptionValue(v) === getOptionValue(optionValue)
    )
      ? value.filter((v) => getOptionValue(v) !== getOptionValue(optionValue))
      : [...value, optionValue];

    onChange(newValues);
  };

  return (
    <div className={cn("generic-multi-select", className)}>
      {label && (
        <label
          className={cn(
            "block mb-2 font-medium text-foreground",
            labelClassName
          )}
        >
          {label}
        </label>
      )}
      {error ? (
        <div className="text-destructive">{String(error)}</div>
      ) : (
        <Select
          disabled={disabled}
          onOpenChange={(open) => setIsOpen(open)}
          onValueChange={() => { }} // Prevent default select behavior
          // Important: Don't use empty string for value prop, use a placeholder value instead
          value="placeholder_value" 
          open={isOpen} // Explicitly control open state
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder}>
              {value.length > 0 && (
                <span className="text-sm">
                  {!multiple ? (
                    // For single select, try to find and display the selected option label
                    allOptions.find(
                      (opt) => getOptionValue(opt) === getOptionValue(value[0])
                    ) ? (
                      <span className="truncate max-w-[200px] inline-block">
                        {allOptions.find(
                          (opt) =>
                            getOptionValue(opt) === getOptionValue(value[0])
                        ) &&
                          React.isValidElement(
                            getOptionLabel(
                              allOptions.find(
                                (opt) =>
                                  getOptionValue(opt) === getOptionValue(value[0])
                              )!
                            )
                          )
                          ? React.Children.toArray(
                            getOptionLabel(
                              allOptions.find(
                                (opt) =>
                                  getOptionValue(opt) ===
                                  getOptionValue(value[0])
                              )!
                            )
                          )[0]
                          : getOptionLabel(
                            allOptions.find(
                              (opt) =>
                                getOptionValue(opt) ===
                                getOptionValue(value[0])
                            )!
                          )}
                      </span>
                    ) : (
                      "1 selected"
                    )
                  ) : (
                    // For multi-select, show count
                    `${value.length} selected`
                  )}
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent style={{ maxHeight }} className="p-0">
            <div className="sticky top-0 z-10 p-2 bg-background border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Search..."
                  className="pl-8 h-9 w-full"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      apiSetSearch("");
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div
              ref={scrollContainerRef}
              className="py-1 max-h-[350px] overflow-y-auto"
              onScroll={handleScroll}
            >
              {isLoading && page === 0 ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : allOptions.length === 0 ? (
                <div className="flex justify-center py-4 text-sm text-muted-foreground">
                  No results found
                </div>
              ) : (
                <>
                  {allOptions.map((option) => {
                    const optionValue = getOptionValue(option);
                    const isSelected = value?.some(
                      (v) => getOptionValue(v) === optionValue
                    );
                    return (
                      <div
                        key={String(optionValue)}
                        className={cn(
                          "cursor-pointer px-3 py-2 my-1 hover:bg-accent rounded-md",
                          isSelected ? "bg-primary/10" : ""
                        )}
                        onClick={() => handleSelect(option)}
                      >
                        {multiple && showCheckboxes ? (
                          <div className="flex items-center gap-2 w-full">
                            <div
                              className="flex h-4 w-4 items-center justify-center rounded border border-primary cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(option);
                              }}
                              role="checkbox"
                              aria-checked={isSelected}
                            >
                              {isSelected && (
                                <Check className="h-3 w-3 text-primary" />
                              )}
                            </div>
                            <div className="flex-1">
                              {getOptionLabel(option)}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 w-full">
                            {isSelected && !multiple && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                            <div className="flex-1">
                              {getOptionLabel(option)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}

              {isFetchingMore && (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </SelectContent>
        </Select>
      )}

      {showSelectedTags && value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {allOptions
            .filter((option) =>
              getNormalizedValues().includes(getOptionValue(option))
            )
            .map((option) => (
              <div
                key={getOptionValue(option)}
                className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-xs"
              >
                <span>{getOptionLabel(option)}</span>
                <button
                  type="button"
                  onClick={() => handleSelect(option)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default GenericMultiSelect;
