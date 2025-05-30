
import { Sidebar } from "@/components/layout/sidebar/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useDetailView } from "@/hooks/use-detail-view";
import { UserProfile } from "@/components/user/UserProfile";
import { ActionsMenu, ActionType } from "@/components/common/ActionsMenu";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import useApiQuery from "@/hooks/use-api-query";
import useDebounce from "@/hooks/use-debounce";
import DataFilters from "@/components/common/DataFilters";
import { CreateUserDialog } from "@/components/user/CreateUserDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Role, User } from "@/types/Auth";
import UserService from "@/services/UserService";
import { FilterOption } from "@/types/Common";

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
        },
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
        },
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
        },
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
        },
      ],
      locked: false,
    },
  ];
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  // Filter options for the data filters component - Add searchable-select for roles
  const filterOptions: FilterOption<Role>[] = [
    {
      id: "search",
      label: "Search",
      type: "search",
      placeholder: "Search users...",
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
      id: "roleIds",
      label: "Roles",
      type: "searchable-select",
      endpoint: "/api/role",
      queryKey: ["roles-filter"],
      transformData: (data) =>
        data.map((role: Role) => ({
          value: role.code || role.id?.toString() || "",
          label: role.name || "Unnamed",
          original: role,
        })),
    },
  ];

  // Trigger data refresh function
  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

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
  } = useApiQuery<User>({
    endpoint: "/api/user",
    queryKey: ["users", debouncedSearchTerm, refreshTrigger],
    initialPage: 0,
    initialPageSize: 10,
    persistFilters: true,
    onError: (err) => {
      console.error("Failed to fetch users:", err);
      toast.error("Failed to load users, using cached data", {
        description: "Could not connect to the server. Please try again later.",
      });
    },
    debounceMs: 300,
    mockData: {
      content: mockUsers,
      totalElements: mockUsers.length,
      totalPages: 1,
      number: 0,
      size: 10,
    },
  });

  // Force refresh when page changes
  useEffect(() => {
    refresh();
  }, [page, refresh]);

  const handleAddUser = async (newUser: Omit<User, "id">) => {
    try {
      await UserService.createUser(newUser);
      toast.success("User added successfully");
      setIsCreateDialogOpen(false);
      triggerRefresh(); // Refresh the user list after adding a new user
    } catch (error) {
      console.error("Failed to add user:", error);
      toast.error("Failed to add user", {
        description: "There was an error adding the user. Please try again.",
      });
    }
  };

  const handleDeleteUser = async (id: number | string) => {
    try {
      await UserService.deleteUser(id);
      toast.success("User deleted successfully");
      triggerRefresh(); // Refresh the user list after deleting a user
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user", {
        description: "There was an error deleting the user. Please try again.",
      });
    }
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
        type: "delete",
        label: "Delete User",
        onClick: () => handleDeleteUser(user.id),
        disabled: Array.isArray(user.roles) && user.roles.some((role) => 
          typeof role === 'string' ? role === "SUPER_ADMIN" : role.name === "SUPER_ADMIN"
        ),
      },
    ];
    return actions;
  };

  // Helper function to get roles display for the table
  const getRolesDisplay = (roles: Role[] | string[]) => {
    if (!roles || roles.length === 0) return [];
    
    if (typeof roles[0] === 'string') {
      return (roles as string[]).map((roleName, index) => ({
        id: index,
        name: roleName,
        description: `Role: ${roleName}`,
      }));
    }
    
    return roles as Role[];
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
      cell: (user: User) => {
        const displayRoles = getRolesDisplay(user.roles);
        return (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="px-2 py-0.5 rounded-full border bg-muted/40 text-xs font-semibold hover:bg-muted/70 cursor-pointer"
                title={
                  displayRoles && displayRoles.length > 0
                    ? `${displayRoles.length} roles`
                    : "No roles"
                }
                style={{ minWidth: 32 }}
              >
                {displayRoles?.length || 0} roles
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={6}
              className="w-56 p-2 max-h-[250px] overflow-y-auto"
            >
              <div className="font-semibold text-sm mb-2">Roles</div>
              {displayRoles && displayRoles.length > 0 ? (
                <ul className="space-y-1">
                  {displayRoles.map((role) => (
                    <li
                      key={role.id || `role-${Math.random()}`}
                      className="border rounded px-2 py-1 bg-muted/40"
                    >
                      <div className="font-semibold text-xs">
                        {role.name || "Unnamed Role"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {role.description || "No description"}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-muted-foreground">
                  No roles assigned
                </div>
              )}
            </PopoverContent>
          </Popover>
        );
      },
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
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
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
    <div className="flex-1 overflow-y-auto p-8">
      <Breadcrumbs />

      <PageHeader
        title="Users"
        description="Manage your application users"
        showAddButton={false}
      />

      <DataFilters
        filters={filters}
        setFilters={setFilters}
        resetFilters={resetFilters}
        options={filterOptions}
        onChange={(newFilters) => {
          setFilters(newFilters);
        }}
        onReset={() => {
          resetFilters();
          refresh();
        }}
        className="mb-4"
      />

      <div className="mb-4">
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
    </div>
  );
};

export default Users;
