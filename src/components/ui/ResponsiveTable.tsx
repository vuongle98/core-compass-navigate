
import React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export interface TableColumn<T> {
  header: string;
  accessor: keyof T;
  cell?: (item: T) => React.ReactNode;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
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

  // Mobile view - each row becomes a card
  if (isMobile) {
    return (
      <div className={cn("space-y-4", className)}>
        {data.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="rounded-lg border bg-card text-card-foreground shadow-sm p-4"
          >
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="flex flex-col py-2 border-b last:border-0">
                <div className="font-medium text-sm text-muted-foreground">
                  {column.header}
                </div>
                <div className="mt-1">
                  {column.cell
                    ? column.cell(row)
                    : row[column.accessor] != null
                    ? String(row[column.accessor])
                    : "-"}
                </div>
              </div>
            ))}
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
                className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
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
                    : row[column.accessor] != null
                    ? String(row[column.accessor])
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
