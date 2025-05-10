
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, X, Filter, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ApiQueryFilters } from "@/hooks/use-api-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import useUserSettingsStore from "@/store/useUserSettingsStore";
import { SearchableSelect } from "@/components/ui/searchable-select";

// Export the type as a named export
export type FilterOption = {
  id: string;
  label: string;
  type: "text" | "select" | "date" | "search" | "searchable-select";
  placeholder?: string;
  options?: { value: string; label: string }[];
  endpoint?: string; // For searchable-select type
  queryKey?: string | string[]; // For searchable-select type
  transformData?: (data: any[]) => any[]; // For searchable-select type
};

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

// Export as both default and named export for backward compatibility
const DataFilters: React.FC<DataFiltersProps> = ({
  filters,
  setFilters,
  resetFilters,
  children,
  className = "",
  withSearch = true,
  searchPlaceholder = "Search...",
  filtersTitle = "Filters",
  showToggle = false, // Changed to false as per requirement #3
  options = [],
  onChange,
  onReset,
}) => {
  const { settings, setFilterExpanded } = useUserSettingsStore();
  const [showFilters, setShowFilters] = useState(settings.filters.expanded);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Update the local state when the persisted setting changes
  useEffect(() => {
    setShowFilters(settings.filters.expanded);
  }, [settings.filters.expanded]);

  // Toggle filter visibility and persist the setting
  const toggleFilters = () => {
    const newValue = !showFilters;
    setShowFilters(newValue);
    setFilterExpanded(newValue);
  };

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

  // Handle reset with compatibility for both prop styles
  const handleReset = () => {
    if (resetFilters) {
      resetFilters();
    }

    if (onReset) {
      onReset();
    }

    setActiveFilters([]);
  };

  // Handle filter change
  const handleFilterChange = (id: string, value: string | Date | null | any[]) => {
    let formattedValue: string | number | boolean | null | any[] = null;

    // Format date values to string
    if (value instanceof Date) {
      formattedValue = format(value, "yyyy-MM-dd");
    } else {
      formattedValue = value;
    }

    const newFilters = { ...filters, [id]: formattedValue };

    if (setFilters) {
      setFilters(newFilters);
    }

    if (onChange) {
      onChange(newFilters);
    }

    // Track active filters for UI display
    if (value && (typeof value === "string" ? value !== "" : Array.isArray(value) ? value.length > 0 : true)) {
      if (!activeFilters.includes(id)) {
        setActiveFilters([...activeFilters, id]);
      }
    } else {
      setActiveFilters(activeFilters.filter((filterId) => filterId !== id));
    }
  };

  // Handle searchable-select change
  const handleSearchableSelectChange = (id: string, selected: any[] | null) => {
    if (!selected) {
      handleFilterChange(id, []);
      return;
    }
    
    handleFilterChange(id, selected);
  };

  // Get current search value
  const searchValue = (filters.search as string) || "";

  // Check if there are any active filters (excluding search)
  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) =>
      key !== "search" && value !== "" && value !== null && value !== undefined
  );

  // Group filters by type for better organization
  const groupedFilters = {
    search: options.filter(
      (opt) => opt.type === "search" || opt.type === "text"
    ),
    select: options.filter((opt) => opt.type === "select"),
    date: options.filter((opt) => opt.type === "date"),
    searchableSelect: options.filter((opt) => opt.type === "searchable-select"),
  };

  return (
    <div className={cn("space-y-4 mb-6", className)}>
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {!showFilters && withSearch && (
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={handleSearchChange}
              className="pl-10 pr-8"
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
          {activeFilters.length > 0 && (
            <div className="hidden md:flex items-center gap-1">
              {activeFilters.map((id) => {
                const option = options.find((opt) => opt.id === id);
                if (!option) return null;

                return (
                  <Badge
                    key={id}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    {option.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleFilterChange(id, "")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          )}

          {showToggle && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFilters}
              className="flex items-center gap-1 transition-all duration-200"
              type="button"
            >
              <Filter className="h-4 w-4 mr-1" />
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
            : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0">
          {options && options.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Select Filters */}
              {groupedFilters.select.length > 0 && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {groupedFilters.select.map((option) => (
                      <div key={option.id} className="flex flex-col space-y-1">
                        <label
                          htmlFor={option.id}
                          className="text-sm font-medium"
                        >
                          {option.label}
                        </label>
                        <Select
                          value={(filters[option.id] as string) || ""}
                          onValueChange={(value) =>
                            handleFilterChange(option.id, value)
                          }
                        >
                          <SelectTrigger id={option.id} className="w-full">
                            <SelectValue
                              placeholder={
                                option.placeholder ||
                                `Select ${option.label}...`
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All</SelectItem>
                            {option.options?.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Searchable Select Filters */}
              {groupedFilters.searchableSelect.length > 0 && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {groupedFilters.searchableSelect.map((option) => (
                      <div key={option.id} className="flex flex-col space-y-1">
                        <label
                          htmlFor={option.id}
                          className="text-sm font-medium"
                        >
                          {option.label}
                        </label>
                        <SearchableSelect
                          value={filters[option.id] as any[] || []}
                          endpoint={option.endpoint || `/api/${option.id}`}
                          queryKey={option.queryKey || [`filter-${option.id}`]}
                          onChange={(value) => handleSearchableSelectChange(option.id, value)}
                          placeholder={option.placeholder || `Select ${option.label}...`}
                          searchPlaceholder={`Search ${option.label}...`}
                          multiple={true}
                          transformData={option.transformData || ((data) => data.map((item: any) => ({
                            value: item.id?.toString() || "",
                            label: item.name || item.label || "",
                            original: item
                          })))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Date Filters */}
              {groupedFilters.date.length > 0 && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {groupedFilters.date.map((option) => (
                      <div key={option.id} className="flex flex-col space-y-1">
                        <label
                          htmlFor={option.id}
                          className="text-sm font-medium"
                        >
                          {option.label}
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id={option.id}
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              {filters[option.id] ? (
                                format(
                                  new Date(filters[option.id] as string),
                                  "PPP"
                                )
                              ) : (
                                <span className="text-muted-foreground">
                                  {option.placeholder || "Pick a date"}
                                </span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={
                                filters[option.id]
                                  ? new Date(filters[option.id] as string)
                                  : undefined
                              }
                              onSelect={(date) =>
                                handleFilterChange(option.id, date)
                              }
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Text Search Filters (excluding main search) */}
              {groupedFilters.search.length > 0 && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {groupedFilters.search.map((option) => (
                      <div key={option.id} className="flex flex-col space-y-1">
                        <label
                          htmlFor={option.id}
                          className="text-sm font-medium"
                        >
                          {option.label}
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id={option.id}
                            value={(filters[option.id] as string) || ""}
                            onChange={(e) =>
                              handleFilterChange(option.id, e.target.value)
                            }
                            placeholder={
                              option.placeholder || `Search ${option.label}...`
                            }
                            className="pl-10"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};

// Export as both default and named export for backward compatibility
export { DataFilters };
export default DataFilters;
