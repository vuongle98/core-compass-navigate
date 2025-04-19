import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { ApiQueryFilters } from "@/hooks/use-api-query";
import ErrorBoundary from "./ErrorBoundary";

export interface FilterOption {
  id: string;
  label: string;
  options?: { value: string; label: string }[];
  type: "select" | "search" | "dateRange";
  placeholder?: string;
}

interface DataFiltersProps {
  filters: ApiQueryFilters;
  options: FilterOption[];
  onChange: (filters: ApiQueryFilters) => void;
  onReset: () => void;
  className?: string;
}

export function DataFilters({
  filters,
  options,
  onChange,
  onReset,
  className = "",
}: DataFiltersProps) {
  const [searchInputs, setSearchInputs] = useState<Record<string, string>>({});
  const [debouncedSearchInputs, setDebouncedSearchInputs] = useState<Record<string, string>>({});

  // Set initial search values
  useEffect(() => {
    const initialSearchValues: Record<string, string> = {};
    options.forEach(option => {
      if (option.type === "search" && filters[option.id]) {
        initialSearchValues[option.id] = filters[option.id]?.toString() || "";
      }
    });
    setSearchInputs(initialSearchValues);
  }, []);

  // Debounce search inputs
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchInputs(searchInputs);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInputs]);

  // Update filters when debounced search inputs change
  useEffect(() => {
    const updatedFilters = { ...filters };
    let hasChanges = false;

    Object.entries(debouncedSearchInputs).forEach(([key, value]) => {
      if (updatedFilters[key]?.toString() !== value) {
        updatedFilters[key] = value;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      onChange(updatedFilters);
    }
  }, [debouncedSearchInputs]);

  const updateFilter = (id: string, value: string) => {
    // For select filters, convert "all" value to empty string
    if (options.find(opt => opt.id === id)?.type === "select") {
      const newValue = value === "all" ? "" : value;
      onChange({ ...filters, [id]: newValue });
    } else if (options.find(opt => opt.id === id)?.type === "search") {
      // For search filters, update the local state first (debounce will handle the actual filter update)
      setSearchInputs(prev => ({ ...prev, [id]: value }));
    } else {
      onChange({ ...filters, [id]: value });
    }
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== ""
  );

  return (
    <ErrorBoundary>
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        {options.map((option) => {
          if (option.type === "search") {
            return (
              <div className="relative" key={option.id}>
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchInputs[option.id] || ""}
                  onChange={(e) => updateFilter(option.id, e.target.value)}
                  placeholder={option.placeholder || "Search..."}
                  className="pl-8 w-[150px] md:w-[200px]"
                />
                {searchInputs[option.id] && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1.5 h-6 w-6 p-0"
                    onClick={() => {
                      updateFilter(option.id, "");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          }

          if (option.type === "select" && option.options) {
            return (
              <Select
                key={option.id}
                value={filters[option.id]?.toString() || "all"}
                onValueChange={(value) => updateFilter(option.id, value)}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder={option.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {option.label}</SelectItem>
                  {option.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          }

          return null;
        })}

        {hasActiveFilters && (
          <Button variant="ghost" onClick={onReset}>
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
    </ErrorBoundary>
  );
}
