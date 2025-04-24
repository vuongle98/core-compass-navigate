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

import PermissionSelect, {
  Permission,
} from "@/components/permission/PermissionSelect";
import EnhancedApiService from "@/services/EnhancedApiService";

export interface Role {
  id: number;
  code?: string;
  name: string;
  description: string;
  userCount: number;
  permissions?: Permission[];
  permissionIds?: number[];
}

const Roles = () => {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 1,
      code: "ADMIN",
      name: "Admin",
      description: "Full system access",
      userCount: 5,
    },
    {
      id: 2,
      name: "Editor",
      description: "Can edit but not delete",
      userCount: 12,
    },
    { id: 3, name: "Viewer", description: "Read-only access", userCount: 45 },
    {
      id: 4,
      name: "Manager",
      description: "Department management",
      userCount: 8,
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<Partial<Role>>({
    code: "",
    name: "",
    description: "",
    permissions: [],
    permissionIds: [],
  });

  const filterOptions: FilterOption[] = [
    {
      id: "search",
      label: "Search",
      type: "search",
      placeholder: "Search roles...",
    },
    {
      id: "userCount",
      label: "User Count",
      type: "select",
      options: [
        { value: "low", label: "Low (0-10)" },
        { value: "medium", label: "Medium (11-30)" },
        { value: "high", label: "High (31+)" },
      ],
    },
    {
      id: "type",
      label: "Type",
      type: "select",
      options: [
        { value: "ADMIN", label: "Admin" },
        { value: "MANAGE", label: "Manager" },
        { value: "USER", label: "User" },
      ],
    },
  ];

  // Setup for detail view modal
  const {
    selectedItem: selectedItem,
    isModalOpen: isDetailOpen,
    openDetail: openItemDetail,
    closeModal: closeItemDetail,
  } = useDetailView<Role>({
    modalThreshold: 10,
  });

  const {
    data: roleData,
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
  } = useApiQuery<Role>({
    endpoint: "/api/role",
    queryKey: ["roles"],
    initialPage: 0,
    initialPageSize: 10,
    persistFilters: true,
    debounceMs: 300,
    onError: (err) => {
      console.error("Failed to fetch roles:", err);
      toast.error("Failed to load roles, using cached data", {
        description: "Could not connect to the server. Please try again later.",
      });
    },
    mockData: {
      content: roles,
      totalElements: roles.length,
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

  const handlePermissionsChange = (
    permissions: Permission[],
    permissionIds: number[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      permissionIds,
      permissions,
    }));
  };

  const openCreateDialog = () => {
    setEditingRole(null);
    setFormData({
      code: "",
      name: "",
      description: "",
      permissions: [],
    });
    setDialogOpen(true);
  };

  const openEditDialog = (role: Role) => {
    setEditingRole(role);
    setFormData({
      code: role.code || "",
      name: role.name,
      description: role.description,
      permissions: role.permissions || [],
      permissionIds: role.permissions?.map((p) => p.id) || [],
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingRole) {
        await EnhancedApiService.put(`/api/role/${editingRole.id}`, formData);

        setRoles((prev) =>
          prev.map((role) =>
            role.id === editingRole.id
              ? { ...role, ...formData, userCount: role.userCount }
              : role
          )
        );

        toast.success("Role updated successfully");
      } else {
        const response = await EnhancedApiService.post("/api/role", formData);

        const newRole = {
          ...formData,
          id: Date.now(),
          userCount: 0,
        } as Role;

        setRoles((prev) => [...prev, newRole]);

        toast.success("Role created successfully");
      }

      setDialogOpen(false);
    } catch (error) {
      console.error("Role operation failed:", error);
      toast.error(
        editingRole ? "Failed to update role" : "Failed to create role"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await EnhancedApiService.delete(`/api/role/${id}`);

      setRoles((prev) => prev.filter((role) => role.id !== id));

      toast.success("Role deleted successfully");
    } catch (error) {
      console.error("Delete operation failed:", error);
      toast.error("Failed to delete role");
    }
  };

  const columns: Column<Role>[] = [
    {
      header: "#",
      accessorKey: "id",
      cell: (item: Role) => (
        <span className="text-muted-foreground">{item.id}</span>
      ),
      sortable: true,
    },
    { header: "Code", accessorKey: "code", sortable: true },
    {
      header: "Role Name",
      accessorKey: "name",
      sortable: true,
      filterable: true,
    },
    { header: "Description", accessorKey: "description", sortable: true },
    { header: "User Count", accessorKey: "userCount", sortable: true },
    {
      header: "Actions",
      accessorKey: "actions" as keyof Role,
      cell: (item: Role) => (
        <ActionsMenu
          actions={[
            {
              type: "view" as ActionType,
              label: "View Details",
              onClick: () => openItemDetail(item),
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
          title="Roles"
          description="Define user roles in your application"
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
            data={roleData}
            columns={columns}
            title="Role Management"
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

        {selectedItem && (
          <DetailViewModal
            isOpen={isDetailOpen}
            onClose={closeItemDetail}
            title="Role Details"
            size="md"
            showCloseButton={false}
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Code</h3>
                <p className="mt-1">{selectedItem.code}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Name</h3>
                <p className="mt-1">{selectedItem.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Description</h3>
                <p className="mt-1">{selectedItem.description}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Permissions</h3>
                {selectedItem.permissions?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedItem.permissions?.map((perm) => (
                      <div
                        key={perm.id}
                        className="border rounded-md p-3 bg-muted/40"
                      >
                        <div className="font-semibold">{perm.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {perm.description}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1">No permissions assigned</p>
                )}
              </div>
            </div>
          </DetailViewModal>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingRole ? "Edit Role" : "Create New Role"}
              </DialogTitle>
              <DialogDescription>
                {editingRole
                  ? "Make changes to the role details below."
                  : "Enter the details for the new role."}
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
                    placeholder="ROLE_CODE"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Role Name"
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
                    placeholder="Role description and permissions"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <PermissionSelect
                    value={formData.permissions || []}
                    onChange={handlePermissionsChange}
                    disabled={isSubmitting}
                  />
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
                    : editingRole
                    ? "Save Changes"
                    : "Create Role"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Roles;
