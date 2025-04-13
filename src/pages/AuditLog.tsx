
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { ActionsMenu } from "@/components/common/ActionsMenu";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AuditLogItem {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  details: string;
  ip: string;
}

const AuditLog = () => {
  // Mock data for audit logs
  const [logs, setLogs] = useState<AuditLogItem[]>([
    { 
      id: 1, 
      action: "User Created", 
      user: "Admin", 
      timestamp: "2023-04-10 14:32:45",
      details: "New user 'john@example.com' was created",
      ip: "192.168.1.100"
    },
    { 
      id: 2, 
      action: "Permission Modified", 
      user: "Admin", 
      timestamp: "2023-04-10 15:21:33",
      details: "Permission 'manage_users' was added to role 'Manager'",
      ip: "192.168.1.100" 
    },
    { 
      id: 3, 
      action: "Config Changed", 
      user: "System", 
      timestamp: "2023-04-09 09:15:22",
      details: "System configuration 'backup_schedule' was updated",
      ip: "192.168.1.1"
    },
  ]);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const viewDetails = (log: AuditLogItem) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };

  const exportLog = (log: AuditLogItem) => {
    // In a real application, this would trigger a download
    const content = `ID: ${log.id}\nAction: ${log.action}\nUser: ${log.user}\nTimestamp: ${log.timestamp}\nDetails: ${log.details}\nIP: ${log.ip}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${log.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Log entry exported");
  };

  const columns = [
    { header: "Action", accessorKey: "action" },
    { header: "User", accessorKey: "user" },
    { header: "Timestamp", accessorKey: "timestamp" },
    { 
      header: "Details", 
      accessorKey: "details",
      cell: (item: AuditLogItem) => (
        <div className="max-w-[300px] truncate">{item.details}</div>
      )
    },
    { header: "IP Address", accessorKey: "ip" },
    { 
      header: "Actions",
      accessorKey: "id",
      cell: (item: AuditLogItem) => (
        <ActionsMenu 
          actions={[
            {
              type: "view",
              label: "View Details",
              onClick: () => viewDetails(item)
            },
            {
              type: "download",
              label: "Export",
              onClick: () => exportLog(item)
            },
            {
              type: "copy",
              label: "Copy ID",
              onClick: () => {
                navigator.clipboard.writeText(item.id.toString());
                toast.success("Log ID copied to clipboard");
              }
            }
          ]}
        />
      )
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader 
          title="Audit Log" 
          description="Track system-wide changes and security events"
        />
        
        <div className="mt-6">
          <DataTable 
            data={logs} 
            columns={columns} 
            title="Audit Events" 
            pagination={true}
          />
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
