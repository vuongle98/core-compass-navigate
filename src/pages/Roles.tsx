
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";

const Roles = () => {
  // Mock data
  const roles = [
    { id: 1, name: "Admin", description: "Full system access", userCount: 5 },
    { id: 2, name: "Editor", description: "Can edit but not delete", userCount: 12 },
    { id: 3, name: "Viewer", description: "Read-only access", userCount: 45 },
    { id: 4, name: "Manager", description: "Department management", userCount: 8 },
  ];

  const columns = [
    { header: "Role Name", accessorKey: "name" as const },
    { header: "Description", accessorKey: "description" as const },
    { header: "User Count", accessorKey: "userCount" as const },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader 
          title="Roles" 
          description="Define user roles in your application"
        />
        
        <div className="mt-6">
          <DataTable data={roles} columns={columns} title="Role Management" />
        </div>
      </main>
    </div>
  );
};

export default Roles;
