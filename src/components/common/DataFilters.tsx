
import React from "react";
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

export interface FilterOption {
  id: string;
  label: string;
  options?: { value: string; label: string }[];
  type: "select" | "search" | "dateRange";
  placeholder?: string;
}

interface DataFiltersProps {
  filters: Record<string, string>;
  options: FilterOption[];
  onChange: (filters: Record<string, string>) => void;
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
  const updateFilter = (id: string, value: string) => {
    onChange({ ...filters, [id]: value });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== ""
  );

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {options.map((option) => {
        if (option.type === "search") {
          return (
            <div className="relative" key={option.id}>
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={filters[option.id] || ""}
                onChange={(e) => updateFilter(option.id, e.target.value)}
                placeholder={option.placeholder || "Search..."}
                className="pl-8 w-[150px] md:w-[200px]"
              />
              {filters[option.id] && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1.5 h-6 w-6 p-0"
                  onClick={() => updateFilter(option.id, "")}
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
              value={filters[option.id] || "all"}
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
  );
}
