
import React from 'react';
import { Column } from '@/types/Common';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { cn } from '@/lib/utils';

export interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  emptyMessage?: string;
}

export function ResponsiveTable<T>({
  data,
  columns,
  className,
  onRowClick,
  isLoading = false,
  emptyState,
  emptyMessage = "No data available",
}: ResponsiveTableProps<T>) {
  if (isLoading) {
    return <div className="flex items-center justify-center p-6">Loading data...</div>;
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center p-6 text-muted-foreground">
        {emptyState || emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto">
      <Table className={className}>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.accessorKey} className={cn(column.id)}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow
              key={index}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
              className={cn(onRowClick && "cursor-pointer hover:bg-muted/50")}
            >
              {columns.map((column) => (
                <TableCell key={`${index}-${column.accessorKey}`}>
                  {column.cell
                    ? column.cell(item)
                    : (item as any)[column.accessorKey]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Re-export Column type to fix imports in other files
export type TableColumn<T> = Column<T>;
