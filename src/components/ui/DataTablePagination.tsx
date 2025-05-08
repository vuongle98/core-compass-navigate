
import React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
  pageCount?: number;
  totalItems?: number;
}

interface DataTablePaginationProps {
  pageIndex: number;
  pageSize: number;
  totalItems?: number;
  pageCount?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export function DataTablePagination({
  pageIndex = 0,
  pageSize = 10,
  totalItems = 0,
  pageCount = 1,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 50, 100],
}: DataTablePaginationProps) {
  const isMobile = useIsMobile();
  
  // Calculate the range of items being displayed
  const start = totalItems ? pageIndex * pageSize + 1 : 0;
  const end = totalItems ? Math.min((pageIndex + 1) * pageSize, totalItems) : 0;

  // Handle page change - directly call the parent handler with the correct page
  const handlePageChange = (newPage: number) => {
    if (newPage !== pageIndex) {
      onPageChange(newPage);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    onPageSizeChange(newSize);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-2 py-3 sm:py-4 gap-y-2 border-t">
      <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
        {totalItems && totalItems > 0 ? (
          isMobile ? (
            <p>Page {pageIndex + 1} of {Math.max(1, pageCount)}</p>
          ) : (
            <p>Showing {start} to {end} of {totalItems} items</p>
          )
        ) : (
          <p>No results</p>
        )}
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4 justify-between sm:justify-end order-1 sm:order-2">
        {/* Page size selector - hidden on mobile */}
        {!isMobile && (
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <p className="font-medium">Rows</p>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => handlePageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[60px]">
                <SelectValue placeholder={pageSize.toString()} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Pagination controls */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <Button
            variant="outline"
            size={isMobile ? "sm" : "icon"}
            className={isMobile ? "h-7 w-7 p-0" : "h-8 w-8 p-0"}
            onClick={() => handlePageChange(0)}
            disabled={pageIndex === 0}
            aria-label="Go to first page"
          >
            <ChevronsLeftIcon className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="outline"
            size={isMobile ? "sm" : "icon"}
            className={isMobile ? "h-7 w-7 p-0" : "h-8 w-8 p-0"}
            onClick={() => handlePageChange(pageIndex - 1)}
            disabled={pageIndex === 0}
            aria-label="Go to previous page"
          >
            <ChevronLeftIcon className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          
          {/* Current page indicator - compact on mobile */}
          {isMobile ? (
            <span className="px-1.5 text-xs font-medium">
              {pageIndex + 1}/{Math.max(1, pageCount)}
            </span>
          ) : (
            <span className="px-2 text-sm font-medium">
              Page {pageIndex + 1} of {Math.max(1, pageCount)}
            </span>
          )}
          
          <Button
            variant="outline"
            size={isMobile ? "sm" : "icon"}
            className={isMobile ? "h-7 w-7 p-0" : "h-8 w-8 p-0"}
            onClick={() => handlePageChange(pageIndex + 1)}
            disabled={pageIndex >= pageCount - 1}
            aria-label="Go to next page"
          >
            <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="outline"
            size={isMobile ? "sm" : "icon"}
            className={isMobile ? "h-7 w-7 p-0" : "h-8 w-8 p-0"}
            onClick={() => handlePageChange(pageCount - 1)}
            disabled={pageIndex >= pageCount - 1}
            aria-label="Go to last page"
          >
            <ChevronsRightIcon className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
