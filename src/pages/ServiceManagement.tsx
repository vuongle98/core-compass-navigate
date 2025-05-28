
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { DataFilters } from "@/components/common/DataFilters";
import { ServiceDetailDialog } from "@/components/services/ServiceDetailDialog";
import { CreateServiceDialog } from "@/components/services/CreateServiceDialog";
import { ServiceStatusBadge } from "@/components/services/ServiceStatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ServiceManagementService from "@/services/ServiceManagementService";
import { Service, ServiceCreateRequest, ServiceStatus } from "@/types/Service";
import { Column } from "@/types/Common";
import { FilterOption } from "@/types/Common";
import { ActionsMenu, ActionType } from "@/components/common/ActionsMenu";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { useApiQuery } from "@/hooks/use-api-query";

const ServiceManagement = () => {
  const [selectedServiceId, setSelectedServiceId] = useState<
    string | number | null
  >(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("all");
  const queryClient = useQueryClient();

  // Use the updated useApiQuery hook with cache control
  const {
    data: services,
    isLoading,
    filters,
    setFilters,
    refresh,
    forceRefresh,
    totalItems,
  } = useApiQuery<Service>({
    endpoint: "/api/services",
    queryKey: ["services"],
    useCache: true, // Enable caching
    initialFilters: currentTab !== "all" ? { status: currentTab as ServiceStatus } : {},
  });

  const createServiceMutation = useMutation({
    mutationFn: (data: ServiceCreateRequest) =>
      ServiceManagementService.createService(data),
    onSuccess: () => {
      toast.success("Service created successfully");
      // Force refresh to bypass cache after creation
      forceRefresh();
    },
    onError: () => {
      toast.error("Failed to create service");
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: ServiceStatus }) =>
      ServiceManagementService.updateServiceStatus(id, action),
    onSuccess: () => {
      toast.success("Service updated successfully");
      // Force refresh to bypass cache after update
      forceRefresh();
    },
    onError: () => {
      toast.error("Failed to update service");
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id: number) => ServiceManagementService.deleteService(id),
    onSuccess: () => {
      toast.success("Service deleted successfully");
      // Force refresh to bypass cache after deletion
      forceRefresh();
    },
    onError: () => {
      toast.error("Failed to delete service");
    },
  });

  const handleViewService = (service: Service) => {
    setSelectedServiceId(service.id);
    setDetailDialogOpen(true);
  };

  const handleStartService = async (service: Service) => {
    updateServiceMutation.mutate({
      id: service.id as number,
      action: "running",
    });
  };

  const handleStopService = async (service: Service) => {
    updateServiceMutation.mutate({
      id: service.id as number,
      action: "stopped",
    });
  };

  const handleRestartService = async (service: Service) => {
    updateServiceMutation.mutate({
      id: service.id as number,
      action: "running",
    });
  };

  const handleEditService = (service: Service) => {
    // Navigate to edit page or open edit dialog
    console.log("Edit service:", service);
  };

  const handleDeleteService = async (service: Service) => {
    if (window.confirm(`Are you sure you want to delete ${service.name}?`)) {
      deleteServiceMutation.mutate(service.id as number);
    }
  };

  const handleStatusChange = () => {
    forceRefresh();
  };

  const handleCreateService = async (
    data: ServiceCreateRequest
  ): Promise<void> => {
    await createServiceMutation.mutateAsync(data);
  };

  // Update filters when tab changes
  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    const statusFilter = value !== "all" ? { status: value as ServiceStatus } : {};
    setFilters({ ...filters, ...statusFilter });
  };

  const getActionItems = (service: Service) => {
    const actions = [
      {
        type: "view" as ActionType,
        label: "View detail",
        onClick: () => handleViewService(service),
      },
      {
        type: "edit" as ActionType,
        label: "Edit",
        onClick: () => handleEditService(service),
      },
    ];

    // Add status-specific actions
    if (service.status === "stopped") {
      actions.push({
        type: "edit" as ActionType,
        label: "Start",
        onClick: () => handleStartService(service),
      });
    }

    if (service.status === "running") {
      actions.push(
        {
          type: "edit" as ActionType,
          label: "Stop",
          onClick: () => handleStopService(service),
        },
        {
          type: "edit" as ActionType,
          label: "Restart",
          onClick: () => handleRestartService(service),
        }
      );
    }

    actions.push({
      type: "delete" as ActionType,
      label: "Delete",
      onClick: () => handleDeleteService(service),
    });

    return actions;
  };

  const columns: Column<Service>[] = [
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: (service: Service) => (
        <Badge variant="outline">{service.type}</Badge>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (service: Service) => (
        <ServiceStatusBadge status={service.status} />
      ),
    },
    {
      header: "Description",
      accessorKey: "description",
    },
    {
      header: "Created At",
      accessorKey: "createdAt",
      cell: (service: Service) =>
        new Date(service.createdAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (service: Service) => (
        <ActionsMenu actions={getActionItems(service)} />
      ),
    },
  ];

  const filterOptions: FilterOption<Service>[] = [
    {
      id: "name",
      label: "Service Name",
      type: "text" as const,
      placeholder: "Search by name...",
    },
    {
      id: "type",
      label: "Service Type",
      type: "select" as const,
      options: [
        { value: "api", label: "API" },
        { value: "database", label: "Database" },
        { value: "cache", label: "Cache" },
        { value: "queue", label: "Queue" },
      ],
    },
    {
      id: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "running", label: "Running" },
        { value: "stopped", label: "Stopped" },
        { value: "error", label: "Error" },
      ],
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <Breadcrumbs />

      <PageHeader
        title="Service Management"
        description="Manage and monitor your services"
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => forceRefresh()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <CreateServiceDialog onSubmit={handleCreateService} />
          </div>
        }
      />

      <Tabs value={currentTab} onValueChange={handleTabChange} className="mt-6">
        <TabsList>
          <TabsTrigger value="all">All Services</TabsTrigger>
          <TabsTrigger value="running">Running</TabsTrigger>
          <TabsTrigger value="stopped">Stopped</TabsTrigger>
          <TabsTrigger value="error">Error</TabsTrigger>
        </TabsList>

        <TabsContent value={currentTab}>
          <DataFilters
            filters={filters}
            setFilters={setFilters}
            options={filterOptions}
          />

          <div className="mt-4">
            <DataTable
              data={services}
              title="Services management"
              columns={columns}
              isLoading={isLoading}
              pagination={true}
              showAddButton={true}
              totalItems={totalItems}
            />
          </div>
        </TabsContent>
      </Tabs>

      {selectedServiceId && (
        <ServiceDetailDialog
          serviceId={selectedServiceId}
          isOpen={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default ServiceManagement;
