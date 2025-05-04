
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/DataTable";
import { ActionsMenu, ActionType } from "@/components/common/ActionsMenu";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { PopoverTrigger, PopoverContent, Popover } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import useApiQuery from "@/hooks/use-api-query";
import { DataFilters, FilterOption } from "@/components/common/DataFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import LoggingService from "@/services/LoggingService";

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: number[]; // Changed from string[] to number[]
  createdAt: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
}

const Roles = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);

  // Mock data for permissions
  const mockPermissions: Permission[] = [
    { id: "1", name: "Read Users", description: "Allows reading user data" },
    { id: "2", name: "Create Users", description: "Allows creating new users" },
    { id: "3", name: "Update Users", description: "Allows updating existing users" },
    { id: "4", name: "Delete Users", description: "Allows deleting users" },
    { id: "5", name: "Read Roles", description: "Allows reading role data" },
    { id: "6", name: "Create Roles", description: "Allows creating new roles" },
    { id: "7", name: "Update Roles", description: "Allows updating existing roles" },
    { id: "8", name: "Delete Roles", description: "Allows deleting roles" },
  ];

  // Filter options for the data filters component
  const filterOptions: FilterOption[] = [
    {
      id: "search",
      label: "Search",
      type: "search",
      placeholder: "Search roles..."
    },
  ];

  // Use our custom API query hook
  const {
    data: roles,
    isLoading,
    filters,
    setFilters,
    resetFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalItems
  } = useApiQuery<Role>({
    endpoint: "/api/role",
    queryKey: ["roles"],
    initialPageSize: 10,
    persistFilters: true,
    mockData: {
      content: [
        {
          id: 1,
          name: "Admin",
          description: "Administrator role with full access",
          permissions: [1, 2, 3, 4, 5, 6, 7, 8], // Changed from strings to numbers
          createdAt: "2023-04-01",
        },
        {
          id: 2,
          name: "Editor",
          description: "Editor role with access to create and update content",
          permissions: [1, 3, 5, 7], // Changed from strings to numbers
          createdAt: "2023-04-05",
        },
        {
          id: 3,
          name: "Viewer",
          description: "Viewer role with read-only access",
          permissions: [1, 5], // Changed from strings to numbers
          createdAt: "2023-04-10",
        },
      ],
      totalElements: 3,
      totalPages: 1,
      number: 0,
      size: 10
    }
  });

  const viewDetails = (role: Role) => {
    setSelectedRole(role);
    setDetailsOpen(true);
    setSelectedPermissions(mockPermissions.filter(p => role.permissions.includes(Number(p.id))));
    LoggingService.info("roles", "view_details", `Viewed details for role ID ${role.id}`);
  };

  const editRole = (role: Role) => {
    setSelectedRole(role);
    setEditOpen(true);
    setSelectedPermissions(mockPermissions.filter(p => role.permissions.includes(Number(p.id))));
    LoggingService.info("roles", "edit_role", `Opened edit dialog for role ID ${role.id}`);
  };

  const deleteRole = (role: Role) => {
    // In a real application, this would call an API to delete the role
    toast.success("Role deleted successfully");
    LoggingService.info("roles", "delete_role", `Deleted role ID ${role.id}`);
  };

  const getActionItems = (item: Role) => {
    const actions: {
      type: ActionType;
      label: string;
      onClick: () => void;
      disabled?: boolean;
    }[] = [
      {
        type: "view",
        label: "View Details",
        onClick: () => viewDetails(item),
      },
      {
        type: "edit",
        label: "Edit Role",
        onClick: () => editRole(item),
      },
      {
        type: "delete",
        label: "Delete Role",
        onClick: () => deleteRole(item),
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
    { header: "Created At", accessorKey: "createdAt" as const },
    {
      header: "Actions",
      accessorKey: "actions" as const,
      cell: (role: Role) => (
        <ActionsMenu actions={getActionItems(role)} />
      ),
    },
  ];

  const handleAddClick = () => setCreateOpen(true);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader
          title="Roles"
          description="Manage user roles and permissions"
          showAddButton={true}
          onAddClick={handleAddClick} // Changed from onAdd to onAddClick
        >
          <DataFilters
            filters={filters}
            options={filterOptions}
            onChange={setFilters}
            onReset={resetFilters}
            className="mt-4"
          />
        </PageHeader>

        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <DataTable
              data={roles}
              columns={columns}
              title="User Roles"
              pagination={true}
              showAddButton={true}
              onAddClick={() => setCreateOpen(true)} // Changed from onAdd to onAddClick
              pageIndex={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              totalItems={totalItems}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Role Details</DialogTitle>
              <DialogDescription>
                Complete information about this role
              </DialogDescription>
            </DialogHeader>
            {selectedRole && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 gap-2">
                  <div className="font-semibold">Name:</div>
                  <div>{selectedRole.name}</div>

                  <div className="font-semibold">Description:</div>
                  <div>{selectedRole.description}</div>

                  <div className="font-semibold">Permissions:</div>
                  <ScrollArea className="h-40">
                    <div className="flex flex-col space-y-1">
                      {selectedPermissions.map((permission) => (
                        <Badge key={permission.id}>{permission.name}</Badge>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
              <DialogDescription>
                Make changes to this role
              </DialogDescription>
            </DialogHeader>
            {selectedRole && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue={selectedRole.name} />

                  <Label htmlFor="description">Description</Label>
                  <Input id="description" defaultValue={selectedRole.description} />

                  <Label htmlFor="permissions">Permissions</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select permissions" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPermissions.map((permission) => (
                        <SelectItem key={permission.id} value={permission.id}>
                          {permission.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Role</DialogTitle>
              <DialogDescription>
                Create a new role
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Role name" />

                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Role description" />

                <Label htmlFor="permissions">Permissions</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select permissions" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPermissions.map((permission) => (
                      <SelectItem key={permission.id} value={permission.id}>
                        {permission.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Roles;
