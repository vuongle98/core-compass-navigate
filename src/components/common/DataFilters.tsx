import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ApiQueryFilters } from "@/hooks/use-api-query";
import { FilterOption } from "@/types/Common";

export interface DataFiltersProps {
  filters: ApiQueryFilters;
  options?: FilterOption[];
  className?: string;
  withSearch?: boolean;
  searchPlaceholder?: string;
  filtersTitle?: string;
  showToggle?: boolean;
  children?: React.ReactNode;

  // Allow both patterns of filter handling
  setFilters?: (filters: ApiQueryFilters) => void;
  resetFilters?: () => void;
  onChange?: (filters: ApiQueryFilters) => void;
  onReset?: () => void;
}

export const DataFilters: React.FC<DataFiltersProps> = ({
  filters,
  setFilters,
  resetFilters,
  children,
  className = "",
  withSearch = true,
  searchPlaceholder = "Search...",
  filtersTitle = "Filters",
  showToggle = true,
  options,
  onChange,
  onReset,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  // Handle search input change with compatibility for both prop styles
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newFilters = { ...filters, search: value };

    if (setFilters) {
      setFilters(newFilters);
    }

    if (onChange) {
      onChange(newFilters);
    }
  };

  // Toggle filter visibility
  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  // Handle reset with compatibility for both prop styles
  const handleReset = () => {
    if (resetFilters) {
      resetFilters();
    }

    if (onReset) {
      onReset();
    }
  };

  // Get current search value
  const searchValue = (filters.search as string) || "";

  // Check if there are any active filters
  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) =>
      key !== "search" && value !== "" && value !== null && value !== undefined
  );

  return (
    <div className={cn("space-y-4 mb-6", className)}>
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {withSearch && (
          <div className="relative w-full sm:max-w-xs">
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={handleSearchChange}
              className="pr-8"
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => {
                  const newFilters = { ...filters, search: "" };
                  if (setFilters) setFilters(newFilters);
                  if (onChange) onChange(newFilters);
                }}
                type="button"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {showToggle && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFilters}
              className="flex items-center gap-1 transition-all duration-200"
              type="button"
            >
              {filtersTitle}
              {showFilters ? (
                <ChevronUp className="ml-1 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-1 h-4 w-4" />
              )}
            </Button>
          )}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-muted-foreground hover:text-primary transition-colors"
              type="button"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      <div
        className={cn(
          "grid gap-4 transition-all duration-300 ease-in-out overflow-hidden",
          showFilters
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0 h-0"
        )}
      >
        <div className="min-h-0 overflow-hidden">{children}</div>
      </div>
    </div>
  );
};

export default DataFilters;
