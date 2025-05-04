import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { DataFilters, FilterOption } from "@/components/common/DataFilters";
import { ActionsMenu, ActionType } from "@/components/common/ActionsMenu";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { toast } from "sonner";
import { useDetailView } from "@/hooks/use-detail-view";
import { DetailViewModal } from "@/components/ui/detail-view-modal";
import useApiQuery from "@/hooks/use-api-query";
import useDebounce from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Permission } from "@/types/Auth";

interface PermissionData {
  id: string | number; // Match the type in Permission
  name: string;
  description: string;
  module: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const permissionSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  module: z.string().min(1, "Module is required"),
  isActive: z.boolean().default(true),
});

const Permissions = () => {
  // Mock data
  const [permissions, setPermissions] = useState<PermissionData[]>([
    {
      id: "1",
      name: "user:read",
      description: "Can view user information",
      module: "User Management",
      isActive: true,
      createdAt: "2023-01-01T00:00:00Z",
      updatedAt: "2023-01-01T00:00:00Z",
    },
    {
      id: "2",
      name: "user:write",
      description: "Can create and update users",
      module: "User Management",
      isActive: true,
      createdAt: "2023-01-01T00:00:00Z",
      updatedAt: "2023-01-01T00:00:00Z",
    },
    {
      id: "3",
      name: "role:assign",
      description: "Can assign roles to users",
      module: "Role Management",
      isActive: false,
      createdAt: "2023-01-01T00:00:00Z",
      updatedAt: "2023-01-01T00:00:00Z",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<PermissionData | null>(null);
  const formRef = useRef(null);

  // Debounce the search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Setup for detail view modal
  const {
    selectedItem: selectedPermission,
    isModalOpen: isDetailOpen,
    openDetail: openPermissionDetail,
    closeModal: closePermissionDetail,
  } = useDetailView<PermissionData>({
    modalThreshold: 15
  });

  const form = useForm({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      name: "",
      description: "",
      module: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (editingPermission) {
      form.reset({
        name: editingPermission.name,
        description: editingPermission.description,
        module: editingPermission.module,
        isActive: editingPermission.isActive,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        module: "",
        isActive: true,
      });
    }
  }, [editingPermission, form]);

  const {
    data: permissionsData,
    isLoading,
    filters,
    setFilters,
    resetFilters,
    page,
    pageSize,
    setPage,
    setPageSize,
    totalItems,
    refresh,
    error,
  } = useApiQuery<PermissionData>({
    endpoint: "/api/permissions",
    queryKey: ["permissions", debouncedSearchTerm],
    initialPage: 0,
    initialPageSize: 10,
    persistFilters: true,
    onError: (err) => {
      console.error("Failed to fetch permissions:", err);
      toast.error("Failed to load permissions, using cached data", {
        description: "Could not connect to the server. Please try again later.",
      });
    },
    mockData: {
      content: permissions,
      totalElements: permissions.length,
      totalPages: 1,
      number: 0,
      size: 10,
    },
  });

  // Filter options
  const filterOptions: FilterOption[] = [
    {
      id: "search",
      label: "Search",
      type: "search",
      placeholder: "Search permissions...",
    },
    {
      id: "module",
      label: "Module",
      type: "select",
      options: [
        { value: "User Management", label: "User Management" },
        { value: "Role Management", label: "Role Management" },
        { value: "Content Management", label: "Content Management" },
      ],
    },
    {
      id: "isActive",
      label: "Status",
      type: "select",
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
  ];

  // Actions for permissions
  const getActionItems = (permission: Permission) => {
    return [
      {
        type: "view" as ActionType,
        label: "View Permission",
        onClick: () => openPermissionDetail(permission),
      },
      {
        type: "edit" as ActionType,
        label: "Edit Permission",
        onClick: () => handleEditPermission(permission),
      },
      {
        type: "delete" as ActionType,
        label: "Delete Permission",
        onClick: () => handleDeletePermission(permission.id),
      },
    ];
  };

  // Handle permission operations
  const handleAddPermission = () => {
    setEditingPermission(null);
    setIsDialogOpen(true);
  };

  const handleEditPermission = (permission: Permission) => {
    const typedPermission = permission as unknown as PermissionData;
    setEditingPermission(typedPermission);
    setIsDialogOpen(true);
  };

  const handleDeletePermission = (id: string | number) => {
    // Convert id to string for consistency if needed
    const idString = id.toString();
    
    // In a real app, call API to delete
    setPermissions(permissions.filter((p) => p.id.toString() !== idString));
    toast.success("Permission deleted successfully");
  };

  const handleSubmit = (values: z.infer<typeof permissionSchema>) => {
    if (editingPermission) {
      // Update existing permission
      const updatedPermissions = permissions.map((p) =>
        p.id === editingPermission.id
          ? { 
              ...p, 
              ...values, 
              updatedAt: new Date().toISOString()
            }
          : p
      );
      setPermissions(updatedPermissions);
      toast.success("Permission updated successfully");
    } else {
      // Create new permission
      const newPermission: PermissionData = {
        id: Math.random().toString(36).substring(2, 9),
        name: values.name,
        description: values.description,
        module: values.module,
        isActive: values.isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPermissions([...permissions, newPermission]);
      toast.success("Permission created successfully");
    }
    setIsDialogOpen(false);
  };

  const columns = [
    {
      header: "Name",
      accessorKey: "name",
      sortable: true,
    },
    {
      header: "Description",
      accessorKey: "description",
      sortable: true,
    },
    {
      header: "Module",
      accessorKey: "module",
      sortable: true,
    },
    {
      header: "Status",
      accessorKey: "isActive",
      sortable: true,
      cell: (permission: Permission) => (
        <Badge
          variant={permission.isActive ? "default" : "secondary"}
          className={permission.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
        >
          {permission.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (permission: Permission) => (
        <ActionsMenu actions={getActionItems(permission)} />
      ),
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Breadcrumbs
          items={[
            { label: "Home", path: "/" },
            { label: "Settings", path: "/settings" },
            { label: "Permissions", path: "/permissions" },
          ]}
        />

        <PageHeader
          title="Permissions"
          description="Manage system permissions"
        >
          <Button 
            onClick={handleAddPermission} 
            className="mt-2"
          >
            Add Permission
          </Button>
          
          <DataFilters
            filters={filters}
            options={filterOptions}
            onChange={(newFilters) => {
              setFilters(newFilters);
              // Update the search term when filters change
              if (newFilters.search !== undefined) {
                setSearchTerm(newFilters.search.toString());
              }
            }}
            onReset={() => {
              resetFilters();
              setSearchTerm("");
              refresh();
            }}
            className="mt-2"
          />
        </PageHeader>

        <div className="mt-4">
          <DataTable
            data={permissionsData}
            columns={columns}
            title="Permissions"
            pagination={true}
            showAddButton={true}
            onAddClick={handleAddPermission}
            isLoading={isLoading}
            pageIndex={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            totalItems={totalItems}
          />
        </div>

        {/* Permission Detail Modal */}
        {selectedPermission && (
          <DetailViewModal
            isOpen={isDetailOpen}
            onClose={closePermissionDetail}
            title="Permission Details"
            size="md"
            showCloseButton={false}
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Name</h3>
                <p className="mt-1">{selectedPermission.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Description</h3>
                <p className="mt-1">{selectedPermission.description}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Module</h3>
                <p className="mt-1">{selectedPermission.module}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Status</h3>
                <p className="mt-1">
                  <Badge
                    variant={selectedPermission.isActive ? "default" : "secondary"}
                    className={selectedPermission.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                  >
                    {selectedPermission.isActive ? "Active" : "Inactive"}
                  </Badge>
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Created At</h3>
                <p className="mt-1">
                  {new Date(selectedPermission.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Updated At</h3>
                <p className="mt-1">
                  {new Date(selectedPermission.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </DetailViewModal>
        )}

        {/* Add/Edit Permission Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPermission ? "Edit Permission" : "Add Permission"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                ref={formRef}
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., user:read" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Can view user information"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="module"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Module</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., User Management"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingPermission ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Permissions;
