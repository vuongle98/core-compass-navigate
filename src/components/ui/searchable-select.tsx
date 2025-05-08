
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface Option<T> {
  value: string;
  label: React.ReactNode;
  original?: T;
  disabled?: boolean;
}

interface SearchableSelectProps<T> {
  options: Option<T>[];
  value: Option<T>[] | null;
  onChange: (value: Option<T> | Option<T>[] | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  maxHeight?: number;
  className?: string;
  showSelectedTags?: boolean;
  emptyMessage?: string;
  isLoading?: boolean;
  clearable?: boolean;
  onLoadMore?: () => void; // Callback to load more options
  hasMore?: boolean; // Indicates if more options are available
  showCheckboxes?: boolean;
  onSearch?: (query: string) => void; // Callback to handle search input
  setPage?: (page: number) => void;
}

export const SearchableSelect = <T,>({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  disabled = false,
  multiple = false,
  className,
  showSelectedTags = false,
  emptyMessage = "No results found",
  isLoading = false,
  clearable = true,
  onLoadMore,
  hasMore = false,
  showCheckboxes = true,
  onSearch,
  setPage,
}: SearchableSelectProps<T>) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false); // Manage dropdown open state
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value;
    setSearchQuery(newSearch);
    
    if (setPage) {
      setPage(0); // Reset to first page on search
    }

    if (onSearch) {
      onSearch(newSearch);
    }
  };

  // Improved scroll handler with proper debounce
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (loadingRef.current || !hasMore || !onLoadMore) return;
    
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const scrollBottom = scrollHeight - scrollTop - clientHeight;
    const scrollThreshold = 30; // pixels from bottom to trigger load more
    
    if (scrollBottom < scrollThreshold) {
      loadingRef.current = true;
      onLoadMore();
      
      // Reset loading ref after delay to prevent multiple calls
      setTimeout(() => {
        loadingRef.current = false;
      }, 300);
    }
  };

  const filteredOptions = options.filter((option) =>
    option.label.toString().toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (option: Option<T>) => {
    if (!multiple) {
      onChange([option]);
      setIsOpen(false);
      return;
    }

    const newValues = Array.isArray(value) && value.some((o) => o.value === option.value)
      ? value.filter((o) => o.value !== option.value)
      : [...(Array.isArray(value) ? value : []), option];

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
      setSearchQuery(""); // Clear search query when dropdown is closed
    }
  }, [isOpen]);

  return (
    <div className={cn("space-y-2", className)}>
      <Select
        value={multiple ? undefined : (value && value[0]?.value) || ""}
        onValueChange={() => {}}
        disabled={disabled}
        open={isOpen} // Control dropdown open state
        onOpenChange={setIsOpen} // Update open state
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={
              value && value.length > 0 ? value.length + " selected" : placeholder
            }
          />
        </SelectTrigger>
        <SelectContent>
          <div className="sticky top-0 z-10 p-2 bg-background border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                className="pl-8 h-9 w-full"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    searchInputRef.current?.focus();
                    if (onSearch) onSearch("");
                    if (setPage) setPage(0);
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
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = Array.isArray(value) && value?.some((o) => o.value === option.value);
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
            {isLoading && (
              <div className="py-2 px-3 text-center">
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              </div>
            )}
          </SelectGroup>
          {hasMore && !isLoading && filteredOptions.length > 0 && (
            <div 
              className="py-2 px-3 text-center hover:bg-accent cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                if (onLoadMore) onLoadMore();
              }}
            >
              Load more...
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
              <Badge
                key={option.value}
                className="flex items-center gap-1 px-2 py-1"
                variant="outline"
              >
                <span className="text-xs">{option.label}</span>
                <button
                  type="button"
                  onClick={() => removeSelectedTag(option.value)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {clearable && value.length > 0 && (
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
