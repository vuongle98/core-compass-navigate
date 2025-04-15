
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { 
  Archive, 
  BellOff, 
  Check, 
  Download, 
  FileUp, 
  Trash2, 
  Upload
} from "lucide-react";
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

interface Notification {
  id: number;
  title: string;
  channel: string;
  audience: string;
  scheduledFor: string;
  status: string;
  selected?: boolean;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Array<Notification>>([
    {
      id: 1,
      title: "System Maintenance",
      channel: "Email, In-App",
      audience: "All Users",
      scheduledFor: "2023-04-15",
      status: "Scheduled",
    },
    {
      id: 2,
      title: "New Feature Announcement",
      channel: "In-App",
      audience: "Premium Users",
      scheduledFor: "2023-04-10",
      status: "Sent",
    },
    {
      id: 3,
      title: "Account Verification",
      channel: "Email",
      audience: "New Users",
      scheduledFor: "Automated",
      status: "Active",
    },
    {
      id: 4,
      title: "Holiday Notice",
      channel: "Email, SMS",
      audience: "All Users",
      scheduledFor: "2023-12-20",
      status: "Draft",
    },
    {
      id: 5,
      title: "Subscription Renewal",
      channel: "Email",
      audience: "Premium Users",
      scheduledFor: "2023-05-01",
      status: "Scheduled",
    },
  ]);

  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleSelectItem = (id: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems(notifications.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) {
      toast.error("No items selected");
      return;
    }
    
    setNotifications(prev => 
      prev.filter(item => !selectedItems.includes(item.id))
    );
    
    toast.success(`${selectedItems.length} notifications deleted`);
    setSelectedItems([]);
  };

  const handleBulkArchive = () => {
    if (selectedItems.length === 0) {
      toast.error("No items selected");
      return;
    }
    
    toast.success(`${selectedItems.length} notifications archived`);
    setSelectedItems([]);
  };

  const handleBulkPublish = () => {
    if (selectedItems.length === 0) {
      toast.error("No items selected");
      return;
    }
    
    setNotifications(prev => 
      prev.map(item => {
        if (selectedItems.includes(item.id)) {
          return { ...item, status: "Sent" };
        }
        return item;
      })
    );
    
    toast.success(`${selectedItems.length} notifications published`);
    setSelectedItems([]);
  };

  const handleImportCSV = () => {
    // Mock implementation
    setTimeout(() => {
      const newNotifications: Notification[] = [
        {
          id: 6,
          title: "Imported Notification 1",
          channel: "Email",
          audience: "All Users",
          scheduledFor: "2023-06-15",
          status: "Draft",
        },
        {
          id: 7,
          title: "Imported Notification 2",
          channel: "In-App",
          audience: "New Users",
          scheduledFor: "2023-06-20",
          status: "Draft",
        }
      ];
      
      setNotifications(prev => [...prev, ...newNotifications]);
      setIsImportModalOpen(false);
      toast.success("2 notifications imported successfully");
    }, 1000);
  };

  const handleExportData = (format: 'csv' | 'excel') => {
    // Mock implementation
    toast.success(`Notifications exported as ${format.toUpperCase()}`);
    setIsExportModalOpen(false);
  };

  const columns = [
    { 
      header: "Title", 
      accessorKey: "title" 
    },
    { 
      header: "Channel", 
      accessorKey: "channel" 
    },
    { 
      header: "Audience", 
      accessorKey: "audience" 
    },
    { 
      header: "Scheduled For", 
      accessorKey: "scheduledFor" 
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (notification: Notification) => {
        let bgColor = "bg-blue-100 text-blue-800";

        if (notification.status === "Sent") {
          bgColor = "bg-green-100 text-green-800";
        } else if (notification.status === "Scheduled") {
          bgColor = "bg-yellow-100 text-yellow-800";
        } else if (notification.status === "Draft") {
          bgColor = "bg-gray-100 text-gray-800";
        }

        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}
          >
            {notification.status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader
          title="Notifications"
          description="Manage system notifications"
          actions={
            <div className="flex space-x-2">
              {selectedItems.length > 0 && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete ({selectedItems.length})
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleBulkArchive}
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleBulkPublish}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Publish
                  </Button>
                </>
              )}
              <Button 
                variant="outline"
                onClick={() => setIsImportModalOpen(true)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsExportModalOpen(true)}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          }
        />

        <div className="mt-6">
          <DataTable
            data={notifications}
            columns={columns}
            title="Notification Management"
            pagination={true}
            onSelectItems={handleSelectItem}
            onSelectAll={handleSelectAll}
            selectedItems={selectedItems}
          />
        </div>

        {/* Import Modal */}
        <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Notifications</DialogTitle>
              <DialogDescription>
                Upload a CSV or Excel file to import notifications
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileUp className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">CSV, XLSX (MAX. 10MB)</p>
                  </div>
                  <input id="dropzone-file" type="file" className="hidden" />
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleImportCSV}>Import</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Modal */}
        <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Notifications</DialogTitle>
              <DialogDescription>
                Choose a format to export your notifications
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex justify-around">
                <Button 
                  variant="outline" 
                  className="w-40 h-32 flex flex-col items-center justify-center"
                  onClick={() => handleExportData('csv')}
                >
                  <FileUp className="w-8 h-8 mb-4" />
                  <span>CSV</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-40 h-32 flex flex-col items-center justify-center"
                  onClick={() => handleExportData('excel')}
                >
                  <FileUp className="w-8 h-8 mb-4" />
                  <span>Excel</span>
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Notifications;
