import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { useState } from "react";
import { toast } from "sonner";
import { useDetailView } from "@/hooks/use-detail-view";
import { UserProfile } from "@/components/users/UserProfile";
import { ActionsMenu, ActionType } from "@/components/common/ActionsMenu";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, X, Eye, Search } from "lucide-react";

interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  locked: boolean;
}

const Users = () => {
  // Mock data with state management
  const [users, setUsers] = useState([
    {
      id: 1,
      username: "Alice Smith",
      email: "alice@example.com",
      roles: ["Admin"],
      locked: false,
    },
    {
      id: 2,
      username: "Bob Johnson",
      email: "bob@example.com",
      roles: ["User"],
      locked: false,
    },
    {
      id: 3,
      username: "Carol Davis",
      email: "carol@example.com",
      roles: ["Editor"],
      locked: true,
    },
    {
      id: 4,
      username: "Dave Wilson",
      email: "dave@example.com",
      roles: ["User"],
      locked: false,
    },
  ]);

  const [filter, setFilter] = useState({
    locked: "",
    role: "",
    search: "",
  });

  // Detail view hook for user profile
  const {
    selectedItem: selectedUser,
    isModalOpen: isProfileOpen,
    openDetail: openUserProfile,
    closeModal: closeUserProfile,
  } = useDetailView<User>({
    modalThreshold: 15,
    detailRoute: "/users",
  });

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

  const handleViewUser = (user: User) => {
    openUserProfile(user);
  };

  const filteredUsers = users.filter((user) => {
    return (
      (filter.locked === "" ||
        user.locked === (filter.locked as unknown as boolean)) &&
      (filter.role === "" || user.roles.includes(filter.role)) &&
      (filter.search === "" ||
        user.username.toLowerCase().includes(filter.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filter.search.toLowerCase()))
    );
  });

  const getActionItems = (user: User) => {
    const actions: {
      type: ActionType;
      label: string;
      onClick: () => void;
      disabled?: boolean;
    }[] = [
      {
        type: "view",
        label: "View Profile",
        onClick: () => handleViewUser(user),
      },
      {
        type: "edit",
        label: "Edit User",
        onClick: () => handleEditUser(user),
      },
      {
        type: "delete",
        label: "Delete User",
        onClick: () => handleDeleteUser(user.id),
        disabled: user.roles.includes("Admin"),
      },
    ];
    return actions;
  };

  const columns = [
    {
      header: "#",
      accessorKey: "id",
      cell: (item: User) => (
        <span className="text-muted-foreground">{item.id}</span>
      ),
      sortable: true,
    },
    {
      header: "Name",
      accessorKey: "username" as const,
      sortable: true,
      filterable: true,
    },
    {
      header: "Email",
      accessorKey: "email" as const,
      sortable: true,
      filterable: true,
    },
    {
      header: "Role",
      accessorKey: "roles" as const,
      sortable: true,
      filterable: true,
      cell: (user: User) => user.roles.join(", "),
    },
    {
      header: "Status",
      accessorKey: "locked" as const,
      sortable: true,
      filterable: true,
      cell: (user: User) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.locked === true
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {user.locked ? "Locked" : "Active"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions" as const,
      cell: (user: User) => <ActionsMenu actions={getActionItems(user)} />,
    },
  ];

  const resetFilters = () => {
    setFilter({
      locked: "",
      role: "",
      search: "",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Breadcrumbs />

        <PageHeader
          title="Users"
          description="Manage your application users"
          showAddButton={false}
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={filter.search}
                onChange={(e) =>
                  setFilter({ ...filter, search: e.target.value })
                }
                className="pl-8 w-[200px] md:w-[300px]"
              />
              {filter.search && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1.5 h-6 w-6 p-0"
                  onClick={() => setFilter({ ...filter, search: "" })}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Select
              value={filter.locked || "all"}
              onValueChange={(value) =>
                setFilter({ ...filter, locked: value === "all" ? "" : value })
              }
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filter.role || "all"}
              onValueChange={(value) =>
                setFilter({ ...filter, role: value === "all" ? "" : value })
              }
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Editor">Editor</SelectItem>
              </SelectContent>
            </Select>

            {(filter.locked || filter.role || filter.search) && (
              <Button variant="ghost" onClick={resetFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </PageHeader>

        <div className="mt-6">
          <DataTable
            data={filteredUsers}
            columns={columns}
            title="User Management"
            apiEndpoint="/api/user"
            onAdd={handleAddUser}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            pagination={true}
          />
        </div>

        {selectedUser && (
          <UserProfile
            userId={selectedUser.id}
            isOpen={isProfileOpen}
            onClose={closeUserProfile}
          />
        )}
      </main>
    </div>
  );
};

export default Users;
