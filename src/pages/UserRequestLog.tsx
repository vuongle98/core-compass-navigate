import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { ActionsMenu, ActionType } from "@/components/common/ActionsMenu";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserRequest {
  id: number;
  endpoint: string;
  method: string;
  user: string;
  timestamp: string;
  status: number;
  duration: string;
}

const UserRequestLog = () => {
  // Mock data for user requests
  const requests = [
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
      endpoint: "/api/roles",
      method: "GET",
      user: "admin@example.com",
      timestamp: "2023-04-09 09:15:22",
      status: 200,
      duration: "62ms",
    },
  ];

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<UserRequest | null>(null);

  const viewDetails = (log: UserRequest) => {
    setSelectedLog(log);
    setDetailsOpen(true);
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
        onClick: () => {},
      },
      {
        type: "copy",
        label: "Copy ID",
        onClick: () => {
          navigator.clipboard.writeText(item.id.toString());
          toast.success("Log ID copied to clipboard");
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
    { header: "Method", accessorKey: "method" as const },
    { header: "User", accessorKey: "user" as const },
    { header: "Timestamp", accessorKey: "timestamp" as const },
    { header: "Status", accessorKey: "status" as const },
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
        />

        <div className="mt-6">
          <DataTable
            data={requests}
            columns={columns}
            title="API Requests"
            pagination={true}
            showAddButton={false}
          />
        </div>

        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>User Request Log Details</DialogTitle>
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
                  <div>{selectedLog.endpoint}</div>

                  <div className="font-semibold">User:</div>
                  <div>{selectedLog.user}</div>

                  <div className="font-semibold">Timestamp:</div>
                  <div>{selectedLog.timestamp}</div>

                  <div className="font-semibold">IP Address:</div>
                  <div>{selectedLog.method}</div>

                  <div className="font-semibold col-span-2">Details:</div>
                  <div className="col-span-2 border rounded p-2 bg-gray-50 dark:bg-gray-900">
                    {selectedLog.status}
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
