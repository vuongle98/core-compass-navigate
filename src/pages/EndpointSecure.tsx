import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { DataFilters, FilterOption } from "@/components/common/DataFilters";
import { ActionsMenu, ActionType } from "@/components/common/ActionsMenu";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { toast } from "sonner";
import { useDetailView } from "@/hooks/use-detail-view";
import { DetailViewModal } from "@/components/ui/detail-view-modal";
import useApiQuery from "@/hooks/use-api-query";
import useDebounce from "@/hooks/use-debounce";

interface EndpointSecure {
  id: number;
  endpointPattern: string;
  method: string;
  authority: string;
  isRole: boolean;
}

const EndpointSecures = () => {
  // Mock data
  const [endpointSecures, setEndpointSecures] = useState([
    {
      id: 1,
      endpointPattern: "/api/v1/users",
      method: "GET",
      authority: "ROLE_USER",
      isRole: true,
    },
    {
      id: 2,
      endpointPattern: "/api/v1/admin",
      method: "POST",
      authority: "ROLE_ADMIN",
      isRole: false,
    },
    {
      id: 3,
      endpointPattern: "/api/v1/products",
      method: "PUT",
      authority: "ROLE_USER, ROLE_ADMIN",
      isRole: true,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  // Debounce the search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Setup for detail view modal
  const {
    selectedItem: selectedEndpoint,
    isModalOpen: isDetailOpen,
    openDetail: openEndpointDetail,
    closeModal: closeEndpointDetail,
  } = useDetailView<EndpointSecure>({
    modalThreshold: 15
  });

  const {
    data: endpointSecuresData,
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
  } = useApiQuery<EndpointSecure>({
    endpoint: "/api/endpointSecure",
    queryKey: ["endpointSecures", debouncedSearchTerm],
    initialPage: 0,
    initialPageSize: 10,
    persistFilters: true,
    onError: (err) => {
      console.error("Failed to fetch endpoint secure:", err);
      toast.error("Failed to load endpoint secure, using cached data", {
        description: "Could not connect to the server. Please try again later.",
      });
    },
    mockData: {
      content: endpointSecures,
      totalElements: endpointSecures.length,
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
      placeholder: "Search endpoints...",
    },
    {
      id: "isRole",
      label: "Is Role",
      type: "select",
      options: [
        { value: "true", label: "Use role" },
        { value: "false", label: "Not use role" },
      ],
    },
    {
      id: "method",
      label: "Method",
      type: "select",
      options: [
        { value: "GET", label: "GET" },
        { value: "POST", label: "POST" },
        { value: "PUT", label: "PUT" },
        { value: "DELETE", label: "DELETE" },
      ],
    },
    {
      id: "module",
      label: "Module",
      type: "select",
      options: [
        { value: "USER", label: "User" },
        { value: "ADMIN", label: "Admin" },
        { value: "product", label: "Product" },
      ],
    },
  ];

  // Actions for endpoints
  const getActionItems = (endpoint: EndpointSecure) => {
    return [
      {
        type: "view" as ActionType,
        label: "View Endpoint",
        onClick: () => openEndpointDetail(endpoint),
      },
      {
        type: "edit" as ActionType,
        label: "Edit Endpoint",
        onClick: () => handleEditEndpoint(endpoint.id),
      },
      {
        type: "delete" as ActionType,
        label: "Delete Endpoint",
        onClick: () => handleDeleteEndpoint(endpoint.id),
      },
    ];
  };

  // Handle endpoint operations
  const handleEditEndpoint = (id: number) => {
    // Regenerate endpoint logic would go here
    toast.success("Endpoint regenerated successfully");
  };

  const handleDeleteEndpoint = (id: number) => {
    toast.success("Endpoint revoked successfully");
  };

  const columns = [
    {
      header: "#",
      accessorKey: "id",
      cell: (item: EndpointSecure) => (
        <span className="text-muted-foreground">{item.id}</span>
      ),
      sortable: true,
    },
    {
      header: "Endpoint",
      accessorKey: "endpointPattern",
      sortable: true,
      cell: (item: EndpointSecure) => (
        <span className="text-muted-foreground">
          {item?.endpointPattern?.slice(0, 30)}...
        </span>
      ),
    },
    { header: "Method", accessorKey: "method", sortable: true },
    { header: "Authority", accessorKey: "authority", sortable: true },
    {
      header: "Is role",
      accessorKey: "isRole",
      sortable: true,
      cell: (endpoint: EndpointSecure) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            endpoint.isRole
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {endpoint.isRole ? "Use role" : "Not use role"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (endpoint: EndpointSecure) => (
        <ActionsMenu actions={getActionItems(endpoint)} />
      ),
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Breadcrumbs />

        <PageHeader
          title="Endpoint Management"
          description="Manage access endpoints"
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
            data={endpointSecuresData}
            columns={columns}
            title="Endpoint Management"
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

        {/* Endpoint Detail Modal */}
        {selectedEndpoint && (
          <DetailViewModal
            isOpen={isDetailOpen}
            onClose={closeEndpointDetail}
            title="Endpoint Details"
            size="md"
            showCloseButton={false}
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Endpoint</h3>
                <p className="mt-1">{selectedEndpoint.endpointPattern}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Method</h3>
                <p className="mt-1">{selectedEndpoint.method}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Authority</h3>
                <p className="mt-1">{selectedEndpoint.authority}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Is role</h3>
                <p className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedEndpoint.isRole
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedEndpoint.isRole ? "Is role" : "Not use role"}
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

export default EndpointSecures;
