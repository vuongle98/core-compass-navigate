
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";

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
      duration: "45ms"
    },
    { 
      id: 2, 
      endpoint: "/api/files/upload", 
      method: "POST", 
      user: "sarah@example.com",
      timestamp: "2023-04-10 15:21:33",
      status: 201,
      duration: "235ms"
    },
    { 
      id: 3, 
      endpoint: "/api/roles", 
      method: "GET", 
      user: "admin@example.com",
      timestamp: "2023-04-09 09:15:22",
      status: 200,
      duration: "62ms"
    },
  ];

  const columns = [
    { header: "Endpoint", accessorKey: "endpoint" as const },
    { header: "Method", accessorKey: "method" as const },
    { header: "User", accessorKey: "user" as const },
    { header: "Timestamp", accessorKey: "timestamp" as const },
    { header: "Status", accessorKey: "status" as const },
    { header: "Duration", accessorKey: "duration" as const },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader 
          title="User Request Log" 
          description="Monitor API requests and performance metrics"
        />
        
        <div className="mt-6">
          <DataTable 
            data={requests} 
            columns={columns} 
            title="API Requests" 
          />
        </div>
      </main>
    </div>
  );
};

export default UserRequestLog;
