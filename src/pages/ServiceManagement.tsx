import { useState, useCallback } from "react";
import { Sidebar } from "@/components/layout/sidebar/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { DataTable } from "@/components/ui/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Service } from "@/types/Service";
import useApiQuery from "@/hooks/use-api-query";
import ServiceManagementService from "@/services/ServiceManagementService";
import { ServiceStatusBadge } from "@/components/services/ServiceStatusBadge";
import { ActionsMenu } from "@/components/common/ActionsMenu";
import { format } from "date-fns";
import { PlayCircle, StopCircle, AlertCircle } from "lucide-react";
import DataFilters from "@/components/common/DataFilters";
import { toast } from "sonner";
import { ServiceDetailDialog } from "@/components/services/ServiceDetailDialog";
import { CreateServiceDialog } from "@/components/services/CreateServiceDialog";
import { Card, CardContent } from "@/components/ui/card";
import type { Column, FilterOption } from "@/types/Common";

const ServiceManagement = () => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");

  const {
    data: services,
    isLoading,
    filters,
    setFilters,
    resetFilters,
    refresh,
    page,
    pageSize,
    setPage,
    setPageSize,
    totalItems,
  } = useApiQuery<Service>({
    endpoint: "/api/services",
    initialPageSize: 10,
    persistFilters: true,
    initialPage: 0,
    queryKey: ["services", activeTab],
    initialFilters: {
      status: activeTab !== "all" ? activeTab : undefined,
    },
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const newStatus = tab !== "all" ? tab : undefined;
    setFilters({ ...filters, status: newStatus });
  };

  const handleViewService = (service: Service) => {
    setSelectedService(service);
    setIsDetailDialogOpen(true);
  };

  const handleServiceAction = async (
    service: Service,
    action: "start" | "stop"
  ) => {
    try {
      const newStatus = action === "start" ? "running" : "stopped";
      const response = await ServiceManagementService.updateServiceStatus(
        service.id,
        newStatus
      );

      if (response.success) {
        toast.success(
          `Service ${action === "start" ? "started" : "stopped"} successfully`
        );
        refresh();
      } else {
        toast.error(`Failed to ${action} service: ${response.error}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing service:`, error);
      toast.error(`An error occurred while ${action}ing the service`);
    }
  };

  const handleDeleteService = async (service: Service) => {
    try {
      const response = await ServiceManagementService.deleteService(service.id);

      if (response.success) {
        toast.success("Service deleted successfully");
        refresh();
      } else {
        toast.error(`Failed to delete service: ${response.error}`);
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("An error occurred while deleting the service");
    }
  };

  const handleCreateService = async (serviceData: Service) => {
    try {
      const response = await ServiceManagementService.createService(
        serviceData
      );

      if (response.success) {
        toast.success("Service created successfully");
        refresh();
      } else {
        toast.error(`Failed to create service: ${response.error}`);
      }
    } catch (error) {
      console.error("Error creating service:", error);
      toast.error("An error occurred while creating the service");
      throw error;
    }
  };

  const getServiceActions = (service: Service) => [
    {
      type: "view" as const,
      label: "View Details",
      onClick: () => handleViewService(service),
    },
    // ...(service.status !== "running"
    //   ? [
    //       {
    //         type: "success" as const,
    //         label: "Start Service",
    //         onClick: () => handleServiceAction(service, "start"),
    //       },
    //     ]
    //   : [
    //       {
    //         type: "warning" as const,
    //         label: "Stop Service",
    //         onClick: () => handleServiceAction(service, "stop"),
    //       },
    //     ]),
    {
      type: "delete" as const,
      label: "Delete Service",
      onClick: () => handleDeleteService(service),
    },
  ];

  const filterOptions: FilterOption<Service>[] = [
    {
      id: "search",
      label: "Search",
      type: "search",
      placeholder: "Search services...",
    },
    {
      id: "type",
      label: "Type",
      type: "select",
      placeholder: "Select type...",
      options: [
        { value: "backup", label: "Backup" },
        { value: "notification", label: "Notification" },
        { value: "maintenance", label: "Maintenance" },
        { value: "reporting", label: "Reporting" },
        { value: "security", label: "Security" },
      ],
    },
  ];

  const columns: Column<Service>[] = [
    {
      header: "Name",
      accessorKey: "name",
      sortable: true,
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: (service) => <span className="capitalize">{service.type}</span>,
      sortable: true,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (service) => <ServiceStatusBadge status={service.status} />,
      sortable: true,
    },
    {
      header: "Version",
      accessorKey: "version",
      sortable: true,
    },
    {
      header: "Created",
      accessorKey: "createdAt",
      cell: (service) => format(new Date(service.createdAt), "MMM d, yyyy"),
      sortable: true,
    },
    {
      header: "Actions",
      accessorKey: "actions",
      id: "actions",
      cell: (service: Service) => (
        <ActionsMenu actions={getServiceActions(service)} />
      ),
    },
  ];

  // Stats data for the dashboard cards
  const stats = {
    all: services?.length || 0,
    running: services?.filter((s) => s.status === "running").length || 0,
    stopped: services?.filter((s) => s.status === "stopped").length || 0,
    error: services?.filter((s) => s.status === "error").length || 0,
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <Breadcrumbs />

      <div className="mb-4">
        <PageHeader
          title="Service Management"
          description="Monitor and manage system services"
          showAddButton={true}
          onAddClick={() => setIsCreateDialogOpen(true)}
          addButtonText="Add Service"
        />
      </div>

      {/* Service Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card
          className="bg-secondary/10 hover:bg-secondary/20 transition-colors cursor-pointer"
          onClick={() => handleTabChange("all")}
        >
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                All Services
              </p>
              <p className="text-2xl font-bold">{stats.all}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center">
              <PlayCircle className="h-5 w-5 text-secondary-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="bg-green-500/10 hover:bg-green-500/20 transition-colors cursor-pointer"
          onClick={() => handleTabChange("running")}
        >
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Running
              </p>
              <p className="text-2xl font-bold">{stats.running}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <PlayCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="bg-orange-500/10 hover:bg-orange-500/20 transition-colors cursor-pointer"
          onClick={() => handleTabChange("stopped")}
        >
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Stopped
              </p>
              <p className="text-2xl font-bold">{stats.stopped}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center">
              <StopCircle className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="bg-red-500/10 hover:bg-red-500/20 transition-colors cursor-pointer"
          onClick={() => handleTabChange("error")}
        >
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Error</p>
              <p className="text-2xl font-bold">{stats.error}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4">
        <DataFilters
          filters={filters}
          setFilters={setFilters}
          resetFilters={resetFilters}
          options={filterOptions}
        />
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all">All Services</TabsTrigger>
          <TabsTrigger value="running">Running</TabsTrigger>
          <TabsTrigger value="stopped">Stopped</TabsTrigger>
          <TabsTrigger value="error">Error</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <DataTable
            data={services || []}
            columns={columns}
            isLoading={isLoading}
            pagination={true}
            pageIndex={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            totalItems={totalItems}
            tableId="services-table"
            defaultColumnVisibility={{
              version: false,
            }}
          />
        </TabsContent>
      </Tabs>

      {selectedService && (
        <ServiceDetailDialog
          serviceId={selectedService.id}
          isOpen={isDetailDialogOpen}
          onClose={() => setIsDetailDialogOpen(false)}
          onStatusChange={refresh}
        />
      )}

      <CreateServiceDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreate={handleCreateService}
      />
    </div>
  );
};

export default ServiceManagement;
