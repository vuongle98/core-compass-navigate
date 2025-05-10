import React, { useState, useRef, useEffect } from "react";
import { Check, Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useApiQuery from "@/hooks/use-api-query";
import { Option } from "@/types/Common";

interface SearchableSelectProps<T> {
  value: Option<T>[] | null;
  endpoint: string;
  queryKey: string | string[];
  onChange: (value: Option<T> | Option<T>[] | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  maxHeight?: number;
  className?: string;
  showSelectedTags?: boolean;
  emptyMessage?: string;
  clearable?: boolean;
  showCheckboxes?: boolean;
  initialSearch?: string; // Initial search query
  transformData: (data: any[]) => Option<T>[]; // Function to transform data - changed from T[] to any[]
}

export const SearchableSelect = <T,>({
  value,
  endpoint,
  queryKey,
  onChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  disabled = false,
  multiple = false,
  className,
  showSelectedTags = false,
  emptyMessage = "No results found",
  clearable = true,
  showCheckboxes = true,
  initialSearch = "",
  transformData,
}: SearchableSelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false); // Manage dropdown open state
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [allOptions, setAllOptions] = useState<Option<T>[]>([]);
  const [last, setLast] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [search, setSearch] = useState<string>(initialSearch);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const {
    data: data,
    isLoading,
    setPage,
    page,
    totalPages,
    setSearch: apiSetSearch,
  } = useApiQuery<any>({ // Changed from T to any
    endpoint,
    queryKey: Array.isArray(queryKey) ? [...queryKey] : [queryKey],
    initialPage: 0,
    initialPageSize: 10,
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
    let pageOptions: Option<T>[] = [];

    if (transformData) {
      pageOptions = transformData(data);
    } else if (data && Array.isArray(data)) {
      // This is a fallback, but we'll always use transformData
      pageOptions = data.map((item: any) => ({
        value: item.value || "",
        label: item.label || "",
        original: item,
      }));
    }

    const isLast =
      typeof totalPages === "number" ? page >= totalPages - 1 : true;

    setLast(isLast);
    setIsFetchingMore(false);

    setAllOptions((prev) => {
      if (page === 0) {
        return pageOptions;
      }

      const existingIds = new Set(prev.map((item) => item.value));

      const newOptions = pageOptions.filter(
        (item) => !existingIds.has(item.value)
      );

      return [...prev, ...newOptions];
    });
  }, [data, page, totalPages, transformData]);

  const handleFetchMore = () => {
    if (!last && !isFetchingMore) {
      setIsFetchingMore(true);
      setPage(page + 1);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value;
    setSearch(newSearch);
    setPage(0); // Reset to first page on search
    apiSetSearch(newSearch);
  };

  // Improved scroll detection function
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    const scrollThreshold = 50;

    if (
      scrollHeight - scrollTop - clientHeight < scrollThreshold &&
      !last &&
      !isFetchingMore
    ) {
      console.log("Fetching more options...");
      handleFetchMore();
    }
  };

  const handleSelect = (option: Option<T>) => {
    if (!multiple) {
      onChange([option]);
      setIsOpen(false);
      return;
    }

    const newValues = value.some((o) => o.value === option.value)
      ? value.filter((o) => o.value !== option.value)
      : [...value, option];

    onChange(newValues);
  };

  const removeSelectedTag = (optionValue: string) => {
    if (!multiple || !Array.isArray(value)) return;
    onChange(value.filter((option) => option.value !== optionValue));
  };

  const handleClearAll = () => {
    onChange(multiple ? [] : null);
  };

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    if (!isOpen) {
      setSearch(""); // Clear search query when dropdown is closed
    }
  }, [isOpen]);

  return (
    <div className={cn("space-y-2", className)}>
      <Select
        value={multiple ? undefined : value[0]?.value || ""}
        onValueChange={() => {}}
        disabled={disabled}
        open={isOpen} // Control dropdown open state
        onOpenChange={setIsOpen} // Update open state
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={
              value.length > 0 ? value.length + " selected" : placeholder
            }
          />
        </SelectTrigger>
        <SelectContent>
          <div className="sticky top-0 z-10 p-2 bg-background border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                value={search}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
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
          <SelectGroup
            ref={scrollContainerRef}
            className="py-1 max-h-[350px] overflow-y-auto"
            onScroll={handleScroll}
          >
            {allOptions.length > 0 ? (
              allOptions.map((option) => {
                const isSelected = value?.some((o) => o.value === option.value);
                return (
                  <div
                    key={option.value}
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
                        <div className="flex-1">{option.label}</div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 w-full">
                        {isSelected && !multiple && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                        <div className="flex-1">{option.label}</div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-2 px-3 text-sm text-muted-foreground">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                ) : (
                  emptyMessage
                )}
              </div>
            )}
          </SelectGroup>
          {isLoading && (
            <div className="py-2 px-3 text-center">
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            </div>
          )}
        </SelectContent>
      </Select>

      {multiple &&
        showSelectedTags &&
        Array.isArray(value) &&
        value.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {value.map((option) => (
              <div
                key={option.value}
                className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-xs"
              >
                <span>{option.label}</span>
                <button
                  type="button"
                  onClick={() => removeSelectedTag(option.value)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {clearable && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={handleClearAll}
              >
                Clear All
              </Button>
            )}
          </div>
        )}
    </div>
  );
};
