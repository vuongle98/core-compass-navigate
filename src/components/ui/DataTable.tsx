
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ResponsiveTable, TableColumn } from "./ResponsiveTable";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTablePagination } from "./DataTablePagination";
import { ReactNode } from "react";

export interface Column<T> {
  header: string;
  accessorKey?: string;
  id?: string;
  cell?: (item: T) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

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
}: DataTableProps<T>) {
  const [page, setPage] = useState(pageIndex);
  const [size, setSize] = useState(initialPageSize || pageSize);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (onPageChange) onPageChange(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setSize(newSize);
    if (onPageSizeChange) onPageSizeChange(newSize);
  };

  // Convert columns to ResponsiveTable format
  const tableColumns: TableColumn<T>[] = columns.map(column => ({
    header: column.header,
    accessor: (column.accessorKey || column.id) as keyof T,
    cell: column.cell
  }));

  return (
    <Card className="w-full shadow-sm border">
      {(title || showAddButton || headerActions) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          {title && <CardTitle>{title}</CardTitle>}
          <div className="flex items-center space-x-2">
            {headerActions}
            {showAddButton && (
              <Button onClick={onAddClick} size="sm">
                <Plus className="h-4 w-4 mr-2" />
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
            columns={tableColumns}
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
