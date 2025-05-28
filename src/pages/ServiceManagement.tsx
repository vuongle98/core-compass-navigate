
import React, { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { DataFilters } from "@/components/common/DataFilters";
import { ServiceDetailDialog } from "@/components/services/ServiceDetailDialog";
import { CreateServiceDialog } from "@/components/services/CreateServiceDialog";
import { ServiceStatusBadge } from "@/components/services/ServiceStatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Square, RefreshCw, Eye, Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ServiceManagementService from "@/services/ServiceManagementService";
import { Service, ServiceCreateRequest } from "@/types/Service";
import { Column } from "@/types/Common";
import { FilterOption } from "@/types/Common";

const ServiceManagement = () => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [currentTab, setCurrentTab] = useState("all");
  const queryClient = useQueryClient();

  const { data: services = [], isLoading, refetch } = useQuery({
    queryKey: ["services", filters, currentTab],
    queryFn: async () => {
      const statusFilter = currentTab !== "all" ? { status: currentTab } : {};
      return ServiceManagementService.getServices({
        ...filters,
        ...statusFilter,
      });
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: (data: ServiceCreateRequest) => ServiceManagementService.createService(data),
    onSuccess: () => {
      toast.success("Service created successfully");
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: () => {
      toast.error("Failed to create service");
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: string }) =>
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
    setSelectedService(service);
    setDetailDialogOpen(true);
  };

  const handleStartService = async (service: Service) => {
    updateServiceMutation.mutate({ id: service.id, action: "start" });
  };

  const handleStopService = async (service: Service) => {
    updateServiceMutation.mutate({ id: service.id, action: "stop" });
  };

  const handleRestartService = async (service: Service) => {
    updateServiceMutation.mutate({ id: service.id, action: "restart" });
  };

  const handleEditService = (service: Service) => {
    // Navigate to edit page or open edit dialog
    console.log("Edit service:", service);
  };

  const handleDeleteService = async (service: Service) => {
    if (window.confirm(`Are you sure you want to delete ${service.name}?`)) {
      deleteServiceMutation.mutate(service.id);
    }
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
      cell: (service: Service) => <ServiceStatusBadge status={service.status} />,
    },
    {
      header: "Description",
      accessorKey: "description",
    },
    {
      header: "Created At",
      accessorKey: "createdAt",
      cell: (service: Service) => new Date(service.createdAt).toLocaleDateString(),
    },
  ];

  const actions = [
    {
      type: "view" as const,
      label: "View Details",
      onClick: handleViewService,
    },
    {
      type: "edit" as const,
      label: "Edit",
      onClick: handleEditService,
    },
    {
      type: "danger" as const,
      label: "Start",
      onClick: handleStartService,
      condition: (service: Service) => service.status === "stopped",
    },
    {
      type: "danger" as const,
      label: "Stop",
      onClick: handleStopService,
      condition: (service: Service) => service.status === "running",
    },
    {
      type: "danger" as const,
      label: "Restart",
      onClick: handleRestartService,
      condition: (service: Service) => service.status === "running",
    },
    {
      type: "danger" as const,
      label: "Delete",
      onClick: handleDeleteService,
    },
  ];

  const filterOptions: FilterOption[] = [
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
    <div className="flex min-h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader
          title="Service Management"
          description="Manage and monitor your services"
          actions={
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <CreateServiceDialog
                onSubmit={(data) => createServiceMutation.mutateAsync(data)}
              />
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

          <TabsContent value={currentTab} className="mt-6">
            <div className="space-y-6">
              <DataFilters
                filters={filters}
                onFiltersChange={setFilters}
                filterOptions={filterOptions}
              />

              <DataTable
                data={services}
                columns={columns}
                actions={actions}
                isLoading={isLoading}
              />
            </div>
          </TabsContent>
        </Tabs>

        {selectedService && (
          <ServiceDetailDialog
            service={selectedService}
            open={detailDialogOpen}
            onOpenChange={setDetailDialogOpen}
          />
        )}
      </main>
    </div>
  );
};

export default ServiceManagement;
