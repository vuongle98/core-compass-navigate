import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { useState } from "react";
import { toast } from "sonner";

interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  status: string;
}

const Users = () => {
  // Mock data with state management
  const [users, setUsers] = useState([
    {
      id: 1,
      username: "Alice Smith",
      email: "alice@example.com",
      roles: ["Admin"],
      status: "Active",
    },
    {
      id: 2,
      username: "Bob Johnson",
      email: "bob@example.com",
      roles: ["User"],
      status: "Active",
    },
    {
      id: 3,
      username: "Carol Davis",
      email: "carol@example.com",
      roles: ["Editor"],
      status: "Inactive",
    },
    {
      id: 4,
      username: "Dave Wilson",
      email: "dave@example.com",
      roles: ["User"],
      status: "Active",
    },
  ]);

  const columns = [
    { header: "Name", accessorKey: "username" as const },
    { header: "Email", accessorKey: "email" as const },
    { header: "Role", accessorKey: "roles" as const },
    {
      header: "Status",
      accessorKey: "status" as const,
      cell: (user: User) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {user.status}
        </span>
      ),
    },
  ];

  const handleAddUser = (newUser: Omit<(typeof users)[0], "id">) => {
    const id = Math.max(0, ...users.map((user) => Number(user.id))) + 1;
    setUsers([...users, { ...newUser, id }]);
    toast.success("User added successfully");
  };

  const handleEditUser = (updatedUser: (typeof users)[0]) => {
    setUsers(
      users.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
    toast.success("User updated successfully");
  };

  const handleDeleteUser = (id: number | string) => {
    setUsers(users.filter((user) => user.id !== id));
    toast.success("User deleted successfully");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader
          title="Users"
          description="Manage your application users"
          showAddButton={false}
        />

        <div className="mt-6">
          <DataTable
            data={users}
            columns={columns}
            title="User Management"
            apiEndpoint="/api/user"
            onAdd={handleAddUser}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            pagination={true}
          />
        </div>
      </main>
    </div>
  );
};

export default Users;
