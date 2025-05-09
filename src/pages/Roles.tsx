import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/DataTable";
import { ActionsMenu, ActionType } from "@/components/common/ActionsMenu";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import useApiQuery from "@/hooks/use-api-query";
import { DataFilters, FilterOption } from "@/components/common/DataFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import PermissionSelect from "@/components/role/PermissionSelect";
import { Textarea } from "@/components/ui/textarea";
import { Permission, Role } from "@/types/Auth";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { useDetailView } from "@/hooks/use-detail-view";
import { DetailViewModal } from "@/components/ui/detail-view-modal";
import RoleService from "@/services/RoleService";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const Roles = () => {
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

  // Mock data for permissions
  const mockRoles = [
    {
      id: 1,
      name: "Admin",
      code: "ADMIN",
      description: "Administrator role with full access",
      permissions: [
        {
          id: 1,
          name: "Read Users",
          code: "USER_READ",
          description: "Allows reading user data",
        },
        {
          id: 2,
          name: "Create Users",
          code: "USER_CREATE",
          description: "Allows creating new users",
        },
        {
          id: 3,
          name: "Update Users",
          code: "USER_UPDATE",
          description: "Allows updating existing users",
        },
        {
          id: 4,
          name: "Delete Users",
          code: "USER_DELETE",
          description: "Allows deleting users",
        },
      ], // Changed from strings to numbers
      createdAt: "2023-04-01",
    },
    {
      id: 2,
      name: "Editor",
      code: "EDITOR",
      description: "Editor role with access to create and update content",
      permissions: [
        {
          id: 2,
          name: "Create Users",
          code: "USER_CREATE",
          description: "Allows creating new users",
        },
        {
          id: 3,
          name: "Update Users",
          code: "USER_UPDATE",
          description: "Allows updating existing users",
        },
      ], // Changed from strings to numbers
      createdAt: "2023-04-05",
    },
    {
      id: 3,
      name: "Viewer",
      code: "VIEWER",
      description: "Viewer role with read-only access",
      permissions: [
        {
          id: 1,
          name: "Read Users",
          code: "USER_READ",
          description: "Allows reading user data",
        },
      ], // Changed from strings to numbers
      createdAt: "2023-04-10",
    },
  ];

  const [roles, setRoles] = useState<Role[]>(mockRoles);

  // Filter options for the data filters component
  const filterOptions: FilterOption[] = [
    {
      id: "search",
      label: "Search",
      type: "search",
      placeholder: "Search roles...",
    },
  ];

  // Use our custom API query hook
  const {
    data: roleData,
    isLoading,
    filters,
    setFilters,
    resetFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalItems,
    refresh,
  } = useApiQuery<Role>({
    endpoint: "/api/role",
    queryKey: ["roles"],
    initialPageSize: 10,
    persistFilters: true,
    mockData: {
      content: roles,
      totalElements: 3,
      totalPages: 1,
      number: 0,
      size: 10,
    },
  });

  // Setup for detail view modal
  const {
    selectedItem: selectedItem,
    isModalOpen: isDetailOpen,
    openDetail: openItemDetail,
    closeModal: closeItemDetail,
  } = useDetailView<Role>({
    modalThreshold: 10,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingRole) {
        await RoleService.updateRole(editingRole.id, formData as Partial<Role>);

        setRoles((prev) =>
          prev.map((role) =>
            role.id === editingRole.id ? { ...role, ...formData } : role
          )
        );

        toast.success("Role updated successfully");
        refresh(); // Changed from refetch to refresh
      } else {
        const newRole = await RoleService.createRole(formData);

        setRoles((prev) => [...prev, newRole]);

        toast.success("Role created successfully");
        refresh(); // Changed from refetch to refresh
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

  const getActionItems = (item: Role) => {
    const actions: {
      type: ActionType;
      label: string;
      onClick: () => void;
      disabled?: boolean;
    }[] = [
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
    ];
    return actions;
  };

  const columns = [
    {
      header: "#",
      accessorKey: "id",
      cell: (item: Role) => (
        <span className="text-muted-foreground">{item.id}</span>
      ),
      sortable: true,
    },
    { header: "Name", accessorKey: "name" as const },
    { header: "Description", accessorKey: "description" as const },
    {
      header: "Permissions",
      accessorKey: "permissions" as const,
      sortable: false,
      filterable: false,
      cell: (role: Role) => (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="px-2 py-0.5 rounded-full border bg-muted/40 text-xs font-semibold hover:bg-muted/70 cursor-pointer"
              title={
                role.permissions && role.permissions.length > 0
                  ? `${role.permissions.length} permissions`
                  : "No permission"
              }
              style={{ minWidth: 32 }}
            >
              {role.permissions?.length || 0} roles
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={6}
            className="w-56 p-2 max-h-[250px] overflow-y-auto"
          >
            <div className="font-semibold text-sm mb-2">Roles</div>
            {role.permissions && role.permissions.length > 0 ? (
              <ul className="space-y-1">
                {role.permissions.map((perm) => (
                  <li
                    key={perm.id || `perm-${Math.random()}`}
                    className="border rounded px-2 py-1 bg-muted/40"
                  >
                    <div className="font-semibold text-xs">
                      {perm.name || "Unnamed Permission"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {perm.description || "No description"}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-muted-foreground">
                No permission assigned
              </div>
            )}
          </PopoverContent>
        </Popover>
      ),
    },
    { header: "Created At", accessorKey: "createdAt" as const },
    {
      header: "Actions",
      accessorKey: "actions" as const,
      cell: (role: Role) => <ActionsMenu actions={getActionItems(role)} />,
    },
  ];

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

  const handleDelete = async (id: number) => {
    try {
      await RoleService.deleteRole(id);

      setRoles((prev) => prev.filter((role) => role.id !== id));
      refresh(); // Changed from refetch to refresh
      toast.success("Role deleted successfully");
    } catch (error) {
      console.error("Delete operation failed:", error);
      toast.error("Failed to delete role");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <Breadcrumbs />
        <PageHeader
          title="Roles"
          description="Manage user roles and permissions"
          showAddButton={false}
        />

        <DataFilters
          filters={filters}
          options={filterOptions}
          onChange={setFilters}
          onReset={resetFilters}
          className="mt-4 mb-4"
        />

        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <DataTable
              data={roleData}
              columns={columns}
              title="User Roles"
              pagination={true}
              showAddButton={true}
              onAddClick={openCreateDialog}
              pageIndex={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              totalItems={totalItems}
              isLoading={isLoading}
            />
          )}
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
                  <ScrollArea className="h-40">
                    <div className="flex flex-col space-y-1">
                      {selectedItem.permissions.map((permission) => (
                        <Badge key={permission.id}>{permission.name}</Badge>
                      ))}
                    </div>
                  </ScrollArea>
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
              <div className="grid gap-4 py-2">
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
