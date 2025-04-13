
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";

const AuditLog = () => {
  // Mock data for audit logs
  const logs = [
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
  ];

  const columns = [
    { header: "Action", accessorKey: "action" as const },
    { header: "User", accessorKey: "user" as const },
    { header: "Timestamp", accessorKey: "timestamp" as const },
    { header: "Details", accessorKey: "details" as const },
    { header: "IP Address", accessorKey: "ip" as const },
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
      </main>
    </div>
  );
};

export default AuditLog;
