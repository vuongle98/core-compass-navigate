
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";

interface Event {
  id: number;
  event: string;
  source: string;
  level: string;
  timestamp: string;
  message: string;
}

const EventLog = () => {
  // Mock data for system events
  const events = [
    { 
      id: 1, 
      event: "System Startup", 
      source: "Application", 
      level: "Info",
      timestamp: "2023-04-10 08:00:12",
      message: "Application started successfully"
    },
    { 
      id: 2, 
      event: "Database Connection", 
      source: "Database", 
      level: "Warning",
      timestamp: "2023-04-10 08:00:45",
      message: "Database connection pool reached 80% capacity"
    },
    { 
      id: 3, 
      event: "Authentication Failure", 
      source: "Security", 
      level: "Error",
      timestamp: "2023-04-10 10:15:22",
      message: "Multiple failed login attempts detected for user 'johndoe'"
    },
  ];

  const columns = [
    { header: "Event", accessorKey: "event" as const },
    { header: "Source", accessorKey: "source" as const },
    { header: "Level", accessorKey: "level" as const },
    { header: "Timestamp", accessorKey: "timestamp" as const },
    { header: "Message", accessorKey: "message" as const },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader 
          title="Event Log" 
          description="View system events and application logs"
        />
        
        <div className="mt-6">
          <DataTable 
            data={events} 
            columns={columns} 
            title="System Events" 
            pagination={true}
            apiEndpoint="/api/events" // This would be your actual API endpoint
            initialPageSize={10}
          />
        </div>
      </main>
    </div>
  );
};

export default EventLog;
