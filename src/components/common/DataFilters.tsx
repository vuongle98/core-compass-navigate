
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SearchIcon, XIcon } from 'lucide-react';
import { ApiQueryFilters } from '@/hooks/use-api-query';

export interface FilterOption {
  id: string;
  label: string;
  type: 'text' | 'select' | 'search';
  options?: { value: string; label: string; }[];
  placeholder?: string;
}

interface DataFiltersProps {
  filters: ApiQueryFilters;
  options: FilterOption[];
  onChange: (filters: ApiQueryFilters) => void;
  onReset: () => void;
  className?: string;
}

export const DataFilters: React.FC<DataFiltersProps> = ({ filters, options, onChange, onReset, className }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (id: string, value: string | number | undefined) => {
    const newFilters = { ...localFilters, [id]: value };
    setLocalFilters(newFilters);
    onChange(newFilters);
  };

  const handleReset = () => {
    setLocalFilters({});
    onReset();
  };

  return (
    <div className={`grid grid-cols-1 gap-4 md:grid-cols-4 ${className || ''}`}>
      {options.map(option => (
        <div key={option.id}>
          {option.type === 'text' && (
            <div>
              <label htmlFor={option.id} className="block text-sm font-medium text-gray-700">{option.label}</label>
              <Input
                type="text"
                id={option.id}
                value={localFilters[option.id] || ''}
                onChange={(e) => handleFilterChange(option.id, e.target.value)}
                className="mt-1"
              />
            </div>
          )}

          {option.type === 'search' && (
            <div className="relative">
              <Input
                type="search"
                id={option.id}
                placeholder={option.placeholder || `Search ${option.label.toLowerCase()}...`}
                value={localFilters[option.id] || ''}
                onChange={(e) => handleFilterChange(option.id, e.target.value)}
                className="pl-10"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              {localFilters[option.id] && (
                <button
                  className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => handleFilterChange(option.id, '')}
                >
                  <XIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          )}

          {option.type === 'select' && (
            <div>
              <label htmlFor={option.id} className="block text-sm font-medium text-gray-700">{option.label}</label>
              <Select onValueChange={(value) => handleFilterChange(option.id, value)}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder={`Select ${option.label.toLowerCase()}`} defaultValue={filters[option.id]?.toString()} />
                </SelectTrigger>
                <SelectContent>
                  {option.options?.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      ))}

      {/* Reset Button */}
      <div>
        <Button variant="ghost" onClick={handleReset}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
};
