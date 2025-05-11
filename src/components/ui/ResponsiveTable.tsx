import React from "react";
import { Column } from "@/types/Common";
import {
  ActionsTableCell,
  ActionsTableHead,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "./card";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        Loading data...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center p-6 text-muted-foreground">
        {emptyState || emptyMessage}
      </div>
    );
  }

  // Helper function to render cell value based on column definition
  const renderCellValue = (item: T, column: Column<T>) => {
    if (!column.cell) {
      return item[column.accessorKey];
    }

    return (column.cell as (item: T) => React.ReactNode)(item);
  };

  // Display as cards on mobile
  if (isMobile) {
    return (
      <div className="space-y-4">
        {data.map((item, itemIndex) => (
          <Card
            key={itemIndex}
            className={cn(
              "overflow-hidden",
              onRowClick && "cursor-pointer hover:border-primary/50",
              className
            )}
            onClick={onRowClick ? () => onRowClick(item) : undefined}
          >
            <CardContent className="p-0">
              <div className="divide-y">
                {columns.map((column, colIndex) => {
                  // Skip rendering if there's no data or it's not meant to be displayed
                  if (
                    column.accessorKey === "actions" ||
                    column.id === "actions"
                  ) {
                    return (
                      <div
                        key={`${itemIndex}-${colIndex}`}
                        className="px-4 py-2 flex justify-end"
                      >
                        {renderCellValue(item, column)}
                      </div>
                    );
                  }

                  const value = renderCellValue(item, column);

                  if (value === undefined || value === null) return null;

                  return (
                    <div
                      key={`${itemIndex}-${colIndex}`}
                      className="px-4 py-2 flex justify-between items-center"
                    >
                      <div className="font-medium text-sm text-muted-foreground">
                        {column.header}
                      </div>
                      <div>{value}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Display as regular table on desktop
  return (
    <div className="w-full overflow-auto">
      <Table className={className}>
        <TableHeader>
          <TableRow>
            {columns.map((column) =>
              column.accessorKey == "actions" ? (
                <ActionsTableHead
                  key={column.accessorKey}
                  className={cn("text-right", column.id)}
                >
                  {column.header}
                </ActionsTableHead>
              ) : (
                <TableHead key={column.accessorKey} className={cn(column.id)}>
                  {column.header}
                </TableHead>
              )
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow
              key={index}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
              className={cn(onRowClick && "cursor-pointer hover:bg-muted/50")}
            >
              {columns.map((column) =>
                column.accessorKey == "actions" ? (
                  <ActionsTableCell
                    key={`${index}-${column.accessorKey}`}
                    className={cn("text-right", column.id)}
                  >
                    {renderCellValue(item, column)}
                  </ActionsTableCell>
                ) : (
                  <TableCell key={`${index}-${column.accessorKey}`}>
                    {renderCellValue(item, column)}
                  </TableCell>
                )
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Re-export Column type to fix imports in other files
export type { Column as TableColumn };
