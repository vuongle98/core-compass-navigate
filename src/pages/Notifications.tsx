import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import {
  Archive,
  Bell,
  BellRing,
  Check,
  Download,
  FileUp,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useApiQuery from "@/hooks/use-api-query";
import useDebounce from "@/hooks/use-debounce";
import DataFilters from "@/components/common/DataFilters";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Notification } from "@/types/Notification";
import { FilterOption } from "@/types/Common";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const Notifications = () => {
  const [notifications, setNotifications] = useState<Array<Notification>>([
    {
      id: 1,
      title: "System Maintenance",
      channel: "Email, In-App",
      audience: "All Users",
      scheduledFor: "2025-04-20",
      status: "Scheduled",
      content:
        "The system will undergo maintenance from 2-4 AM EST. Please save your work.",
      priority: "medium",
    },
    {
      id: 2,
      title: "New Feature Announcement",
      channel: "In-App",
      audience: "Premium Users",
      scheduledFor: "2025-04-18",
      status: "Sent",
      content:
        "We've added exciting new features to your premium subscription!",
      priority: "low",
    },
    {
      id: 3,
      title: "Account Verification",
      channel: "Email",
      audience: "New Users",
      scheduledFor: "Automated",
      status: "Active",
      content: "Please verify your account to access all features.",
      priority: "high",
    },
    {
      id: 4,
      title: "Holiday Notice",
      channel: "Email, SMS",
      audience: "All Users",
      scheduledFor: "2025-04-30",
      status: "Draft",
      content: "Our offices will be closed during the upcoming holiday.",
      priority: "low",
    },
    {
      id: 5,
      title: "Subscription Renewal",
      channel: "Email",
      audience: "Premium Users",
      scheduledFor: "2025-05-01",
      status: "Scheduled",
      content:
        "Your subscription will renew soon. Please update payment details if needed.",
      priority: "medium",
    },
    {
      id: 6,
      title: "System Maintenance",
      channel: "Email, In-App",
      audience: "All Users",
      scheduledFor: "2025-04-20",
      status: "Scheduled",
      content:
        "The system will undergo maintenance from 2-4 AM EST. Please save your work.",
      priority: "medium",
    },
    {
      id: 7,
      title: "New Feature Announcement",
      channel: "In-App",
      audience: "Premium Users",
      scheduledFor: "2025-04-18",
      status: "Sent",
      content:
        "We've added exciting new features to your premium subscription!",
      priority: "low",
    },
    {
      id: 8,
      title: "Account Verification",
      channel: "Email",
      audience: "New Users",
      scheduledFor: "Automated",
      status: "Active",
      content: "Please verify your account to access all features.",
      priority: "high",
    },
    {
      id: 9,
      title: "Holiday Notice",
      channel: "Email, SMS",
      audience: "All Users",
      scheduledFor: "2025-04-30",
      status: "Draft",
      content: "Our offices will be closed during the upcoming holiday.",
      priority: "low",
    },
    {
      id: 10,
      title: "Subscription Renewal",
      channel: "Email",
      audience: "Premium Users",
      scheduledFor: "2025-05-01",
      status: "Scheduled",
      content:
        "Your subscription will renew soon. Please update payment details if needed.",
      priority: "medium",
    },
    {
      id: 11,
      title: "Subscription Renewal",
      channel: "Email",
      audience: "Premium Users",
      scheduledFor: "2025-05-01",
      status: "Scheduled",
      content:
        "Your subscription will renew soon. Please update payment details if needed.",
      priority: "medium",
    },
  ]);

  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showDetails, setShowDetails] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  // Debounce the search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const handleSelectItem = (id: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems((prev) => [...prev, id]);
    } else {
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems(notificationsData.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const filterOptions: FilterOption<Notification>[] = [
    {
      id: "search",
      label: "Search",
      type: "search",
      placeholder: "Search notifications...",
    },
    {
      id: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "sent", label: "Sent" },
        { value: "scheduled", label: "Scheduled" },
        { value: "draft", label: "Draft" },
        { value: "active", label: "Active" },
      ],
    },
    {
      id: "channel",
      label: "Channel",
      type: "select",
      options: [
        { value: "email", label: "Email" },
        { value: "sms", label: "SMS" },
        { value: "inapp", label: "In-app" },
        { value: "push", label: "Push" },
      ],
    },
  ];

  const {
    data: notificationsData,
    isLoading,
    filters,
    setFilters,
    resetFilters,
    page,
    pageSize,
    setPage,
    setPageSize,
    totalItems,
    refresh,
    error,
  } = useApiQuery<Notification>({
    endpoint: "/api/notification",
    queryKey: ["notifications", debouncedSearchTerm],
    initialPage: 0,
    initialPageSize: 10,
    persistFilters: true,
    onError: (err) => {
      console.error("Failed to fetch roles:", err);
      toast.error("Failed to load roles, using cached data", {
        description: "Could not connect to the server. Please try again later.",
      });
    },
    mockData: {
      content: notifications,
      totalElements: notifications.length,
      totalPages: 1,
      number: 0,
      size: 10,
    },
  });

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) {
      toast.error("No items selected");
      return;
    }

    setNotifications((prev) =>
      prev.filter((item) => !selectedItems.includes(item.id))
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

    setNotifications((prev) =>
      prev.map((item) => {
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
          scheduledFor: "2025-06-15",
          status: "Draft",
          content: "This was imported from a CSV file",
          priority: "low",
        },
        {
          id: 7,
          title: "Imported Notification 2",
          channel: "In-App",
          audience: "New Users",
          scheduledFor: "2025-06-20",
          status: "Draft",
          content: "Another notification imported from CSV",
          priority: "medium",
        },
      ];

      setNotifications((prev) => [...prev, ...newNotifications]);
      setIsImportModalOpen(false);
      toast.success("2 notifications imported successfully");
    }, 1000);
  };

  const handleExportData = (format: "csv" | "excel") => {
    // Mock implementation
    toast.success(`Notifications exported as ${format.toUpperCase()}`);
    setIsExportModalOpen(false);
  };

  const columns = [
    {
      header: "#",
      accessorKey: "id",
      cell: (item: Notification) => (
        <span className="text-muted-foreground">{item.id}</span>
      ),
    },
    {
      header: "Title",
      accessorKey: "title",
      cell: (item: Notification) => (
        <div
          className="font-medium cursor-pointer"
          onClick={() => setShowDetails(item.id)}
        >
          {item.title}
        </div>
      ),
    },
    {
      header: "Channel",
      accessorKey: "channel",
      cell: (item: Notification) => {
        const channels = item.channel.split(", ");
        return (
          <div className="flex gap-1">
            {channels.includes("Email") && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Email
              </span>
            )}
            {channels.includes("In-App") && (
              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                In-App
              </span>
            )}
            {channels.includes("SMS") && (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                SMS
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Audience",
      accessorKey: "audience",
    },
    {
      header: "Scheduled For",
      accessorKey: "scheduledFor",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item: Notification) => {
        const status = item.status;
        let bgColor = "bg-blue-100 text-blue-800";

        if (status === "Sent") {
          bgColor = "bg-green-100 text-green-800";
        } else if (status === "Scheduled") {
          bgColor = "bg-yellow-100 text-yellow-800";
        } else if (status === "Draft") {
          bgColor = "bg-gray-100 text-gray-800";
        }

        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      header: "Priority",
      accessorKey: "priority",
      cell: (item: Notification) => {
        const priority = item.priority;
        let bgColor = "bg-gray-100 text-gray-800";
        let label = "Low";

        if (priority === "medium") {
          bgColor = "bg-yellow-100 text-yellow-800";
          label = "Medium";
        } else if (priority === "high") {
          bgColor = "bg-red-100 text-red-800";
          label = "High";
        }

        return priority ? (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}
          >
            {label}
          </span>
        ) : null;
      },
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <Breadcrumbs />
      <PageHeader
        title="Notifications"
        description="Manage system notifications"
        actions={
          <div className="flex space-x-2">
            {selectedItems.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete ({selectedItems.length})
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkArchive}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkPublish}>
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

      <DataFilters
        filters={filters}
        setFilters={setFilters}
        resetFilters={resetFilters}
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
          refresh();
        }}
        className="mb-4"
      />

      <div className="mt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-[400px] grid-cols-2 mb-4">
            <TabsTrigger value="overview">
              <Bell className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BellRing className="mr-2 h-4 w-4" />
              Delivery Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DataTable
              data={notificationsData}
              columns={columns}
              title="Notification Management"
              pagination={true}
              isLoading={isLoading}
              pageIndex={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              totalItems={totalItems}
              showAddButton={true}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Delivery Success Rate</CardTitle>
                  <CardDescription>Last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">98.2%</div>
                  <Progress value={98.2} className="mt-2" />
                  <p className="text-sm text-muted-foreground mt-2">
                    +2.1% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Open Rate</CardTitle>
                  <CardDescription>Last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">62.5%</div>
                  <Progress value={62.5} className="mt-2" />
                  <p className="text-sm text-muted-foreground mt-2">
                    -1.8% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Click Rate</CardTitle>
                  <CardDescription>Last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">37.8%</div>
                  <Progress value={37.8} className="mt-2" />
                  <p className="text-sm text-muted-foreground mt-2">
                    +4.3% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Channel Performance</CardTitle>
                <CardDescription>Delivery success by channel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Email</span>
                      <span className="text-sm">98.7%</span>
                    </div>
                    <Progress value={98.7} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">In-App</span>
                      <span className="text-sm">99.9%</span>
                    </div>
                    <Progress value={99.9} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">SMS</span>
                      <span className="text-sm">95.2%</span>
                    </div>
                    <Progress value={95.2} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">
                        Push Notification
                      </span>
                      <span className="text-sm">89.6%</span>
                    </div>
                    <Progress value={89.6} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Modal */}
      <Dialog
        open={showDetails !== null}
        onOpenChange={() => setShowDetails(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {showDetails !== null &&
            (() => {
              const notification = notificationsData.find(
                (n) => n.id === showDetails
              );
              if (!notification) return null;

              return (
                <>
                  <DialogHeader>
                    <DialogTitle>{notification.title}</DialogTitle>
                    <DialogDescription>
                      Scheduled for {notification.scheduledFor} •{" "}
                      {notification.audience}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Content
                      </h3>
                      <p>{notification.content}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">
                          Status
                        </h3>
                        <p>{notification.status}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">
                          Channel
                        </h3>
                        <p>{notification.channel}</p>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowDetails(null)}
                    >
                      Close
                    </Button>
                    {notification.status !== "Sent" && (
                      <Button
                        onClick={() => {
                          setNotifications((prev) =>
                            prev.map((item) =>
                              item.id === showDetails
                                ? { ...item, status: "Sent" }
                                : item
                            )
                          );
                          toast.success("Notification published");
                          setShowDetails(null);
                        }}
                      >
                        Publish Now
                      </Button>
                    )}
                  </DialogFooter>
                </>
              );
            })()}
        </DialogContent>
      </Dialog>

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
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">CSV, XLSX (MAX. 10MB)</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" />
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsImportModalOpen(false)}
            >
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
                onClick={() => handleExportData("csv")}
              >
                <FileUp className="w-8 h-8 mb-4" />
                <span>CSV</span>
              </Button>
              <Button
                variant="outline"
                className="w-40 h-32 flex flex-col items-center justify-center"
                onClick={() => handleExportData("excel")}
              >
                <FileUp className="w-8 h-8 mb-4" />
                <span>Excel</span>
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsExportModalOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notifications;
