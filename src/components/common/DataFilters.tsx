
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SearchIcon, XIcon, FilterIcon } from "lucide-react";
import { ApiQueryFilters } from "@/hooks/use-api-query";
import useDebounce from "@/hooks/use-debounce";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface FilterOption {
  id: string;
  label: string;
  type: "text" | "select" | "search";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface DataFiltersProps {
  filters: ApiQueryFilters;
  options: FilterOption[];
  onChange: (filters: ApiQueryFilters) => void;
  onReset: () => void;
  className?: string;
}

export const DataFilters: React.FC<DataFiltersProps> = ({
  filters,
  options,
  onChange,
  onReset,
  className,
}) => {
  const isMobile = useIsMobile();
  const [localFilters, setLocalFilters] = useState<ApiQueryFilters>(filters);
  const debouncedFilters = useDebounce(localFilters, 300);
  const [isOpen, setIsOpen] = useState(!isMobile);
  const initialRenderRef = useRef(true);
  const resetTriggeredRef = useRef(false);

  // Reset the local state when parent filters change
  useEffect(() => {
    if (initialRenderRef.current) {
      setLocalFilters(filters);
      initialRenderRef.current = false;
    }
  }, [filters]);

  // Apply debounced filters when they change
  useEffect(() => {
    // Skip initial render or when reset is triggered
    if (!initialRenderRef.current && !resetTriggeredRef.current) {
      onChange(debouncedFilters);
    }
    
    // Reset the flag after it's been processed
    if (resetTriggeredRef.current) {
      resetTriggeredRef.current = false;
    }
  }, [debouncedFilters, onChange]);

  // Update the open state when screen size changes
  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  const handleFilterChange = (
    id: string,
    value: string | number | undefined
  ) => {
    const newFilters = { ...localFilters, [id]: value };
    setLocalFilters(newFilters);
    // onChange is called via the debounced effect
  };

  const handleReset = () => {
    // Set the reset flag
    resetTriggeredRef.current = true;
    
    // Create empty filters object based on options
    const resetFilters = options.reduce((acc, option) => {
      acc[option.id] = option.type === "select" ? undefined : "";
      return acc;
    }, {} as ApiQueryFilters);

    // Update local state first
    setLocalFilters(resetFilters);
    
    // Call the parent reset function directly
    onReset();
  };

  // Determine grid columns based on number of filters for responsive layout
  const gridClass =
    options.length <= 2
      ? "grid-cols-1 sm:grid-cols-2"
      : options.length === 3
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  const hasActiveFilters = Object.values(localFilters).some(
    (value) => value !== undefined && value !== null && value !== ""
  );

  const FiltersContent = () => (
    <div className={`grid gap-4 ${gridClass}`}>
      {options.map((option) => (
        <div key={option.id} className="space-y-1.5">
          {option.type === "text" && (
            <div>
              <label
                htmlFor={option.id}
                className="block text-sm font-medium mb-1 text-muted-foreground"
              >
                {option.label}
              </label>
              <Input
                type="text"
                id={option.id}
                value={(localFilters[option.id] as string) || ""}
                onChange={(e) =>
                  handleFilterChange(option.id, e.target.value)
                }
                placeholder={option.placeholder}
                className="w-full"
              />
            </div>
          )}

          {option.type === "search" && (
            <div>
              <label
                htmlFor={option.id}
                className="block text-sm font-medium mb-1 text-muted-foreground"
              >
                {option.label}
              </label>
              <div className="relative">
                <SearchIcon
                  className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  id={option.id}
                  placeholder={
                    option.placeholder ||
                    `Search ${option.label.toLowerCase()}...`
                  }
                  value={(localFilters[option.id] as string) || ""}
                  onChange={(e) =>
                    handleFilterChange(option.id, e.target.value)
                  }
                  className="w-full pl-9"
                />
                {localFilters[option.id] && (
                  <button
                    className="absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground hover:text-foreground focus:outline-none"
                    onClick={() => handleFilterChange(option.id, "")}
                    type="button"
                    aria-label="Clear search"
                  >
                    <XIcon className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          )}

          {option.type === "select" && (
            <div>
              <label
                htmlFor={option.id}
                className="block text-sm font-medium mb-1 text-muted-foreground"
              >
                {option.label}
              </label>
              <Select
                value={(localFilters[option.id] as string) || undefined}
                onValueChange={(value) =>
                  handleFilterChange(option.id, value)
                }
              >
                <SelectTrigger id={option.id} className="w-full">
                  <SelectValue
                    placeholder={`Select ${option.label.toLowerCase()}`}
                  />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {option.options?.map((opt) => (
                    <SelectItem 
                      key={opt.value} 
                      value={opt.value || "all"} // Ensure no empty values
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      ))}

      {/* Reset button at the end of the grid */}
      <div className="flex items-end">
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleReset}
            size="sm"
            className="h-9 text-muted-foreground hover:text-foreground flex items-center"
          >
            <XIcon className="h-3.5 w-3.5 mr-1" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`space-y-4 bg-background rounded-lg border shadow-sm ${
        className || ""
      }`}
    >
      {isMobile ? (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
          <div className="p-4 flex items-center justify-between">
            <h3 className="text-sm font-medium">Filters</h3>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center">
                <FilterIcon className="h-3.5 w-3.5 mr-1.5" />
                {isOpen ? "Hide Filters" : "Show Filters"}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="px-4 pb-4">
            <FiltersContent />
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <div className="p-4">
          <FiltersContent />
        </div>
      )}
    </div>
  );
};
