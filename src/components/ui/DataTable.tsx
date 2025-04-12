
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
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { DataTablePagination, PaginationState } from "./DataTablePagination";
import ApiService from "@/services/ApiService";

interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title: string;
  onAdd?: (data: Omit<T, "id">) => void;
  onEdit?: (data: T) => void;
  onDelete?: (id: string | number) => void;
  // Pagination props
  pagination?: boolean;
  apiEndpoint?: string;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

export function DataTable<T extends { id: string | number }>({
  data: initialData,
  columns,
  title,
  onAdd,
  onEdit,
  onDelete,
  pagination = false,
  apiEndpoint,
  initialPageSize = 10,
  pageSizeOptions = [10, 20, 30, 50, 100],
}: DataTableProps<T>) {
  const isMobile = useIsMobile();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<T | null>(null);
  
  // Pagination state
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
    pageCount: 1,
    totalItems: initialData.length,
  });
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  // Create a dynamic form schema based on columns
  const createFormSchema = () => {
    const schemaObject: Record<string, any> = {};
    columns.forEach((column) => {
      // Skip id field in schema
      if (column.accessorKey === 'id') return;
      
      const key = String(column.accessorKey);
      schemaObject[key] = z.string().min(1, `${column.header} is required`);
    });
    return z.object(schemaObject);
  };

  const formSchema = createFormSchema();
  type FormSchemaType = z.infer<typeof formSchema>;

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {} as FormSchemaType,
  });

  // Load paginated data from API if pagination is enabled and apiEndpoint is provided
  useEffect(() => {
    if (pagination && apiEndpoint) {
      fetchPaginatedData();
    }
  }, [pagination, apiEndpoint, paginationState.pageIndex, paginationState.pageSize]);

  const fetchPaginatedData = async () => {
    if (!apiEndpoint) return;
    
    setIsLoading(true);
    try {
      const response = await ApiService.getPaginated<T>(apiEndpoint, {
        page: paginationState.pageIndex + 1, // API usually uses 1-based indexing
        pageSize: paginationState.pageSize,
      });
      
      setData(response.data);
      setPaginationState({
        ...paginationState,
        pageCount: response.totalPages,
        totalItems: response.totalItems,
      });
    } catch (error) {
      console.error("Failed to fetch paginated data:", error);
      toast.error("Failed to load data", {
        description: "Could not retrieve the requested data. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle pagination changes
  const handlePageChange = (page: number) => {
    setPaginationState({
      ...paginationState,
      pageIndex: page,
    });
  };

  const handlePageSizeChange = (size: number) => {
    setPaginationState({
      ...paginationState,
      pageSize: size,
      pageIndex: 0, // Reset to first page when changing page size
    });
  };

  const handleAdd = () => {
    // Reset form when opening add dialog
    form.reset({} as FormSchemaType);
    setIsAddDialogOpen(true);
  };

  const handleEdit = (item: T) => {
    setCurrentItem(item);
    
    // Convert all values to strings for the form
    const formValues = {} as FormSchemaType;
    Object.keys(item).forEach((key) => {
      if (key !== 'id') {
        formValues[key as keyof FormSchemaType] = String(item[key as keyof T]) as any;
      }
    });
    
    form.reset(formValues);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (item: T) => {
    setCurrentItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleAddSubmit = async (values: FormSchemaType) => {
    if (onAdd) {
      onAdd(values as unknown as Omit<T, "id">);
    } else if (apiEndpoint) {
      try {
        await ApiService.post(apiEndpoint, values);
        toast.success("Add action successful", {
          description: "New item added successfully",
        });
        fetchPaginatedData(); // Refresh data after add
      } catch (error) {
        console.error("Add error:", error);
        toast.error("Failed to add item", {
          description: "There was an error while adding the item",
        });
      }
    } else {
      toast.success("Add action successful", {
        description: "New item added successfully",
      });
    }
    setIsAddDialogOpen(false);
  };

  const handleEditSubmit = async (values: FormSchemaType) => {
    if (currentItem) {
      if (onEdit) {
        const updatedItem = { ...values, id: currentItem.id } as unknown as T;
        onEdit(updatedItem);
      } else if (apiEndpoint) {
        try {
          await ApiService.put(`${apiEndpoint}/${currentItem.id}`, values);
          toast.success("Edit action successful", {
            description: `Item updated successfully`,
          });
          fetchPaginatedData(); // Refresh data after edit
        } catch (error) {
          console.error("Edit error:", error);
          toast.error("Failed to update item", {
            description: "There was an error while updating the item",
          });
        }
      } else {
        toast.success("Edit action successful", {
          description: `Item with ID: ${currentItem?.id} updated successfully`,
        });
      }
    }
    setIsEditDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (currentItem) {
      if (onDelete) {
        onDelete(currentItem.id);
      } else if (apiEndpoint) {
        try {
          await ApiService.delete(`${apiEndpoint}/${currentItem.id}`);
          toast.success("Delete action successful", {
            description: `Item deleted successfully`,
          });
          fetchPaginatedData(); // Refresh data after delete
        } catch (error) {
          console.error("Delete error:", error);
          toast.error("Failed to delete item", {
            description: "There was an error while deleting the item",
          });
        }
      } else {
        toast.success("Delete action successful", {
          description: `Item with ID: ${currentItem?.id} deleted successfully`,
        });
      }
    }
    setIsDeleteDialogOpen(false);
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
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={columns.length + 1} className="text-center py-8">
              Loading data...
            </TableCell>
          </TableRow>
        ) : data.length > 0 ? (
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
      {isLoading ? (
        <div className="text-center py-8 border rounded-md">
          Loading data...
        </div>
      ) : data.length > 0 ? (
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

  // Form dialog for add/edit
  const renderFormFields = () => {
    return columns.map((column) => {
      // Skip rendering form field for id
      if (column.accessorKey === 'id') return null;
      
      const key = String(column.accessorKey);
      return (
        <FormField
          key={key}
          control={form.control}
          name={key as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{column.header}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={`Enter ${column.header.toLowerCase()}`} />
              </FormControl>
            </FormItem>
          )}
        />
      );
    });
  };

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
        
        {pagination && (
          <DataTablePagination
            pagination={paginationState}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={pageSizeOptions}
          />
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New {title.replace(" Management", "")}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddSubmit)} className="space-y-4">
              {renderFormFields()}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {title.replace(" Management", "")}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4">
              {renderFormFields()}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this item? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
