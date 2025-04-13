import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";

interface Permission {
  id: number;
  code: string;
  name: string;
  description: string;
  module: string;
}

const Permissions = () => {
  // Mock data
  const permissions: Array<Permission> = [
    {
      id: 1,
      code: "CREATE_USER",
      name: "user:create",
      description: "Create users",
      module: "Users",
    },
    { id: 2, code: "READ_USER", name: "user:read", description: "View users", module: "Users" },
    { id: 3, code: "UPDATE_USER", name: "user:update", description: "Edit users", module: "Users" },
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
  ];

  const columns = [
    { header: "Code", accessorKey: "code" as const },
    { header: "Permission", accessorKey: "name" as const },
    { header: "Description", accessorKey: "description" as const },
    { header: "Module", accessorKey: "module" as const },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader
          title="Permissions"
          description="Manage system permissions"
        />

        <div className="mt-6">
          <DataTable
            data={permissions}
            columns={columns}
            title="Permission Management"
            pagination={true}
            apiEndpoint="/api/permission"
          />
        </div>
      </main>
    </div>
  );
};

export default Permissions;
