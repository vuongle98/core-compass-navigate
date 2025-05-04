import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { ActionsMenu, ActionType } from "@/components/common/ActionsMenu";
import { DataFilters, FilterOption } from "@/components/common/DataFilters";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import useApiQuery from "@/hooks/use-api-query";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { DetailViewModal } from "@/components/ui/detail-view-modal";
import { useDetailView } from "@/hooks/use-detail-view";
import { Permission, PermissionData } from "@/types/Auth";
import EnhancedApiService from "@/services/EnhancedApiService";

const Permissions = () => {
  const [permissions, setPermissions] = useState<PermissionData[]>([
    {
      id: "1",
      code: "user:read",
      name: "Read Users",
      description: "View user information",
      module: "Users",
      isActive: true,
      createdAt: "2023-01-01",
      updatedAt: "2023-01-01",
    },
    {
      id: "2",
      code: "user:write",
      name: "Write Users",
      description: "Create and update user information",
      module: "Users",
      isActive: true,
      createdAt: "2023-01-01",
      updatedAt: "2023-01-01",
    },
    {
      id: "3",
      code: "user:delete",
      name: "Delete Users",
      description: "Delete user accounts",
      module: "Users",
      isActive: true,
      createdAt: "2023-01-01",
      updatedAt: "2023-01-01",
    },
    {
      id: "4",
      code: "role:read",
      name: "Read Roles",
      description: "View role information",
      module: "Roles",
      isActive: true,
      createdAt: "2023-01-01",
      updatedAt: "2023-01-01",
    },
    {
      id: "5",
      code: "role:write",
      name: "Write Roles",
      description: "Create and update roles",
      module: "Roles",
      isActive: true,
      createdAt: "2023-01-01",
      updatedAt: "2023-01-01",
    },
    {
      id: "6",
      code: "role:delete",
      name: "Delete Roles",
      description: "Delete roles",
      module: "Roles",
      isActive: true,
      createdAt: "2023-01-01",
      updatedAt: "2023-01-01",
    },
    {
      id: "7",
      code: "permission:read",
      name: "Read Permissions",
      description: "View permission information",
      module: "Permissions",
      isActive: true,
      createdAt: "2023-01-01",
      updatedAt: "2023-01-01",
    },
    {
      id: "8",
      code: "permission:write",
      name: "Write Permissions",
      description: "Create and update permissions",
      module: "Permissions",
      isActive: true,
      createdAt: "2023-01-01",
      updatedAt: "2023-01-01",
    },
    {
      id: "9",
      code: "permission:delete",
      name: "Delete Permissions",
      description: "Delete permissions",
      module: "Permissions",
      isActive: false,
      createdAt: "2023-01-01",
      updatedAt: "2023-01-01",
    },
    {
      id: "10",
      code: "feature:flags",
      name: "Feature Flags",
      description: "Manage feature flags",
      module: "System",
      isActive: true,
      createdAt: "2023-01-01",
      updatedAt: "2023-01-01",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPermission, setEditingPermission] = useState<PermissionData | null>(null);
  const [formData, setFormData] = useState<Partial<PermissionData>>({
    code: "",
    name: "",
    description: "",
    module: "",
    isActive: true,
  });

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
        { value: "Users", label: "Users" },
        { value: "Roles", label: "Roles" },
        { value: "Permissions", label: "Permissions" },
        { value: "System", label: "System" },
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

  // Setup for detail view modal
  const {
    selectedItem: selectedPermission,
    isModalOpen: isDetailOpen,
    openDetail: openPermissionDetail,
    closeModal: closePermissionDetail,
  } = useDetailView<PermissionData>({
    modalThreshold: 10,
  });

  const {
    data: permissionData,
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
    endpoint: "/api/permission",
    queryKey: ["permissions"],
    initialPage: 0,
    initialPageSize: 10,
    persistFilters: true,
    debounceMs: 300,
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const openCreateDialog = () => {
    setEditingPermission(null);
    setFormData({
      code: "",
      name: "",
      description: "",
      module: "Users",
      isActive: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (permission: PermissionData) => {
    setEditingPermission(permission);
    setFormData({
      code: permission.code,
      name: permission.name,
      description: permission.description,
      module: permission.module,
      isActive: permission.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingPermission) {
        await EnhancedApiService.put(`/api/permission/${editingPermission.id}`, formData);

        setPermissions((prev) =>
          prev.map((permission) =>
            permission.id === editingPermission.id
              ? { ...permission, ...formData }
              : permission
          )
        );

        toast.success("Permission updated successfully");
      } else {
        const response = await EnhancedApiService.post("/api/permission", formData);

        const newPermission: PermissionData = {
          id: Date.now().toString(),
          code: formData.code || "",
          name: formData.name || "",
          description: formData.description || "",
          module: formData.module || "",
          isActive: formData.isActive || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setPermissions((prev) => [...prev, newPermission]);

        toast.success("Permission created successfully");
      }

      setDialogOpen(false);
    } catch (error) {
      console.error("Permission operation failed:", error);
      toast.error(
        editingPermission ? "Failed to update permission" : "Failed to create permission"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await EnhancedApiService.delete(`/api/permission/${id}`);

      setPermissions((prev) => prev.filter((permission) => permission.id !== id));

      toast.success("Permission deleted successfully");
    } catch (error) {
      console.error("Delete operation failed:", error);
      toast.error("Failed to delete permission");
    }
  };

  const columns: Column<PermissionData>[] = [
    {
      header: "#",
      accessorKey: "id",
      cell: (item: PermissionData) => (
        <span className="text-muted-foreground">{item.id}</span>
      ),
      sortable: true,
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: (item: PermissionData) => <span className="font-medium">{item.name}</span>,
      sortable: true,
    },
    { header: "Code", accessorKey: "code", sortable: true },
    { header: "Module", accessorKey: "module", sortable: true },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: (item: PermissionData) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            item.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {item.isActive ? "Active" : "Inactive"}
        </span>
      ),
      sortable: true,
    },
    {
      header: "Actions",
      accessorKey: "actions" as keyof PermissionData,
      cell: (item: PermissionData) => (
        <ActionsMenu
          actions={[
            {
              type: "view" as ActionType,
              label: "View Details",
              onClick: () => openPermissionDetail(item),
            },
            {
              type: "edit" as ActionType,
              label: "Edit",
              onClick: () => openEditDialog(item),
            },
            {
              type: "delete" as ActionType,
              label: "Delete",
              onClick: () => handleDelete(item.id),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Breadcrumbs />
        <PageHeader
          title="Permissions"
          description="Manage system permissions"
        >
          <DataFilters
            filters={filters}
            options={filterOptions}
            onChange={(newFilters) => {
              setFilters(newFilters);
            }}
            onReset={() => {
              resetFilters();
              refresh();
            }}
            className="mt-2"
          />
        </PageHeader>

        <div className="mt-4">
          <DataTable
            data={permissionData}
            columns={columns}
            title="Permission Management"
            pagination={true}
            isLoading={isLoading}
            pageIndex={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            totalItems={totalItems}
            showAddButton={true}
            onAddClick={openCreateDialog}
          />
        </div>

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
                <h3 className="text-sm font-medium">Code</h3>
                <p className="mt-1">{selectedPermission.code}</p>
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
                  {selectedPermission.isActive ? "Active" : "Inactive"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Created At</h3>
                <p className="mt-1">{selectedPermission.createdAt}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Updated At</h3>
                <p className="mt-1">{selectedPermission.updatedAt}</p>
              </div>
            </div>
          </DetailViewModal>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPermission ? "Edit Permission" : "Create New Permission"}
              </DialogTitle>
              <DialogDescription>
                {editingPermission
                  ? "Make changes to the permission details below."
                  : "Enter the details for the new permission."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="permission:action"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Permission Name"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Permission description"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="module">Module</Label>
                  <select
                    id="module"
                    name="module"
                    value={formData.module}
                    onChange={handleInputChange as any}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Users">Users</option>
                    <option value="Roles">Roles</option>
                    <option value="Permissions">Permissions</option>
                    <option value="System">System</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Processing..."
                    : editingPermission
                    ? "Save Changes"
                    : "Create Permission"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Permissions;
