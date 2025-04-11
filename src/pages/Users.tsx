
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";

const Users = () => {
  // Mock data
  const users = [
    { id: 1, name: "Alice Smith", email: "alice@example.com", role: "Admin", status: "Active" },
    { id: 2, name: "Bob Johnson", email: "bob@example.com", role: "User", status: "Active" },
    { id: 3, name: "Carol Davis", email: "carol@example.com", role: "Editor", status: "Inactive" },
    { id: 4, name: "Dave Wilson", email: "dave@example.com", role: "User", status: "Active" },
  ];

  const columns = [
    { header: "Name", accessorKey: "name" },
    { header: "Email", accessorKey: "email" },
    { header: "Role", accessorKey: "role" },
    { 
      header: "Status", 
      accessorKey: "status",
      cell: (user) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        }`}>
          {user.status}
        </span>
      )
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader 
          title="Users" 
          description="Manage your application users"
        />
        
        <div className="mt-6">
          <DataTable data={users} columns={columns} title="User Management" />
        </div>
      </main>
    </div>
  );
};

export default Users;
