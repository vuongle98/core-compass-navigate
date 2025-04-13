
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ActionsMenu } from "@/components/common/ActionsMenu";
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
import ApiService from "@/services/ApiService";

interface Role {
  id: number;
  code?: string;
  name: string;
  description: string;
  userCount: number;
}

const Roles = () => {
  const [roles, setRoles] = useState<Role[]>([
    { id: 1, code: "ADMIN", name: "Admin", description: "Full system access", userCount: 5 },
    { id: 2, name: "Editor", description: "Can edit but not delete", userCount: 12 },
    { id: 3, name: "Viewer", description: "Read-only access", userCount: 45 },
    { id: 4, name: "Manager", description: "Department management", userCount: 8 },
  ]);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<Partial<Role>>({
    code: "",
    name: "",
    description: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openCreateDialog = () => {
    setEditingRole(null);
    setFormData({
      code: "",
      name: "",
      description: ""
    });
    setDialogOpen(true);
  };

  const openEditDialog = (role: Role) => {
    setEditingRole(role);
    setFormData({
      code: role.code || "",
      name: role.name,
      description: role.description
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingRole) {
        // Update existing role
        await ApiService.put(`/api/role/${editingRole.id}`, formData);
        
        // Optimistic UI update
        setRoles(prev => 
          prev.map(role => 
            role.id === editingRole.id 
              ? { ...role, ...formData, userCount: role.userCount } 
              : role
          )
        );
        
        toast.success("Role updated successfully");
      } else {
        // Create new role
        const response = await ApiService.post("/api/role", formData);
        
        // Add new role to state with a temporary ID (in a real app, you'd use the ID from the response)
        const newRole = {
          ...formData,
          id: Date.now(), // Temporary ID for optimistic UI
          userCount: 0
        } as Role;
        
        setRoles(prev => [...prev, newRole]);
        
        toast.success("Role created successfully");
      }
      
      setDialogOpen(false);
    } catch (error) {
      console.error("Role operation failed:", error);
      toast.error(editingRole ? "Failed to update role" : "Failed to create role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await ApiService.delete(`/api/role/${id}`);
      
      // Optimistic UI update
      setRoles(prev => prev.filter(role => role.id !== id));
      
      toast.success("Role deleted successfully");
    } catch (error) {
      console.error("Delete operation failed:", error);
      toast.error("Failed to delete role");
    }
  };

  const columns = [
    { header: "Code", accessorKey: "code" },
    { header: "Role Name", accessorKey: "name" },
    { header: "Description", accessorKey: "description" },
    { header: "User Count", accessorKey: "userCount" },
    { 
      header: "Actions",
      accessorKey: "id",
      cell: (item: Role) => (
        <ActionsMenu 
          actions={[
            {
              type: "view",
              label: "View Details",
              onClick: () => toast.info(`Viewing ${item.name}`)
            },
            {
              type: "edit",
              label: "Edit",
              onClick: () => openEditDialog(item)
            },
            {
              type: "delete",
              label: "Delete",
              onClick: () => handleDelete(item.id)
            }
          ]}
        />
      )
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader
          title="Roles"
          description="Define user roles in your application"
        />

        <div className="flex justify-between items-center my-6">
          <div></div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Button>
        </div>

        <div className="mt-4">
          <DataTable
            data={roles}
            columns={columns}
            title="Role Management"
            pagination={true}
            apiEndpoint="/api/role"
          />
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRole ? "Edit Role" : "Create New Role"}</DialogTitle>
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
                  {isSubmitting ? "Processing..." : (editingRole ? "Save Changes" : "Create Role")}
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
