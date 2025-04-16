import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTablePagination } from "./DataTablePagination";

export interface Column<T> {
  header: string;
  accessorKey?: string;
  id?: string;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  pagination?: boolean;
  isLoading?: boolean;
  showAddButton?: boolean;
  onAddClick?: () => void;
  totalItems?: number;
  pageIndex?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function DataTable<T>({
  data = [],
  columns,
  title,
  pagination = false,
  isLoading = false,
  showAddButton = false,
  onAddClick,
  totalItems = 0,
  pageIndex = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<T>) {
  const [page, setPage] = useState(pageIndex);
  const [size, setSize] = useState(pageSize);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    onPageChange?.(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setSize(newSize);
    onPageSizeChange?.(newSize);
  };

  return (
    <Card className="w-full">
      {title && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{title}</CardTitle>
          {showAddButton && (
            <Button onClick={onAddClick}>
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          )}
        </CardHeader>
      )}
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            {columns.map((column) => (
              <TableHead key={column.header} className={column.sortable ? "cursor-pointer" : ""}>
                {column.header}
              </TableHead>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton loading rows
              Array.from({ length: size }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((column, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-4">
                  No data available.
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              data.map((item, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.header}>
                      {column.cell ? column.cell(item) : item[column.accessorKey as keyof T]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      {pagination && (
        <DataTablePagination
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </Card>
  );
}
