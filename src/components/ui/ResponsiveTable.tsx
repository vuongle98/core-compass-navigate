
import React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Column } from "@/types/Common";
import { Badge } from "./badge";

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  emptyMessage?: string;
}

export function ResponsiveTable<T>({
  data,
  columns,
  className,
  emptyMessage = "No data available",
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();

  if (!data.length) {
    return (
      <div className="flex justify-center items-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  // Mobile view - each row becomes a card with label-value layout
  if (isMobile) {
    return (
      <div className={cn("space-y-4", className)}>
        {data.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden"
          >
            <div className="divide-y">
              {columns.map((column, colIndex) => {
                // Skip hidden columns
                if (column.accessorKey === 'id') {
                  return null;
                }
                
                // Render cell content
                const cellContent = column.cell 
                  ? column.cell(row)
                  : row[column.accessorKey as keyof T] != null
                  ? String(row[column.accessorKey as keyof T])
                  : "-";
                
                // For actions column, render it differently
                if (column.accessorKey === 'actions') {
                  return (
                    <div key={colIndex} className="p-3 bg-muted/10 flex justify-end">
                      {cellContent}
                    </div>
                  );
                }

                return (
                  <div key={colIndex} className="flex px-4 py-3">
                    <div className="font-medium text-sm text-muted-foreground w-1/3 flex items-center">
                      {column.header}:
                    </div>
                    <div className="w-2/3 flex items-center">
                      {cellContent}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Desktop view - traditional table
  return (
    <div className={cn("w-full overflow-auto", className)}>
      <table className="w-full caption-bottom text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map((column, index) => (
              <th
                key={index}
                className="h-11 px-4 text-left align-middle font-medium text-muted-foreground"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b transition-colors hover:bg-muted/50"
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="p-4 align-middle">
                  {column.cell
                    ? column.cell(row)
                    : row[column.accessorKey as keyof T] != null
                    ? String(row[column.accessorKey as keyof T])
                    : "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
