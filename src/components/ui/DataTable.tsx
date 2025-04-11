
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title: string;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  title,
}: DataTableProps<T>) {
  const isMobile = useIsMobile();

  const handleAdd = () => {
    toast.success("Add action triggered");
  };

  const handleEdit = (item: T) => {
    toast.success(`Edit action triggered for ID: ${item.id}`);
  };

  const handleDelete = (item: T) => {
    toast.success(`Delete action triggered for ID: ${item.id}`);
  };

  // Desktop view
  const renderDesktopTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.header as string}>{column.header}</TableHead>
          ))}
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? (
          data.map((item) => (
            <TableRow key={item.id as React.Key}>
              {columns.map((column) => (
                <TableCell key={`${item.id}-${column.accessorKey as string}`}>
                  {column.cell
                    ? column.cell(item)
                    : (item[column.accessorKey] as React.ReactNode)}
                </TableCell>
              ))}
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(item)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length + 1} className="text-center py-8">
              No data available
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  // Mobile view - stacked cards
  const renderMobileTable = () => (
    <div className="space-y-4">
      {data.length > 0 ? (
        data.map((item) => (
          <div key={item.id as React.Key} className="border rounded-md p-4 pb-2">
            {columns.map((column) => (
              <div 
                key={`${item.id}-${column.accessorKey as string}`}
                className="flex justify-between items-center py-2 border-b last:border-b-0"
              >
                <span className="font-medium text-sm text-muted-foreground">
                  {column.header}
                </span>
                <span className="text-right">
                  {column.cell
                    ? column.cell(item)
                    : (item[column.accessorKey] as React.ReactNode)}
                </span>
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-2 mt-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDelete(item)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 border rounded-md">
          No data available
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{title}</h3>
        <Button onClick={handleAdd}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>
      <div className="border rounded-md">
        {isMobile ? renderMobileTable() : renderDesktopTable()}
      </div>
    </div>
  );
}
