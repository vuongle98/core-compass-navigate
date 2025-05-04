
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { ActionsMenu, ActionType } from "@/components/common/ActionsMenu";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { DataTable } from "@/components/ui/DataTable";
import { DataFilters, FilterOption } from "@/components/common/DataFilters";
import { DetailViewModal } from "@/components/ui/detail-view-modal";
import LoggingService from "@/services/LoggingService";
import useApiQuery from "@/hooks/use-api-query";
import useDebounce from "@/hooks/use-debounce";
import { useDetailView } from "@/hooks/use-detail-view";

// Define User interface compatible with the data structure
interface User {
  id: number;
  username: string;
  email?: string;
  name: string;
  role: string;
  roles?: Array<{ id: number; name: string; description: string }>;
}

interface Token {
  id: number;
  token: string;
  issuedAt: string;
  expireAt: string;
  blacklisted: boolean;
  user: User;
}

const Tokens = () => {
  // Mock data
  const [tokens, setTokens] = useState<Token[]>([
    {
      id: 1,
      token: "Mobile API Token",
      issuedAt: "2023-07-10",
      expireAt: "2023-07-10",
      blacklisted: false,
      user: {
        id: 1,
        username: "johndoe",
        name: "John Doe",
        role: "admin",
        roles: [{ id: 1, name: "admin", description: "Administrator" }],
      },
    },
    {
      id: 2,
      token: "Web Integration",
      issuedAt: "2023-04-09",
      expireAt: "2023-05-15",
      blacklisted: true,
      user: {
        id: 1,
        username: "johndoe",
        email: "",
        name: "John Doe",
        role: "admin",
        roles: [{ id: 1, name: "admin", description: "Administrator" }],
      },
    },
    {
      id: 3,
      token: "Analytics Service",
      issuedAt: "2023-04-01",
      expireAt: "2023-04-05",
      blacklisted: false,
      user: {
        id: 1,
        username: "johndoe",
        email: "",
        name: "John Doe",
        role: "admin",
        roles: [{ id: 1, name: "admin", description: "Administrator" }],
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
        description: "Failed to load tokens, using cached data. Could not connect to the server. Please try again later.",
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
  const filterOptions: FilterOption[] = [
    {
      id: "search",
      label: "Search",
      type: "search",
      placeholder: "Search tokens...",
    },
    {
      id: "blacklisted",
      label: "Black listed status",
      type: "select",
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Expired" },
      ],
    },
    {
      id: "type",
      label: "Token Type",
      type: "select",
      options: [
        { value: "ACCESS", label: "Access" },
        { value: "REFRESH", label: "Refresh" }
      ],
    },
    {
      id: "user",
      label: "User",
      type: "select",
      options: [
        { value: "admin", label: "John Doe" },
        { value: "janedoe", label: "Jane Doe" },
      ],
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
            token.blacklisted
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {token.blacklisted ? "Inactive" : "Active"}
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
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Breadcrumbs />

        <PageHeader
          title="API Tokens"
          description="Manage API access tokens"
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
                      selectedToken.blacklisted
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedToken.blacklisted ? "Inactive" : "Active"}
                  </span>
                </p>
              </div>
            </div>
          </DetailViewModal>
        )}
      </main>
    </div>
  );
};

export default Tokens;
