
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { DataFilters, FilterOption } from "@/components/common/DataFilters";
import { ActionsMenu } from "@/components/common/ActionsMenu";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { toast } from "sonner";
import { useDetailView } from "@/hooks/use-detail-view";
import { DetailViewModal } from "@/components/ui/detail-view-modal";

interface Token {
  id: number;
  name: string;
  lastUsed: string;
  expires: string;
  status: string;
}

const Tokens = () => {
  // Mock data
  const [tokens, setTokens] = useState([
    {
      id: 1,
      name: "Mobile API Token",
      lastUsed: "2023-04-10",
      expires: "2023-07-10",
      status: "Active",
    },
    {
      id: 2,
      name: "Web Integration",
      lastUsed: "2023-04-09",
      expires: "2023-05-15",
      status: "Active",
    },
    {
      id: 3,
      name: "Analytics Service",
      lastUsed: "2023-04-01",
      expires: "2023-04-05",
      status: "Expired",
    },
  ]);

  const [filter, setFilter] = useState({
    status: "",
    search: "",
  });

  // Setup for detail view modal
  const {
    selectedItem: selectedToken,
    isModalOpen: isDetailOpen,
    openDetail: openTokenDetail,
    closeModal: closeTokenDetail,
  } = useDetailView<Token>({
    modalThreshold: 10,
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
      id: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "Active", label: "Active" },
        { value: "Expired", label: "Expired" },
      ],
    },
  ];

  // Actions for tokens
  const getActionItems = (token: Token) => {
    return [
      {
        type: "view",
        label: "View Token",
        onClick: () => openTokenDetail(token),
      },
      {
        type: "edit",
        label: "Regenerate Token",
        onClick: () => handleRegenerateToken(token.id),
      },
      {
        type: "delete",
        label: "Revoke Token",
        onClick: () => handleRevokeToken(token.id),
      },
    ];
  };

  // Handle token operations
  const handleRegenerateToken = (id: number) => {
    // Regenerate token logic would go here
    toast.success("Token regenerated successfully");
  };

  const handleRevokeToken = (id: number) => {
    setTokens(tokens.filter(token => token.id !== id));
    toast.success("Token revoked successfully");
  };

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilter(newFilters);
  };

  const resetFilters = () => {
    setFilter({ status: "", search: "" });
  };

  // Apply filters
  const filteredTokens = tokens.filter(token => {
    return (
      (filter.status === "" || token.status === filter.status) &&
      (filter.search === "" || 
        token.name.toLowerCase().includes(filter.search.toLowerCase()))
    );
  });

  const columns = [
    { header: "Token Name", accessorKey: "name", sortable: true },
    { header: "Last Used", accessorKey: "lastUsed", sortable: true },
    { header: "Expires", accessorKey: "expires", sortable: true },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (token: Token) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            token.status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {token.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (token: Token) => (
        <ActionsMenu actions={getActionItems(token)} />
      ),
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
          showAddButton={true}
        >
          <DataFilters
            filters={filter}
            options={filterOptions}
            onChange={handleFilterChange}
            onReset={resetFilters}
            className="mt-2"
          />
        </PageHeader>

        <div className="mt-6">
          <DataTable
            data={filteredTokens}
            columns={columns}
            title="Token Management"
            pagination={true}
            apiEndpoint="/api/token"
          />
        </div>

        {/* Token Detail Modal */}
        {selectedToken && (
          <DetailViewModal
            isOpen={isDetailOpen}
            onClose={closeTokenDetail}
            title="Token Details"
            size="md"
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Token Name</h3>
                <p className="mt-1">{selectedToken.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Last Used</h3>
                <p className="mt-1">{selectedToken.lastUsed}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Expires</h3>
                <p className="mt-1">{selectedToken.expires}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Status</h3>
                <p className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedToken.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedToken.status}
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
