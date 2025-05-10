
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import {
  Download, SlidersHorizontal
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import useApiQuery from "@/hooks/use-api-query";
import useDebounce from "@/hooks/use-debounce";
import { DataFilters } from "@/components/common/DataFilters";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { AuditLog as AuditLogType } from "@/types/AuditLog";
import { FilterOption } from "@/types/Common";

const AuditLog = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogType[]>([
    {
      id: 1,
      timestamp: "2024-04-15 10:00:00",
      user: {
        id: 1,
        username: "admin",
        roles: [{ id: 1, name: "admin", code: "ADMIN" }],
      },
      action: "User Login",
      resource: "Authentication",
      details: "Successful login",
    },
    {
      id: 2,
      timestamp: "2024-04-15 10:05:00",
      user: {
        id: 1,
        username: "admin",
        roles: [{ id: 1, name: "admin", code: "ADMIN" }],
      },
      action: "Database Backup",
      resource: "System",
      details: "Scheduled backup completed",
    },
    {
      id: 3,
      timestamp: "2024-04-15 10:10:00",
      user: {
        id: 1,
        username: "admin",
        roles: [{ id: 1, name: "admin", code: "ADMIN" }],
      },
      action: "File Download",
      resource: "Files",
      details: "Downloaded report.pdf",
    },
    {
      id: 4,
      timestamp: "2024-04-15 10:15:00",
      user: {
        id: 1,
        username: "admin",
        roles: [{ id: 1, name: "admin", code: "ADMIN" }],
      },
      action: "User Creation",
      resource: "Users",
      details: "Created new user john.doe",
    },
    {
      id: 5,
      timestamp: "2024-04-15 10:20:00",
      user: {
        id: 1,
        username: "admin",
        roles: [{ id: 1, name: "admin", code: "ADMIN" }],
      },
      action: "Security Scan",
      resource: "Security",
      details: "Detected potential vulnerability",
    },
  ]);

  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [searchTerm, setSearchTerm] = useState("");

  // Debounce the search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const handleSelectItem = (id: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems((prev) => [...prev, id]);
    } else {
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems(auditLogsData.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const filterOptions: FilterOption<AuditLogType>[] = [
    {
      id: "search",
      label: "Search",
      type: "search",
      placeholder: "Search logs...",
    },
    {
      id: "user",
      label: "User",
      type: "select",
      options: [
        { value: "admin", label: "Admin" },
        { value: "system", label: "System" },
        { value: "user123", label: "User123" },
      ],
    },
    {
      id: "action",
      label: "Action",
      type: "select",
      options: [
        { value: "User Login", label: "User Login" },
        { value: "Database Backup", label: "Database Backup" },
        { value: "File Download", label: "File Download" },
        { value: "User Creation", label: "User Creation" },
        { value: "Security Scan", label: "Security Scan" },
      ],
    },
  ];

  const {
    data: auditLogsData,
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
  } = useApiQuery<AuditLogType>({
    endpoint: "/api/auditlog",
    queryKey: ["auditlogs", debouncedSearchTerm],
    initialPage: 0,
    initialPageSize: 10,
    persistFilters: true,
    onError: (err) => {
      console.error("Failed to fetch audit logs:", err);
      toast.error("Failed to load audit logs, using cached data", {
        description: "Could not connect to the server. Please try again later.",
      });
    },
    mockData: {
      content: auditLogs,
      totalElements: auditLogs.length,
      totalPages: 1,
      number: 0,
      size: 10,
    },
  });

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) {
      toast.error("No items selected");
      return;
    }

    setAuditLogs((prev) =>
      prev.filter((item) => !selectedItems.includes(item.id))
    );

    toast.success(`${selectedItems.length} audit logs deleted`);
    setSelectedItems([]);
  };

  const handleExportData = (format: "csv" | "excel") => {
    // Mock implementation
    toast.success(`Audit logs exported as ${format.toUpperCase()}`);
  };

  const columns = [
    {
      header: "#",
      accessorKey: "id",
      cell: (info: { row: { original: AuditLogType } }) => (
        <span className="text-muted-foreground">{info.row.original.id}</span>
      ),
    },
    {
      header: "Timestamp",
      accessorKey: "timestamp",
    },
    {
      header: "User",
      accessorKey: "user",
      cell: (info: { row: { original: AuditLogType } }) => (
        <span>{info.row.original.user?.username || "Unknown"}</span>
      ),
    },
    {
      header: "Action",
      accessorKey: "action",
    },
    {
      header: "Resource",
      accessorKey: "resource",
    },
    {
      header: "Details",
      accessorKey: "details",
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Breadcrumbs />
        <PageHeader
          title="Audit Log"
          description="Monitor system activities and user actions"
          actions={
            <div className="flex space-x-2">
              {selectedItems.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                  Delete ({selectedItems.length})
                </Button>
              )}
              <Button variant="outline" onClick={() => handleExportData("csv")}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button onClick={() => setIsFiltersModalOpen(true)}>
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          }
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
            data={auditLogsData}
            columns={columns}
            title="Audit Log"
            pagination={true}
            isLoading={isLoading}
            pageIndex={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            totalItems={totalItems}
            showAddButton={false}
          />
        </div>

        {/* Filters Modal */}
        <Dialog open={isFiltersModalOpen} onOpenChange={setIsFiltersModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filters</DialogTitle>
              <DialogDescription>
                Adjust the filters to refine the audit log data.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Add filter components here */}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsFiltersModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setIsFiltersModalOpen(false)}>
                Apply
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AuditLog;
