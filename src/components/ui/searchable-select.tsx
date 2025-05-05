import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface Option {
  value: string;
  label: React.ReactNode;
  original?: any;
  disabled?: boolean;
}

interface SearchableSelectProps {
  options: Option[];
  value: Option | Option[] | null;
  onChange: (value: Option | Option[] | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  maxHeight?: number;
  className?: string;
  showSelectedTags?: boolean;
  emptyMessage?: string;
  onSearch?: (query: string) => void;
  isLoading?: boolean;
  clearable?: boolean;
  creatable?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  disabled = false,
  multiple = false,
  maxHeight = 300,
  className,
  showSelectedTags = false,
  emptyMessage = "No results found",
  onSearch,
  isLoading = false,
  clearable = true,
  creatable = false,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const commandRef = useRef<HTMLDivElement>(null);

  // Update search when popover opens/closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) onSearch(query);
  };

  // Handle option selection
  const handleSelect = (selectedOption: Option) => {
    if (multiple) {
      // In multiple mode
      const currentValue = (value as Option[]) || [];
      const isSelected = currentValue.some(
        (option) => option.value === selectedOption.value
      );

      if (isSelected) {
        // If already selected, remove it
        onChange(
          currentValue.filter((option) => option.value !== selectedOption.value)
        );
      } else {
        // If not selected, add it
        onChange([...currentValue, selectedOption]);
      }

      // Keep the popover open in multiple mode
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } else {
      // In single mode
      onChange(selectedOption);
      setOpen(false);
    }
  };

  // Handle clear all selections
  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(multiple ? [] : null);
  };

  // Check if an option is selected
  const isOptionSelected = (option: Option) => {
    if (!value) return false;
    if (Array.isArray(value)) {
      return value.some((v) => v.value === option.value);
    }
    return value.value === option.value;
  };

  // Remove a selected tag (for multiple mode)
  const removeSelectedTag = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation();
    if (!multiple || !Array.isArray(value)) return;
    onChange(value.filter((option) => option.value !== optionValue));
  };

  // Display value in the trigger button
  const displayValue = () => {
    if (!value) return placeholder;

    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      if (!showSelectedTags) return `${value.length} selected`;

      // For multiple with tags visible in the trigger
      return (
        <div className="flex flex-wrap gap-1 max-w-full overflow-hidden">
          {value.map((option) => (
            <Badge
              key={option.value}
              variant="secondary"
              className="mr-1 mb-1"
            >
              {typeof option.label === "string" ? option.label : "Selected"}
              <button
                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => removeSelectedTag(e, option.value)}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                <span className="sr-only">Remove</span>
              </button>
            </Badge>
          ))}
          {value.length > 3 && (
            <Badge variant="secondary">+{value.length - 3} more</Badge>
          )}
        </div>
      );
    }

    // For single select
    return typeof (value as Option).label === "string"
      ? (value as Option).label
      : "Selected";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between min-h-10 text-left",
            disabled && "opacity-50 pointer-events-none",
            className
          )}
          disabled={disabled}
        >
          <div className="truncate flex-1">{displayValue()}</div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[300px] max-w-[calc(100vw-2rem)]"
        style={{ maxHeight: `${maxHeight + 50}px` }}
        align="start"
        sideOffset={8}
      >
        <Command ref={commandRef}>
          <div className="flex items-center border-b px-3">
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchQuery}
              onValueChange={(value) => {
                setSearchQuery(value);
                if (onSearch) onSearch(value);
              }}
              className="h-9 flex-1"
              ref={inputRef}
            />
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin opacity-70 mr-1" />
            )}
            {multiple && clearable && Array.isArray(value) && value.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={handleClearAll}
              >
                Clear
              </Button>
            )}
          </div>
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty className="py-6 text-center text-sm">
              {emptyMessage}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option)}
                  disabled={option.disabled}
                  className={cn(
                    "cursor-pointer",
                    option.disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center justify-between w-full mr-2">
                    <div className="flex-grow">{option.label}</div>
                    {isOptionSelected(option) && (
                      <Check className="h-4 w-4 ml-2 flex-shrink-0" />
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
