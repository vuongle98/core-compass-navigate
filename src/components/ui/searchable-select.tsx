import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import useDebounce from "@/hooks/use-debounce";

export interface Option {
  value: string;
  label: string | React.ReactNode;
  [key: string]: unknown;
}

interface SearchableSelectProps {
  options: Option[];
  value: Option | Option[] | null;
  onChange: (value: Option | Option[] | null) => void;
  placeholder?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  maxHeight?: number;
  showSelectedTags?: boolean;
  onSearch?: (query: string) => void;
  isLoading?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  emptyMessage = "No results found",
  searchPlaceholder = "Search...",
  multiple = false,
  disabled = false,
  className,
  maxHeight = 300,
  showSelectedTags = false,
  onSearch,
  isLoading = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle external search if provided
  useEffect(() => {
    if (onSearch && debouncedSearchQuery) {
      onSearch(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, onSearch]);

  // Filter options locally if no external search is provided
  const filteredOptions =
    !onSearch && debouncedSearchQuery
      ? options.filter(
          (option) =>
            String(option.label)
              .toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase()) ||
            option.value
              .toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase())
        )
      : options;

  // Handle selection
  const handleSelect = (option: Option) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const isSelected = currentValues.some(
        (item) => item.value === option.value
      );

      onChange(
        isSelected
          ? currentValues.filter((item) => item.value !== option.value)
          : [...currentValues, option]
      );

      // Keep popover open for multiple selection
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } else {
      onChange(option);
      setOpen(false);
    }
  };

  // Handle remove selected item in multiple mode
  const handleRemove = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation();
    const currentValues = Array.isArray(value) ? value : [];
    onChange(currentValues.filter((item) => item.value !== optionValue));
  };

  // Clear selection
  const handleClear = () => {
    onChange(multiple ? [] : null);
  };

  // Format selected value for display
  const selectedDisplay = () => {
    if (!value) return placeholder;

    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return placeholder;

      if (!showSelectedTags) {
        return `${value.length} item${value.length !== 1 ? "s" : ""} selected`;
      }

      // Don't return anything here as we'll show the tags below the button
      return placeholder;
    }

    // Single selection
    return Array.isArray(value) ? placeholder : value.label;
  };

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between min-h-10",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <span className="truncate">{selectedDisplay()}</span>
            <div className="flex items-center">
              {value &&
                Array.isArray(value) &&
                value.length > 0 &&
                !disabled && (
                  <div
                    role="button"
                    tabIndex={0}
                    className="h-4 w-4 rounded-full ml-1 mr-1 hover:bg-muted flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.stopPropagation();
                        handleClear();
                      }
                    }}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Clear</span>
                  </div>
                )}
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <div className="flex items-center border-b px-3">
              <Search className="h-4 w-4 mr-2 opacity-50 shrink-0" />
              <CommandInput
                placeholder={searchPlaceholder}
                value={searchQuery}
                onValueChange={setSearchQuery}
                ref={inputRef}
                className="flex-1"
              />
            </div>
            <ScrollArea className={`max-h-${maxHeight} overflow-auto`}>
              <CommandList>
                {isLoading ? (
                  <div className="py-6 text-center text-sm">Loading...</div>
                ) : filteredOptions.length === 0 ? (
                  <CommandEmpty>{emptyMessage}</CommandEmpty>
                ) : (
                  <CommandGroup>
                    {filteredOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => handleSelect(option)}
                        className="cursor-pointer"
                      >
                        {multiple && (
                          <div
                            className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                              Array.isArray(value) &&
                                value.some((v) => v.value === option.value)
                                ? "bg-primary text-primary-foreground"
                                : "opacity-50"
                            )}
                          >
                            {Array.isArray(value) &&
                              value.some((v) => v.value === option.value) && (
                                <Check className="h-3 w-3" />
                              )}
                          </div>
                        )}
                        <span>{option.label}</span>
                        {!multiple &&
                          value &&
                          !Array.isArray(value) &&
                          value.value === option.value && (
                            <Check className="ml-auto h-4 w-4" />
                          )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Show selected tags if in multiple mode and showSelectedTags is true */}
      {multiple &&
        showSelectedTags &&
        Array.isArray(value) &&
        value.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {value.map((item) => (
              <Badge
                key={item.value}
                variant="secondary"
                className="max-w-full"
              >
                <span className="truncate mr-1">{item.label}</span>
                {!disabled && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 rounded-full p-0 hover:bg-muted"
                    onClick={(e) => handleRemove(e, item.value)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove</span>
                  </Button>
                )}
              </Badge>
            ))}
          </div>
        )}
    </div>
  );
}
