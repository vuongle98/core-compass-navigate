
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";

const Notifications = () => {
  // Mock data
  const notifications = [
    { 
      id: 1, 
      title: "System Maintenance", 
      channel: "Email, In-App", 
      audience: "All Users",
      scheduledFor: "2023-04-15",
      status: "Scheduled"
    },
    { 
      id: 2, 
      title: "New Feature Announcement", 
      channel: "In-App", 
      audience: "Premium Users",
      scheduledFor: "2023-04-10",
      status: "Sent"
    },
    { 
      id: 3, 
      title: "Account Verification", 
      channel: "Email", 
      audience: "New Users",
      scheduledFor: "Automated",
      status: "Active"
    },
  ];

  const columns = [
    { header: "Title", accessorKey: "title" },
    { header: "Channel", accessorKey: "channel" },
    { header: "Audience", accessorKey: "audience" },
    { header: "Scheduled For", accessorKey: "scheduledFor" },
    { 
      header: "Status", 
      accessorKey: "status",
      cell: (notification) => {
        let bgColor = "bg-blue-100 text-blue-800";
        
        if (notification.status === "Sent") {
          bgColor = "bg-green-100 text-green-800";
        } else if (notification.status === "Scheduled") {
          bgColor = "bg-yellow-100 text-yellow-800";
        }
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
            {notification.status}
          </span>
        );
      }
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader 
          title="Notifications" 
          description="Manage system notifications"
        />
        
        <div className="mt-6">
          <DataTable data={notifications} columns={columns} title="Notification Management" />
        </div>
      </main>
    </div>
  );
};

export default Notifications;
