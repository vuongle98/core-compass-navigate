
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApiQueryFilters } from '@/hooks/use-api-query';

interface DataFiltersProps {
  filters: ApiQueryFilters;
  setFilters: (filters: ApiQueryFilters) => void;
  resetFilters: () => void;
  children?: React.ReactNode;
  className?: string;
  withSearch?: boolean;
  searchPlaceholder?: string;
  filtersTitle?: string;
  showToggle?: boolean;
}

const DataFilters: React.FC<DataFiltersProps> = ({
  filters,
  setFilters,
  resetFilters,
  children,
  className = '',
  withSearch = true,
  searchPlaceholder = 'Search...',
  filtersTitle = 'Filters',
  showToggle = true,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters({ ...filters, search: value });
  };

  // Toggle filter visibility
  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  // Get current search value
  const searchValue = (filters.search as string) || '';

  // Check if there are any active filters
  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== 'search' && value !== '' && value !== null && value !== undefined
  );

  return (
    <div className={cn('space-y-4 mb-6', className)}>
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
                onClick={() => setFilters({ ...filters, search: '' })}
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
              className="flex items-center gap-1"
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
              onClick={resetFilters}
              className="text-muted-foreground"
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
          showFilters ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 h-0"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DataFilters;
