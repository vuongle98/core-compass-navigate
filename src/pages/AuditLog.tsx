import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { ActionsMenu } from "@/components/common/ActionsMenu";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataFilters, FilterOption } from "@/components/common/DataFilters";
import useApiQuery from "@/hooks/use-api-query";
import LoggingService from "@/services/LoggingService";
import { Skeleton } from "@/components/ui/skeleton";
import useDebounce from "@/hooks/use-debounce";
import { AuditLogItem } from "@/types/Logging";

// Mock data for audit logs
const mockLogs: AuditLogItem[] = [
  {
    id: 1,
    action: "User Created",
    user: "Admin",
    timestamp: "2023-04-10 14:32:45",
    details: "New user 'john@example.com' was created",
    ip: "192.168.1.100",
  },
  {
    id: 2,
    action: "Permission Modified",
    user: "Admin",
    timestamp: "2023-04-10 15:21:33",
    details: "Permission 'manage_users' was added to role 'Manager'",
    ip: "192.168.1.100",
  },
  {
    id: 3,
    action: "Config Changed",
    user: "System",
    timestamp: "2023-04-09 09:15:22",
    details: "System configuration 'backup_schedule' was updated",
    ip: "192.168.1.1",
  },
  {
    id: 4,
    action: "Login Failed",
    user: "Unknown",
    timestamp: "2023-04-09 10:45:18",
    details: "Failed login attempt for 'unknown@example.com'",
    ip: "203.0.113.42",
  },
  {
    id: 5,
    action: "Data Exported",
    user: "Manager",
    timestamp: "2023-04-08 16:12:05",
    details: "User data was exported to CSV",
    ip: "192.168.1.105",
  },
];

const AuditLog = () => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Debounce the search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Filter options for the data filters component
  const filterOptions: FilterOption[] = [
    {
      id: "search",
      label: "Search",
      type: "search",
      placeholder: "Search actions, users...",
    },
    {
      id: "action",
      label: "Action",
      type: "select",
      options: [
        { value: "User Created", label: "User Created" },
        { value: "Permission Modified", label: "Permission Modified" },
        { value: "Config Changed", label: "Config Changed" },
        { value: "Login Failed", label: "Login Failed" },
        { value: "Data Exported", label: "Data Exported" },
      ],
    },
    {
      id: "user",
      label: "User",
      type: "select",
      options: [
        { value: "Admin", label: "Admin" },
        { value: "System", label: "System" },
        { value: "Manager", label: "Manager" },
        { value: "Unknown", label: "Unknown" },
      ],
    },
  ];

  // Use our custom API query hook
  const {
    data: logs,
    isLoading,
    filters,
    setFilters,
    resetFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalItems,
    error,
  } = useApiQuery<AuditLogItem>({
    endpoint: "/api/audit-logs",
    queryKey: ["audit-logs", debouncedSearchTerm],
    initialPageSize: 10,
    persistFilters: true,
    mockData: {
      content: mockLogs,
      totalElements: mockLogs.length,
      totalPages: 1,
      number: 0,
      size: 10,
    },
    onError: (err) => {
      console.error("Failed to fetch audit logs:", err);
      toast.error("Failed to load audit logs, using cached data", {
        description: "Could not connect to the server. Please try again later.",
      });
    },
  });

  // Handle search input
  const handleSearchInput = (value: string) => {
    setSearchTerm(value);
    setFilters({ ...filters, search: value });
  };

  const viewDetails = (log: AuditLogItem) => {
    setSelectedLog(log);
    setDetailsOpen(true);

    // Log user action
    LoggingService.logUserAction(
      "audit_log",
      "view_details",
      `Viewed details for audit log ID ${log.id}`,
      { logId: log.id }
    );
  };

  const exportLog = (log: AuditLogItem) => {
    // In a real application, this would trigger a download
    const content = `ID: ${log.id}\nAction: ${log.action}\nUser: ${log.user}\nTimestamp: ${log.timestamp}\nDetails: ${log.details}\nIP: ${log.ip}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${log.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Log entry exported");

    // Log user action
    LoggingService.logUserAction(
      "audit_log",
      "export_log",
      `Exported log for audit log ID ${log.id}`,
      { logId: log.id }
    );
  };

  const columns: Column<AuditLogItem>[] = [
    {
      header: "#",
      accessorKey: "id",
      cell: (item: AuditLogItem) => (
        <span className="text-muted-foreground">{item.id}</span>
      ),
      sortable: true,
    },
    {
      header: "Action",
      accessorKey: "action",
      cell: (item: AuditLogItem) => (
        <span
          className={`px-2 py-1 rounded-md text-xs font-medium ${
            item.action.includes("Created")
              ? "bg-green-100 text-green-800"
              : item.action.includes("Modified")
              ? "bg-yellow-100 text-yellow-800"
              : item.action.includes("Failed")
              ? "bg-red-100 text-red-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {item.action}
        </span>
      ),
    },
    { header: "User", accessorKey: "user" },
    { header: "Timestamp", accessorKey: "timestamp" },
    {
      header: "Details",
      accessorKey: "details",
      cell: (item: AuditLogItem) => (
        <div className="max-w-[300px] truncate">{item.details}</div>
      ),
    },
    { header: "IP Address", accessorKey: "ip" },
    {
      header: "Actions",
      accessorKey: "actions" as keyof AuditLogItem,
      cell: (item: AuditLogItem) => (
        <ActionsMenu
          actions={[
            {
              type: "view",
              label: "View Details",
              onClick: () => viewDetails(item),
            },
            {
              type: "download",
              label: "Export",
              onClick: () => exportLog(item),
            },
            {
              type: "copy",
              label: "Copy ID",
              onClick: () => {
                navigator.clipboard.writeText(item.id.toString());
                toast.success("Log ID copied to clipboard");

                // Log user action
                LoggingService.logUserAction(
                  "audit_log",
                  "copy_id",
                  `Copied ID ${item.id} to clipboard`,
                  { logId: item.id }
                );
              },
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader
          title="Audit Log"
          description="Track system-wide changes and security events"
          showAddButton={false}
        />
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
          className="mt-4"
        />
        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <DataTable
              data={logs}
              columns={columns}
              title="Audit Events"
              pagination={true}
              showAddButton={false}
              pageIndex={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              totalItems={totalItems}
              isLoading={isLoading}
            />
          )}
        </div>

        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Audit Log Details</DialogTitle>
              <DialogDescription>
                Complete information about this audit log entry
              </DialogDescription>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-semibold">ID:</div>
                  <div>{selectedLog.id}</div>

                  <div className="font-semibold">Action:</div>
                  <div>{selectedLog.action}</div>

                  <div className="font-semibold">User:</div>
                  <div>{selectedLog.user}</div>

                  <div className="font-semibold">Timestamp:</div>
                  <div>{selectedLog.timestamp}</div>

                  <div className="font-semibold">IP Address:</div>
                  <div>{selectedLog.ip}</div>

                  <div className="font-semibold col-span-2">Details:</div>
                  <div className="col-span-2 border rounded p-2 bg-gray-50 dark:bg-gray-900">
                    {selectedLog.details}
                  </div>

                  <div className="font-semibold col-span-2">
                    Associated Data:
                  </div>
                  <div className="col-span-2 border rounded p-2 bg-gray-50 dark:bg-gray-900 font-mono text-xs">
                    {JSON.stringify(
                      {
                        module: "users",
                        objectId: 123,
                        changes: {
                          before: { name: "Old Name", role: "User" },
                          after: { name: "New Name", role: "Admin" },
                        },
                      },
                      null,
                      2
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AuditLog;
