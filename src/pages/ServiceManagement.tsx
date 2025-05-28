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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ServiceManagementService from "@/services/ServiceManagementService";
import { Service, ServiceCreateRequest, ServiceStatus } from "@/types/Service";
import { Column } from "@/types/Common";
import { FilterOption } from "@/types/Common";
import { ActionsMenu, ActionType } from "@/components/common/ActionsMenu";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";

const ServiceManagement = () => {
  const [selectedServiceId, setSelectedServiceId] = useState<
    string | number | null
  >(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [currentTab, setCurrentTab] = useState("all");
  const queryClient = useQueryClient();

  const {
    data: servicesResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["services", filters, currentTab],
    queryFn: async () => {
      const statusFilter =
        currentTab !== "all" ? { status: currentTab as ServiceStatus } : {};
      return ServiceManagementService.getServices({
        ...filters,
        ...statusFilter,
      });
    },
  });

  // Extract services from API response
  const services = servicesResponse?.success
    ? servicesResponse.data.content
    : [];

  const createServiceMutation = useMutation({
    mutationFn: (data: ServiceCreateRequest) =>
      ServiceManagementService.createService(data),
    onSuccess: () => {
      toast.success("Service created successfully");
      queryClient.invalidateQueries({ queryKey: ["services"] });
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
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: () => {
      toast.error("Failed to update service");
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id: number) => ServiceManagementService.deleteService(id),
    onSuccess: () => {
      toast.success("Service deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["services"] });
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
    queryClient.invalidateQueries({ queryKey: ["services"] });
  };

  const handleCreateService = async (
    data: ServiceCreateRequest
  ): Promise<void> => {
    await createServiceMutation.mutateAsync(data);
  };

  const getActionItems = (service: Service) => {
    return [
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
      {
        type: "delete" as ActionType,
        label: "Delete",
        onClick: () => handleDeleteService(service),
      },
    ];

    // (
    //   <div className="flex space-x-2">
    //     <Button
    //       variant="ghost"
    //       size="sm"
    //       onClick={() => handleViewService(service)}
    //     >
    //       View
    //     </Button>
    //     <Button
    //       variant="ghost"
    //       size="sm"
    //       onClick={() => handleEditService(service)}
    //     >
    //       Edit
    //     </Button>
    //     {service.status === "stopped" && (
    //       <Button
    //         variant="ghost"
    //         size="sm"
    //         onClick={() => handleStartService(service)}
    //       >
    //         Start
    //       </Button>
    //     )}
    //     {service.status === "running" && (
    //       <>
    //         <Button
    //           variant="ghost"
    //           size="sm"
    //           onClick={() => handleStopService(service)}
    //         >
    //           Stop
    //         </Button>
    //         <Button
    //           variant="ghost"
    //           size="sm"
    //           onClick={() => handleRestartService(service)}
    //         >
    //           Restart
    //         </Button>
    //       </>
    //     )}
    //     <Button
    //       variant="destructive"
    //       size="sm"
    //       onClick={() => handleDeleteService(service)}
    //     >
    //       Delete
    //     </Button>
    //   </div>
    // );
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
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <CreateServiceDialog onSubmit={handleCreateService} />
          </div>
        }
      />

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="mt-6">
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
              totalItems={services.length}
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
