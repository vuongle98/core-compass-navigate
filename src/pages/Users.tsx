import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { useState } from "react";
import { toast } from "sonner";
import { useDetailView } from "@/hooks/use-detail-view";
import { UserProfile } from "@/components/users/UserProfile";
import { ActionsMenu, ActionType } from "@/components/common/ActionsMenu";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import useApiQuery from "@/hooks/use-api-query";
import useDebounce from "@/hooks/use-debounce";
import { DataFilters, FilterOption } from "@/components/common/DataFilters";
import { CreateUserDialog } from "@/components/users/CreateUserDialog";
import EnhancedApiService from "@/services/EnhancedApiService";
import { Role } from "./Roles";
import { Permission } from "@/components/permission/PermissionSelect";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface UserProfile {
  id: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  roles: Role[];
  permissions?: Permission[];
  locked?: boolean;
  profile?: UserProfile;
  lastLogin?: string;
  createdAt?: string;
}

const Users = () => {
  // Mock data with state management
  const mockUsers = [
    {
      id: 1,
      username: "Alice Smith",
      email: "alice@example.com",
      roles: [
        {
          id: 1,
          code: "ADMIN",
          name: "Admin",
          description: "Full system access",
          userCount: 5,
        }
      ],
      locked: false,
    },
    {
      id: 2,
      username: "Bob Johnson",
      email: "bob@example.com",
      roles: [
        {
          id: 2,
          code: "MANAGE",
          name: "Manager",
          description: "Department management",
          userCount: 8,
        }
      ],
      locked: false,
    },
    {
      id: 3,
      username: "Carol Davis",
      email: "carol@example.com",
      roles: [
        {
          id: 3,
          code: "VIEWER",
          name: "Viewer",
          description: "Read-only access",
          userCount: 45,
        }
      ],
      locked: true,
    },
    {
      id: 4,
      username: "Dave Wilson",
      email: "dave@example.com",
      roles: [
        {
          id: 4,
          code: "USER",
          name: "User",
          description: "Regular user access",
          userCount: 8,
        }
      ],
      locked: false,
    },
  ];
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Debounce the search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Detail view hook for user profile
  const {
    selectedItem: selectedUser,
    isModalOpen: isProfileOpen,
    openDetail: openUserProfile,
    closeModal: closeUserProfile,
  } = useDetailView<UserInfo>({
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
      id: "blocked",
      label: "User Active",
      type: "select",
      options: [
        { value: "false", label: "Active" },
        { value: "true", label: "Inactive" },
      ],
    },
    {
      id: "roles",
      label: "Roles",
      type: "select",
      options: [
        { value: "ADMIN", label: "ADMIN" },
        { value: "MANAGE", label: "MANAGE" },
        { value: "USER", label: "USER" },
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
    refresh,
    error,
  } = useApiQuery<UserInfo>({
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

  const handleAddUser = async (newUser: Omit<UserInfo, "id">) => {
    try {
      await EnhancedApiService.post("/api/user", newUser);
      toast.success("User added successfully");
      setIsCreateDialogOpen(false);
      refresh(); // Refresh the user list after adding a new user
    } catch (error) {
      console.error("Failed to add user:", error);
      toast.error("Failed to add user", {
        description: "There was an error adding the user. Please try again.",
      });
    }
  };

  const handleDeleteUser = async (id: number | string) => {
    try {
      await EnhancedApiService.delete(`/api/user/${id}`);
      toast.success("User deleted successfully");
      refresh(); // Refresh the user list after deleting a user
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user", {
        description: "There was an error deleting the user. Please try again.",
      });
    }
  };

  const handleViewUser = (user: UserInfo) => {
    openUserProfile(user);
  };

  const getActionItems = (user: UserInfo) => {
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
          type: "delete",
          label: "Delete User",
          onClick: () => handleDeleteUser(user.id),
          disabled: user.roles.some(role => role.name === "SUPER_ADMIN"),
        },
      ];
    return actions;
  };

  const columns = [
    {
      header: "#",
      accessorKey: "id",
      cell: (item: UserInfo) => (
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
      cell: (user: UserInfo) => {
        return (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="px-2 py-0.5 rounded-full border bg-muted/40 text-xs font-semibold text-gray-200 hover:bg-muted/70 cursor-pointer"
                title={user.roles && user.roles.length > 0 ? `${user.roles.length} roles` : "No roles"}
                style={{ minWidth: 32 }}
              >
                {user.roles?.length || 0} roles
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={6} className="w-56 p-2">
              <div className="font-semibold text-sm mb-2">Roles</div>
              {user.roles && user.roles.length > 0 ? (
                <ul className="space-y-1">
                  {user.roles.map((role) => (
                    <li key={role.id} className="border rounded px-2 py-1 bg-muted/40">
                      <div className="font-semibold text-xs">{role.name}</div>
                      <div className="text-xs text-muted-foreground">{role.description}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-muted-foreground">No roles assigned</div>
              )}
            </PopoverContent>
          </Popover>
        )
      },
    },
    {
      header: "Status",
      accessorKey: "locked" as const,
      sortable: true,
      filterable: true,
      cell: (user: UserInfo) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.locked === true
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
      cell: (user: UserInfo) => <ActionsMenu actions={getActionItems(user)} />,
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
              refresh();
            }}
            className="mt-2"
          />
        </PageHeader>

        <div className="mt-4">
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
            showAddButton={true}
            onAddClick={() => setIsCreateDialogOpen(true)}
          />
        </div>

        {selectedUser && (
          <UserProfile
            userId={selectedUser.id}
            isOpen={isProfileOpen}
            onClose={closeUserProfile}
          />
        )}

        <CreateUserDialog
          isOpen={isCreateDialogOpen}
          onClose={() => {
            setIsCreateDialogOpen(false);
          }}
          onCreate={handleAddUser}
        />
      </main>
    </div>
  );
};

export default Users;
