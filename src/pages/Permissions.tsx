import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import ApiService from "@/services/ApiService";
import useApiQuery from "@/hooks/use-api-query";
import useDebounce from "@/hooks/use-debounce";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { ref } from "process";
import { useDetailView } from "@/hooks/use-detail-view";
import { DetailViewModal } from "@/components/ui/detail-view-modal";

interface Permission {
  id: number;
  code: string;
  name: string;
  description: string;
  module: string;
}

const Permissions = () => {
  const [permissions, setPermissions] = useState<Array<Permission>>([
    {
      id: 1,
      code: "CREATE_USER",
      name: "user:create",
      description: "Create users",
      module: "Users",
    },
    {
      id: 2,
      code: "READ_USER",
      name: "user:read",
      description: "View users",
      module: "Users",
    },
    {
      id: 3,
      code: "UPDATE_USER",
      name: "user:update",
      description: "Edit users",
      module: "Users",
    },
    {
      id: 4,
      code: "DELETE_USER",
      name: "user:delete",
      description: "Delete users",
      module: "Users",
    },
    {
      id: 5,
      code: "CREATE_ROLE",
      name: "role:create",
      description: "Create roles",
      module: "Roles",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null
  );
  const [formData, setFormData] = useState<Partial<Permission>>({
    code: "",
    name: "",
    description: "",
    module: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Debounce the search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

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
        { value: "Files", label: "Files" },
        { value: "Configuration", label: "Configuration" },
        { value: "System", label: "System" },
      ],
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      module: value,
    }));
  };

  const modules = [
    "USER",
    "ROLE",
    "PERMISSION",
    "FILE",
    "CONFIGURATION",
    "SYSTEM"
  ];

  // Setup for detail view modal
  const {
    selectedItem: selectedPermission,
    isModalOpen: isDetailOpen,
    openDetail: openPermDetail,
    closeModal: closePermDetail,
  } = useDetailView<Permission>({
    modalThreshold: 15,
  });

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
  } = useApiQuery<Permission>({
    endpoint: "/api/permission",
    queryKey: ["permissions", debouncedSearchTerm],
    initialPage: 0,
    initialPageSize: 10,
    persistFilters: true,
    onError: (err) => {
      console.error("Failed to fetch roles:", err);
      toast.error("Failed to load roles, using cached data", {
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

  const openCreateDialog = () => {
    setEditingPermission(null);
    setFormData({
      code: "",
      name: "",
      description: "",
      module: "",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (permission: Permission) => {
    setEditingPermission(permission);
    setFormData({
      code: permission.code,
      name: permission.name,
      description: permission.description,
      module: permission.module,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingPermission) {
        await ApiService.put(
          `/api/permission/${editingPermission.id}`,
          formData
        );

        setPermissions((prev) =>
          prev.map((permission) =>
            permission.id === editingPermission.id
              ? ({ ...permission, ...formData } as Permission)
              : permission
          )
        );

        toast.success("Permission updated successfully");
      } else {
        const response = await ApiService.post("/api/permission", formData);

        const newPermission = {
          ...formData,
          id: Date.now(),
        } as Permission;

        setPermissions((prev) => [...prev, newPermission]);

        toast.success("Permission created successfully");
      }

      setDialogOpen(false);
    } catch (error) {
      console.error("Permission operation failed:", error);
      toast.error(
        editingPermission
          ? "Failed to update permission"
          : "Failed to create permission"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await ApiService.delete(`/api/permission/${id}`);

      setPermissions((prev) =>
        prev.filter((permission) => permission.id !== id)
      );

      toast.success("Permission deleted successfully");
    } catch (error) {
      console.error("Delete operation failed:", error);
      toast.error("Failed to delete permission");
    }
  };

  const columns: Column<Permission>[] = [
    {
      header: "#",
      accessorKey: "id",
      cell: (item: Permission) => (
        <span className="text-muted-foreground">{item.id}</span>
      ),
      sortable: true,
    },
    { header: "Code", accessorKey: "code", sortable: true, filterable: true },
    {
      header: "Permission",
      accessorKey: "name",
      sortable: true,
      filterable: true,
    },
    { header: "Description", accessorKey: "description", sortable: true },
    {
      header: "Module",
      accessorKey: "module",
      sortable: true,
      filterable: true,
    },
    {
      header: "Actions",
      accessorKey: "actions" as keyof Permission,
      cell: (item: Permission) => (
        <ActionsMenu
          actions={[
            {
              type: "view" as ActionType,
              label: "View Details",
              onClick: () => openPermDetail(item),
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
        <PageHeader title="Permissions" description="Manage system permissions">
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
            onClose={closePermDetail}
            title="Permission Details"
            size="md"
            showCloseButton={false}
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Code</h3>
                <p className="mt-1">{selectedPermission.code}</p>
              </div>
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
            </div>
          </DetailViewModal>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPermission
                  ? "Edit Permission"
                  : "Create New Permission"}
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
                    placeholder="PERMISSION_CODE"
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
                    placeholder="resource:action"
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
                    rows={2}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="module">Module</Label>
                  <Select
                    value={formData.module}
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger id="module">
                      <SelectValue placeholder="Select module" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map((module) => (
                        <SelectItem key={module} value={module}>
                          {module}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
