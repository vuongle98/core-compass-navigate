import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DataFilters from "@/components/common/DataFilters";
import { AlertTriangle, Download, RefreshCcw, Trash } from "lucide-react";
import { Event } from "@/types/Logging";
import { ApiQueryFilters } from "@/hooks/use-api-query";
import { FilterOption } from "@/types/Common";

const EventLog = () => {
  // Initial static events data for fallback
  const staticEvents: Event[] = [
    {
      id: 1,
      event: "System Startup",
      source: "Application",
      level: "Info",
      timestamp: "2025-04-15 08:00:12",
      message: "Application started successfully",
      user: "system",
      details: "System initialization completed in 3.2s",
    },
    {
      id: 2,
      event: "Database Connection",
      source: "Database",
      level: "Warning",
      timestamp: "2025-04-15 08:00:45",
      message: "Database connection pool reached 80% capacity",
      user: "system",
      details: "Current connections: 16/20",
    },
    {
      id: 3,
      event: "Authentication Failure",
      source: "Security",
      level: "Error",
      timestamp: "2025-04-15 10:15:22",
      message: "Multiple failed login attempts detected for user 'johndoe'",
      user: "johndoe",
      details: "IP: 192.168.1.100, Attempts: 5",
    },
    {
      id: 4,
      event: "API Request",
      source: "API",
      level: "Info",
      timestamp: "2025-04-15 10:30:15",
      message: "GET /api/users completed successfully",
      user: "admin",
      details: "Response time: 120ms, Status: 200",
    },
    {
      id: 5,
      event: "File Upload",
      source: "Storage",
      level: "Info",
      timestamp: "2025-04-15 11:05:33",
      message: "File 'report.pdf' uploaded successfully",
      user: "marketing",
      details: "Size: 2.3MB, Type: application/pdf",
    },
    {
      id: 6,
      event: "User Login",
      source: "Security",
      level: "Info",
      timestamp: "2025-04-15 11:10:45",
      message: "User 'sarah@example.com' logged in successfully",
      user: "sarah@example.com",
      details: "IP: 192.168.1.105, Device: Windows/Chrome",
    },
    {
      id: 7,
      event: "Configuration Change",
      source: "System",
      level: "Warning",
      timestamp: "2025-04-15 11:30:12",
      message: "System configuration modified by administrator",
      user: "admin",
      details: "Changed settings: SMTP_SERVER, MAX_FILE_SIZE",
    },
    {
      id: 8,
      event: "Memory Usage",
      source: "Monitoring",
      level: "Warning",
      timestamp: "2025-04-15 12:15:22",
      message: "High memory usage detected",
      user: "system",
      details: "Current usage: 85%, Threshold: 80%",
    },
    {
      id: 9,
      event: "User Creation",
      source: "User Management",
      level: "Info",
      timestamp: "2025-04-15 13:22:45",
      message: "New user 'mark@example.com' created",
      user: "admin",
      details: "Role: Editor, Department: Marketing",
    },
    {
      id: 10,
      event: "Payment Processing",
      source: "Billing",
      level: "Error",
      timestamp: "2025-04-15 14:05:30",
      message: "Payment processing failed for order #12345",
      user: "system",
      details: "Error: Insufficient funds, Card ending: 4321",
    },
    {
      id: 11,
      event: "Payment Processing",
      source: "Billing",
      level: "Error",
      timestamp: "2025-04-15 14:05:30",
      message: "Payment processing failed for order #12345",
      user: "system",
      details: "Error: Insufficient funds, Card ending: 4321",
    },
  ];

  // State to store events data
  const [events, setEvents] = useState<Event[]>(staticEvents);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [filters, setFilters] = useState<{
    level: string;
    source: string;
    search: string;
  }>({
    level: "",
    source: "",
    search: "",
  });

  // Handle API fetch error
  useEffect(() => {
    if (error) {
      toast.error("Failed to load event data", {
        description: "Falling back to static data. Please try again later.",
      });
    }
  }, [error]);

  const handleFilterChange = (newFilters: ApiQueryFilters) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
    }));
  };

  const resetFilters = () => {
    setFilters({
      level: "",
      source: "",
      search: "",
    });
  };

  const refreshData = () => {
    setLoading(true);
    // Mock API refresh
    setTimeout(() => {
      setEvents(staticEvents);
      setLoading(false);
      toast.success("Event logs refreshed");
    }, 800);
  };

  const clearLogs = () => {
    setEvents([]);
    toast.success("Event logs cleared");
  };

  const exportLogs = () => {
    toast.success("Event logs exported to CSV");
  };

  const filterOptions: FilterOption<Event>[] = [
    {
      id: "level",
      label: "Level",
      type: "select",
      options: [
        { value: "Info", label: "Info" },
        { value: "Warning", label: "Warning" },
        { value: "Error", label: "Error" },
      ],
    },
    {
      id: "source",
      label: "Source",
      type: "select",
      options: [
        { value: "Application", label: "Application" },
        { value: "Database", label: "Database" },
        { value: "Security", label: "Security" },
        { value: "API", label: "API" },
        { value: "System", label: "System" },
        { value: "User Management", label: "User Management" },
        { value: "Monitoring", label: "Monitoring" },
      ],
    },
    {
      id: "search",
      label: "Search",
      type: "search",
      placeholder: "Search events...",
    },
  ];

  // Filter events based on user selections
  const filteredEvents = events.filter((event) => {
    // Apply level filter
    if (filters.level && event.level !== filters.level) {
      return false;
    }

    // Apply source filter
    if (filters.source && event.source !== filters.source) {
      return false;
    }

    // Apply search filter across multiple fields
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return (
        event.event.toLowerCase().includes(search) ||
        event.message.toLowerCase().includes(search) ||
        (event.user && event.user.toLowerCase().includes(search)) ||
        (event.details && event.details.toLowerCase().includes(search))
      );
    }

    return true;
  });

  const columns = [
    {
      header: "#",
      accessorKey: "id",
      cell: (info: { row: { original: Event } }) => (
        <span className="text-muted-foreground">{info.row.original.id}</span>
      ),
    },
    { header: "Event", accessorKey: "event" as const },
    { header: "Source", accessorKey: "source" as const },
    {
      header: "Level",
      accessorKey: "level" as const,
      cell: (info: { row: { original: Event } }) => {
        const level = info.row.original.level;
        let variant: "default" | "secondary" | "destructive" | "outline" =
          "default";

        if (level === "Warning") {
          variant = "secondary";
        } else if (level === "Error") {
          variant = "destructive";
        }

        return <Badge variant={variant}>{level}</Badge>;
      },
    },
    { header: "Timestamp", accessorKey: "timestamp" as const },
    {
      header: "Message",
      accessorKey: "message" as const,
      cell: (info: { row: { original: Event } }) => (
        <div className="max-w-xs truncate">{info.row.original.message}</div>
      ),
    },
    { header: "User", accessorKey: "user" as const },
    {
      header: "Details",
      accessorKey: "details" as const,
      cell: (info: { row: { original: Event } }) => (
        <div className="max-w-xs truncate text-xs text-muted-foreground">
          {info.row.original.details}
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader
          title="Event Log"
          description="View system events and application logs"
          actions={
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={refreshData}
                disabled={loading}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" onClick={exportLogs}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" onClick={clearLogs}>
                <Trash className="mr-2 h-4 w-4" />
                Clear Logs
              </Button>
            </div>
          }
        />
        <DataFilters
          filters={filters}
          setFilters={handleFilterChange}
          resetFilters={resetFilters}
          onChange={handleFilterChange}
          onReset={resetFilters}
          options={filterOptions}
          className="mt-4"
          showToggle={false}
        />
        <div className="mt-4">
          {events.length === 0 ? (
            <div className="border rounded-lg p-8 text-center mt-4">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No logs found</h3>
              <p className="text-muted-foreground mb-4">
                There are no event logs available or matching your filters.
              </p>
              <Button onClick={refreshData}>Refresh Logs</Button>
            </div>
          ) : (
            <DataTable
              data={filteredEvents}
              columns={columns}
              title="System Events"
              pagination={true}
              initialPageSize={10}
              showAddButton={false}
              pageIndex={0}
              pageSize={10}
              onPageChange={() => {}}
              totalItems={filteredEvents.length}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default EventLog;
