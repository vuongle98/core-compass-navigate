import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/DataTable";
import { ActionsMenu, ActionType } from "@/components/common/ActionsMenu";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { PopoverTrigger, PopoverContent, Popover } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import useApiQuery from "@/hooks/use-api-query";
import { DataFilters, FilterOption } from "@/components/common/DataFilters";
import { Skeleton } from "@/components/ui/skeleton";
import LoggingService from "@/services/LoggingService";

interface UserRequest {
  id: number;
  endpoint: string;
  method: string;
  user: string;
  timestamp: string;
  status: number;
  duration: string;
}

// Mock data for user requests
const mockRequests: UserRequest[] = [
  {
    id: 1,
    endpoint: "/api/users",
    method: "GET",
    user: "john@example.com",
    timestamp: "2023-04-10 14:32:45",
    status: 200,
    duration: "45ms",
  },
  {
    id: 2,
    endpoint: "/api/files/upload",
    method: "POST",
    user: "sarah@example.com",
    timestamp: "2023-04-10 15:21:33",
    status: 201,
    duration: "235ms",
  },
  {
    id: 3,
    endpoint: "/api/role",
    method: "GET",
    user: "admin@example.com",
    timestamp: "2023-04-09 09:15:22",
    status: 200,
    duration: "62ms",
  },
  {
    id: 4,
    endpoint: "/api/auth/login",
    method: "POST",
    user: "guest@example.com",
    timestamp: "2023-04-09 10:45:18",
    status: 401,
    duration: "30ms",
  },
  {
    id: 5,
    endpoint: "/api/settings",
    method: "PUT",
    user: "admin@example.com",
    timestamp: "2023-04-08 16:12:05",
    status: 200,
    duration: "120ms",
  },
];

const UserRequestLog = () => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<UserRequest | null>(null);

  // Filter options for the data filters component
  const filterOptions: FilterOption[] = [
    {
      id: "search",
      label: "Search",
      type: "search",
      placeholder: "Search endpoints, users..."
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
      ]
    },
    {
      id: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "200", label: "200 OK" },
        { value: "201", label: "201 Created" },
        { value: "400", label: "400 Bad Request" },
        { value: "401", label: "401 Unauthorized" },
        { value: "404", label: "404 Not Found" },
        { value: "500", label: "500 Server Error" },
      ]
    }
  ];

  // Use our custom API query hook
  const {
    data: requests,
    isLoading,
    filters,
    setFilters,
    resetFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalItems
  } = useApiQuery<UserRequest>({
    endpoint: "/api/logs/requests",
    queryKey: ["user-requests"], // Fix: Changed string to array for QueryKey
    initialPageSize: 10,
    persistFilters: true,
    mockData: {
      content: mockRequests,
      totalElements: mockRequests.length,
      totalPages: 1,
      number: 0,
      size: 10
    }
  });

  const viewDetails = (log: UserRequest) => {
    setSelectedLog(log);
    setDetailsOpen(true);
    
    // Log user action with corrected parameter order
    LoggingService.logUserAction(
      "user_requests", 
      "view_details", 
      `Viewed details for request ID ${log.id}`,
      { requestId: log.id }
    );
  };

  const exportLog = (log: UserRequest) => {
    // In a real application, this would trigger a download
    const content = `ID: ${log.id}\nEndpoint: ${log.endpoint}\nMethod: ${log.method}\nUser: ${log.user}\nTimestamp: ${log.timestamp}\nStatus: ${log.status}\nDuration: ${log.duration}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `request-log-${log.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Log entry exported");
    
    // Log user action with corrected parameter order
    LoggingService.logUserAction(
      "user_requests", 
      "export_log", 
      `Exported log for request ID ${log.id}`,
      { requestId: log.id }
    );
  };

  const getActionItems = (item: UserRequest) => {
    const actions: {
      type: ActionType;
      label: string;
      onClick: () => void;
      disabled?: boolean;
    }[] = [
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
          
          // Log user action with corrected parameter order
          LoggingService.logUserAction(
            "user_requests", 
            "copy_id", 
            `Copied ID ${item.id} to clipboard`,
            { requestId: item.id }
          );
        },
      },
    ];
    return actions;
  };

  const columns = [
    {
      header: "#",
      accessorKey: "id",
      cell: (item: UserRequest) => (
        <span className="text-muted-foreground">{item.id}</span>
      ),
      sortable: true,
    },
    { header: "Endpoint", accessorKey: "endpoint" as const },
    { 
      header: "Method", 
      accessorKey: "method" as const,
      cell: (item: UserRequest) => (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
          item.method === 'GET' ? 'bg-blue-100 text-blue-800' :
          item.method === 'POST' ? 'bg-green-100 text-green-800' :
          item.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
          item.method === 'DELETE' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {item.method}
        </span>
      ),
    },
    { header: "User", accessorKey: "user" as const },
    { header: "Timestamp", accessorKey: "timestamp" as const },
    { 
      header: "Status", 
      accessorKey: "status" as const,
      cell: (item: UserRequest) => (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
          item.status < 300 ? 'bg-green-100 text-green-800' :
          item.status < 400 ? 'bg-blue-100 text-blue-800' :
          item.status < 500 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {item.status}
        </span>
      ),
    },
    { header: "Duration", accessorKey: "duration" as const },
    {
      header: "Actions",
      accessorKey: "actions" as const,
      cell: (userRequest: UserRequest) => (
        <ActionsMenu actions={getActionItems(userRequest)} />
      ),
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader
          title="User Request Log"
          description="Monitor API requests and performance metrics"
          showAddButton={false}
        >
          <DataFilters
            filters={filters}
            options={filterOptions}
            onChange={setFilters}
            onReset={resetFilters}
            className="mt-4"
          />
        </PageHeader>

        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <DataTable
              data={requests}
              columns={columns}
              title="API Requests"
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
              <DialogTitle>User Request Log Details</DialogTitle>
              <DialogDescription>
                Complete information about this request log entry
              </DialogDescription>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-semibold">ID:</div>
                  <div>{selectedLog.id}</div>

                  <div className="font-semibold">Endpoint:</div>
                  <div>{selectedLog.endpoint}</div>
                  
                  <div className="font-semibold">Method:</div>
                  <div>{selectedLog.method}</div>

                  <div className="font-semibold">User:</div>
                  <div>{selectedLog.user}</div>

                  <div className="font-semibold">Timestamp:</div>
                  <div>{selectedLog.timestamp}</div>
                  
                  <div className="font-semibold">Status:</div>
                  <div>{selectedLog.status}</div>
                  
                  <div className="font-semibold">Duration:</div>
                  <div>{selectedLog.duration}</div>

                  <div className="font-semibold col-span-2">Request Headers:</div>
                  <div className="col-span-2 border rounded p-2 bg-gray-50 dark:bg-gray-900 font-mono text-xs">
                    {JSON.stringify({
                      "Content-Type": "application/json",
                      "Authorization": "Bearer [redacted]",
                      "User-Agent": "Mozilla/5.0"
                    }, null, 2)}
                  </div>
                  
                  <div className="font-semibold col-span-2">Request Body:</div>
                  <div className="col-span-2 border rounded p-2 bg-gray-50 dark:bg-gray-900 font-mono text-xs">
                    {selectedLog.method !== 'GET' 
                      ? JSON.stringify({ example: "request data" }, null, 2)
                      : "N/A"}
                  </div>
                  
                  <div className="font-semibold col-span-2">Response Body:</div>
                  <div className="col-span-2 border rounded p-2 bg-gray-50 dark:bg-gray-900 font-mono text-xs">
                    {JSON.stringify({ example: "response data" }, null, 2)}
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

export default UserRequestLog;
