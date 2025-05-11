import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { toast } from "@/components/ui/use-toast";
import { ActionsMenu, ActionType } from "@/components/common/ActionsMenu";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { DataTable } from "@/components/ui/DataTable";
import DataFilters from "@/components/common/DataFilters";
import { DetailViewModal } from "@/components/ui/detail-view-modal";
import useApiQuery from "@/hooks/use-api-query";
import useDebounce from "@/hooks/use-debounce";
import { useDetailView } from "@/hooks/use-detail-view";
import { Token } from "@/types/Token";
import { FilterOption } from "@/types/Common";
import { User } from "@/types/Auth";

const Tokens = () => {
  // Mock data
  const [tokens, setTokens] = useState<Token[]>([
    {
      id: 1,
      token: "Mobile API Token",
      issuedAt: "2023-07-10",
      expireAt: "2023-07-10",
      isBlacklisted: false,
      user: {
        id: 1,
        username: "johndoe",
        roles: [
          { id: 1, name: "admin", code: "ADMIN", description: "Administrator" },
        ],
        profile: {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          phone: "1234567890",
          address: "123 Main St",
          avatarUrl: "https://example.com/avatar.jpg",
        },
      },
    },
    {
      id: 2,
      token: "Web Integration",
      issuedAt: "2023-04-09",
      expireAt: "2023-05-15",
      isBlacklisted: true,
      user: {
        id: 1,
        username: "johndoe",
        email: "",
        roles: [
          { id: 1, name: "admin", code: "ADMIN", description: "Administrator" },
        ],
        profile: {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          phone: "1234567890",
          address: "123 Main St",
          avatarUrl: "https://example.com/avatar.jpg",
        },
      },
    },
    {
      id: 3,
      token: "Analytics Service",
      issuedAt: "2023-04-01",
      expireAt: "2023-04-05",
      isBlacklisted: false,
      user: {
        id: 1,
        username: "johndoe",
        email: "",
        roles: [
          { id: 1, name: "admin", code: "ADMIN", description: "Administrator" },
        ],
        profile: {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          phone: "1234567890",
          address: "123 Main St",
          avatarUrl: "https://example.com/avatar.jpg",
        },
      },
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  // Debounce the search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Setup for detail view modal
  const {
    selectedItem: selectedToken,
    isModalOpen: isDetailOpen,
    openDetail: openTokenDetail,
    closeModal: closeTokenDetail,
  } = useDetailView<Token>({
    modalThreshold: 10,
  });

  const {
    data: tokensData,
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
  } = useApiQuery<Token>({
    endpoint: "/api/token",
    queryKey: ["tokens", debouncedSearchTerm],
    initialPage: 0,
    initialPageSize: 10,
    persistFilters: true,
    onError: (err) => {
      console.error("Failed to fetch tokens:", err);
      toast({
        title: "Error",
        description:
          "Failed to load tokens, using cached data. Could not connect to the server. Please try again later.",
        variant: "destructive",
      });
    },
    mockData: {
      content: tokens,
      totalElements: tokens.length,
      totalPages: 1,
      number: 0,
      size: 10,
    },
  });

  // Filter options
  const filterOptions: FilterOption<User>[] = [
    {
      id: "search",
      label: "Search",
      type: "search",
      placeholder: "Search tokens...",
    },
    {
      id: "isBlacklisted",
      label: "Black listed status",
      type: "select",
      options: [
        { value: "false", label: "Active" },
        { value: "true", label: "Expired" },
      ],
    },
    {
      id: "type",
      label: "Token Type",
      type: "select",
      options: [
        { value: "ACCESS", label: "Access" },
        { value: "REFRESH", label: "Refresh" },
      ],
    },
    {
      id: "userIds",
      label: "User",
      type: "searchable-select",
      endpoint: "/api/user",
      queryKey: ["users-filter"],
      transformData: (data) =>
        data.map((user: User) => ({
          value: user.id?.toString() || "",
          label: user.username || "Unnamed",
          original: user,
        })),
    },
  ];

  // Actions for tokens
  const getActionItems = (token: Token) => {
    return [
      {
        type: "view" as ActionType,
        label: "View Token",
        onClick: () => openTokenDetail(token),
      },
      {
        type: "edit" as ActionType,
        label: "Regenerate Token",
        onClick: () => handleRegenerateToken(token.id),
      },
      {
        type: "delete" as ActionType,
        label: "Revoke Token",
        onClick: () => handleRevokeToken(token.id),
      },
    ];
  };

  // Handle token operations
  const handleRegenerateToken = (id: number) => {
    // Regenerate token logic would go here
    toast({
      title: "Success",
      description: "Token regenerated successfully",
    });
  };

  const handleRevokeToken = (id: number) => {
    setTokens(tokens.filter((token) => token.id !== id));
    toast({
      title: "Success",
      description: "Token revoked successfully",
    });
  };

  const columns = [
    {
      header: "#",
      accessorKey: "id",
      cell: (item: Token) => (
        <span className="text-muted-foreground">{item.id}</span>
      ),
      sortable: true,
    },
    {
      header: "Token",
      accessorKey: "token",
      sortable: true,
      cell: (item: Token) => (
        <span className="text-muted-foreground">
          {item?.token?.slice(0, 30)}...
        </span>
      ),
    },
    { header: "Issued at", accessorKey: "issuedAt", sortable: true },
    { header: "Expire at", accessorKey: "expireAt", sortable: true },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (token: Token) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            token.isBlacklisted
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {token.isBlacklisted ? "Inactive" : "Active"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (token: Token) => <ActionsMenu actions={getActionItems(token)} />,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <Breadcrumbs />

      <PageHeader
        title="API Tokens"
        description="Manage API access tokens"
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
        className="mt-4"
      />

      <div className="mt-4">
        <DataTable
          data={tokensData}
          columns={columns}
          title="Token Management"
          pagination={true}
          showAddButton={false}
          isLoading={isLoading}
          pageIndex={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          totalItems={totalItems}
        />
      </div>

      {/* Token Detail Modal */}
      {selectedToken && (
        <DetailViewModal
          isOpen={isDetailOpen}
          onClose={closeTokenDetail}
          title="Token Details"
          size="md"
          showCloseButton={false}
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Token</h3>
              <p className="mt-1">{selectedToken.token}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Issued at</h3>
              <p className="mt-1">{selectedToken.issuedAt}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Expire at</h3>
              <p className="mt-1">{selectedToken.expireAt}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Status</h3>
              <p className="mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedToken.isBlacklisted
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedToken.isBlacklisted ? "Inactive" : "Active"}
                </span>
              </p>
            </div>
          </div>
        </DetailViewModal>
      )}
    </div>
  );
};

export default Tokens;
