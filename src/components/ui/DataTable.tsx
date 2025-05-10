
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUp, ArrowDown } from "lucide-react";
import { ResponsiveTable } from "./ResponsiveTable";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTablePagination } from "./DataTablePagination";
import { ReactNode } from "react";
import { Column } from "@/types/Common";
import { useIsMobile } from "@/hooks/use-mobile";
import { ColumnSelector } from "./column-selector";
import { useColumnVisibility } from "@/hooks/use-column-visibility";

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  pagination?: boolean;
  isLoading?: boolean;
  showAddButton?: boolean;
  onAddClick?: () => void;
  addButtonText?: string;
  totalItems?: number;
  pageIndex?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  emptyMessage?: string;
  headerActions?: ReactNode;
  onSortChange?: (column: string, direction: 'asc' | 'desc' | undefined) => void;
  tableId?: string; // Added tableId for column visibility
  defaultColumnVisibility?: Record<string, boolean>; // Added default column visibility
}

export function DataTable<T>({
  data = [],
  columns,
  title,
  pagination = false,
  isLoading = false,
  showAddButton = false,
  onAddClick,
  addButtonText = "Add New",
  totalItems = 0,
  pageIndex = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  initialPageSize,
  pageSizeOptions,
  emptyMessage = "No data available.",
  headerActions,
  onSortChange,
  tableId = "default-table", // Default table ID
  defaultColumnVisibility,
}: DataTableProps<T>) {
  const isMobile = useIsMobile();
  const [page, setPage] = useState(pageIndex);
  const [size, setSize] = useState(initialPageSize || pageSize);
  const [sortColumn, setSortColumn] = useState<string | undefined>();
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | undefined>();

  // Column visibility hook
  const { columnVisibility, visibleColumns, toggleColumnVisibility } = useColumnVisibility({
    tableId,
    defaultVisibility: defaultColumnVisibility,
    columns,
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (onPageChange) onPageChange(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setSize(newSize);
    if (onPageSizeChange) onPageSizeChange(newSize);
  };

  const handleSort = (column: string) => {
    let direction: 'asc' | 'desc' | undefined;
    
    if (sortColumn !== column) {
      direction = 'asc';
    } else if (sortDirection === 'asc') {
      direction = 'desc';
    } else {
      direction = undefined;
    }

    setSortColumn(direction ? column : undefined);
    setSortDirection(direction);
    
    if (onSortChange) {
      onSortChange(column, direction);
    }
  };

  return (
    <Card className="w-full shadow-sm border">
      {(title || showAddButton || headerActions) && (
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pb-2">
          <div className="flex items-center">
            {title && <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
            {headerActions}
            <ColumnSelector 
              columns={columns} 
              columnVisibility={columnVisibility} 
              toggleColumnVisibility={toggleColumnVisibility} 
            />
            {showAddButton && (
              <Button onClick={onAddClick} size={isMobile ? "sm" : "default"} className="shrink-0">
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {addButtonText}
              </Button>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <ResponsiveTable
            data={data}
            columns={visibleColumns}
            emptyMessage={emptyMessage}
          />
        )}
      </CardContent>
      {pagination && totalItems > 0 && (
        <DataTablePagination
          pageIndex={page}
          pageSize={size}
          totalItems={totalItems}
          pageCount={Math.ceil(totalItems / size)}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </Card>
  );
}

// Use 'export type' to properly re-export the type when 'isolatedModules' is enabled
export type { Column };
