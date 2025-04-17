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
import useApiQuery from "@/hooks/use-api-query";
import useDebounce from "@/hooks/use-debounce";
import { DataFilters, FilterOption } from "@/components/common/DataFilters";

interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  locked: boolean;
}

const Users = () => {
  // Mock data with state management
  const mockUsers = [
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
  ];
  const [searchTerm, setSearchTerm] = useState("");

  // Debounce the search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

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
  ];

  const {
    data: userData,
    isLoading,
    filters,
    setFilters,
    resetFilters,
    page,
    pageSize,
    setPage,
    setPageSize,
    totalItems,
    error,
  } = useApiQuery<User>({
    endpoint: "/api/user",
    queryKey: ["users", debouncedSearchTerm],
    initialPage: 0,
    initialPageSize: 10,
    persistFilters: true,
    onError: (err) => {
      console.error("Failed to fetch users:", err);
      toast.error("Failed to load users, using cached data", {
        description: "Could not connect to the server. Please try again later.",
      });
    },
    mockData: {
      content: mockUsers,
      totalElements: mockUsers.length,
      totalPages: 1,
      number: 0,
      size: 10,
    },
  });

  const handleAddUser = (newUser: Omit<(typeof mockUsers)[0], "id">) => {
    toast.success("User added successfully");
  };

  const handleEditUser = (updatedUser: (typeof mockUsers)[0]) => {
    toast.success("User updated successfully");
  };

  const handleDeleteUser = (id: number | string) => {
    toast.success("User deleted successfully");
  };

  const handleViewUser = (user: User) => {
    openUserProfile(user);
  };

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
            }}
            className="mt-2"
          />
        </PageHeader>

        <div className="mt-6">
          <DataTable
            data={userData}
            columns={columns}
            title="User Management"
            pagination={true}
            isLoading={isLoading}
            pageIndex={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            totalItems={totalItems}
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
