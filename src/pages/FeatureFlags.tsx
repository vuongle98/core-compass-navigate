import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Clock, Settings, Shield, ToggleLeft } from "lucide-react";
import { FeatureFlag } from "@/types/Configuration";
import { Column, FilterOption } from "@/types/Common";
import useApiQuery from "@/hooks/use-api-query";
import useDebounce from "@/hooks/use-debounce";
import DataFilters from "@/components/common/DataFilters";
import FeatureFlagService from "@/services/FeatureFlagService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDetailView } from "@/hooks/use-detail-view";
import { ActionsMenu, ActionType } from "@/components/common/ActionsMenu";

const FeatureFlags = () => {
  // Mock data
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([
    {
      id: 1,
      name: "new_dashboard",
      value: "true",
      type: "boolean",
      description: "Enable new dashboard interface",
      enabled: true,
      environment: "ALL",
      createdAt: "2025-03-15",
      updatedAt: "2025-04-10",
      category: "Interface",
    },
    {
      id: 2,
      name: "beta_features",
      value: "false",
      type: "boolean",
      description: "Enable beta features for testing",
      enabled: false,
      environment: "DEV",
      createdAt: "2025-03-20",
      updatedAt: "2025-04-05",
      category: "Testing",
    },
    {
      id: 3,
      name: "advanced_analytics",
      value: "true",
      type: "boolean",
      description: "Enable advanced analytics module",
      enabled: true,
      environment: "PROD",
      createdAt: "2025-02-18",
      updatedAt: "2025-04-12",
      category: "Analytics",
    },
    {
      id: 4,
      name: "ai_suggestions",
      value: "false",
      type: "boolean",
      description: "Enable AI-powered suggestions",
      enabled: false,
      environment: "DEV",
      createdAt: "2025-03-25",
      updatedAt: "2025-04-08",
      category: "AI & ML",
    },
    {
      id: 5,
      name: "dark_mode",
      value: "true",
      type: "boolean",
      description: "Enable dark mode UI theme",
      enabled: true,
      environment: "ALL",
      createdAt: "2025-03-10",
      updatedAt: "2025-04-01",
      category: "Interface",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingFeatureFlag, setEditingFeatureFlag] =
    useState<FeatureFlag | null>(null);

  const [formData, setFormData] = useState<Partial<FeatureFlag>>({
    name: "",
    description: "",
    value: "",
    enabled: true,
    environment: "ALL",
    category: "GENERAL",
  });

  const filterOptions: FilterOption<FeatureFlag>[] = [
    {
      id: "name",
      label: "Name",
      type: "text",
      placeholder: "Search by name",
    },
    {
      id: "enabled",
      label: "Enabled",
      type: "select",
      options: [
        { value: "true", label: "Enabled" },
        { value: "false", label: "Disabled" },
      ],
    },
    {
      id: "environment",
      label: "Environment",
      type: "select",
      options: [
        { value: "PROD", label: "Production" },
        { value: "DEV", label: "Development" },
      ],
    },
  ];

  // Setup for detail view modal
  const {
    selectedItem: selectedItem,
    isModalOpen: isDetailOpen,
    openDetail: openItemDetail,
    closeModal: closeItemDetail,
  } = useDetailView<FeatureFlag>({
    modalThreshold: 10,
  });

  const {
    data: featureFlagData,
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
  } = useApiQuery<FeatureFlag>({
    endpoint: "/api/featureFlag",
    queryKey: ["featureFlags", debouncedSearchTerm],
    initialPage: 0,
    initialPageSize: 10,
    persistFilters: true,
    onError: (err) => {
      console.error("Failed to fetch endpoint secure:", err);
      toast.error("Failed to load endpoint secure, using cached data", {
        description: "Could not connect to the server. Please try again later.",
      });
    },
    mockData: {
      content: featureFlags,
      totalElements: featureFlags.length,
      totalPages: 1,
      number: 0,
      size: 10,
    },
  });

  const handleToggle = async (item: FeatureFlag) => {
    try {
      await FeatureFlagService.toggle(item.id);
      toast.success(
        `Feature flag ${item.name} ${item.enabled ? "disabled" : "enabled"}`
      );

      // Reload the data after toggling
      refresh();
    } catch (error) {
      console.error("Failed to toggle feature flag:", error);
      toast.error("Failed to toggle feature flag. Please try again.");
    }
  };

  const getActionItems = (item: FeatureFlag) => {
    const actions: {
      type: ActionType;
      label: string;
      onClick: () => void;
      disabled?: boolean;
    }[] = [
      {
        type: "view" as ActionType,
        label: "View Details",
        onClick: () => openItemDetail(item),
      },
      {
        type: "edit" as ActionType,
        label: "Edit",
        onClick: () => openEditDialog(item),
      },
      {
        type: "delete" as ActionType,
        label: "Delete",
        onClick: () => handleDelete(item.id),
      },
    ];
    return actions;
  };

  const columns: Column<FeatureFlag>[] = [
    {
      header: "#",
      accessorKey: "id",
      cell: (item: FeatureFlag) => (
        <span className="text-muted-foreground">{item.id}</span>
      ),
    },
    {
      header: "Flag Name",
      accessorKey: "name",
      cell: (item: FeatureFlag) => (
        <div className="font-medium">{item.name}</div>
      ),
    },
    {
      header: "Value",
      accessorKey: "value",
      cell: (item: FeatureFlag) => (
        <div className="text-sm text-muted-foreground">{item.value}</div>
      ),
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: (item: FeatureFlag) => (
        <Badge variant="outline" className="text-xs">
          {item.type}
        </Badge>
      ),
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: (item: FeatureFlag) => (
        <div className="max-w-xs truncate">{item.description}</div>
      ),
    },
    {
      header: "Status",
      accessorKey: "enabled",
      cell: (item: FeatureFlag) => (
        <Switch
          checked={item.enabled}
          onCheckedChange={() => handleToggle(item)}
          className="data-[state=checked]:bg-green-500"
        />
      ),
    },
    {
      header: "Environment",
      accessorKey: "environment",
      cell: (item: FeatureFlag) => {
        const getEnvColor = (env: string) => {
          if (env === "All") {
            return "bg-gray-100 text-gray-800";
          } else if (env === "PROD") {
            return "bg-green-100 text-green-800";
          } else if (env === "DEV") {
            return "bg-yellow-100 text-yellow-800";
          }
          return "bg-blue-100 text-blue-800";
        };

        return (
          <div className="flex flex-wrap gap-1">
            <span
              key={item.environment}
              className={`px-2 py-1 rounded-full text-xs ${getEnvColor(
                item.environment
              )}`}
            >
              {item.environment}
            </span>
          </div>
        );
      },
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: (item: FeatureFlag) => {
        const category = item.category || "GENERAL";
        let icon = <ToggleLeft className="mr-2 h-4 w-4" />;

        if (category === "ANALYTICS") {
          icon = <BarChart3 className="mr-2 h-4 w-4" />;
        } else if (category === "Security") {
          icon = <Shield className="mr-2 h-4 w-4" />;
        } else if (category === "Interface") {
          icon = <Settings className="mr-2 h-4 w-4" />;
        }

        if (category == "REGIONAL") {
          icon = <Settings className="mr-2 h-4 w-4" />;
        }

        if (category == "SYSTEM") {
          icon = <Settings className="mr-2 h-4 w-4" />;
        }

        return (
          <div className="flex items-center">
            {icon}
            {category}
          </div>
        );
      },
    },
    // {
    //   header: "Updated At",
    //   accessorKey: "updatedAt",
    //   cell: (item: FeatureFlag) => item.updatedAt || "N/A",
    // },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (flag: FeatureFlag) => (
        <ActionsMenu actions={getActionItems(flag)} />
      ),
    },
  ];

  const getEnabledCount = () =>
    featureFlags.filter((flag) => flag.enabled).length;
  const getPercentage = () =>
    Math.round((getEnabledCount() / featureFlags.length) * 100);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openCreateDialog = () => {
    setEditingFeatureFlag(null);
    setFormData({
      name: "",
      description: "",
      value: "",
      enabled: true,
      environment: "ALL",
      category: "GENERAL",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (featureFlag: FeatureFlag) => {
    setEditingFeatureFlag(featureFlag);
    setFormData({
      name: featureFlag.name,
      description: featureFlag.description,
      value: featureFlag.value,
      enabled: featureFlag.enabled,
      environment: featureFlag.environment,
      category: featureFlag.category,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await FeatureFlagService.delete(id);

      setFeatureFlags((prev) => prev.filter((role) => role.id !== id));
      refresh(); // Changed from refetch to refresh
      toast.success("Role deleted successfully");
    } catch (error) {
      console.error("Delete operation failed:", error);
      toast.error("Failed to delete role");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingFeatureFlag) {
        await FeatureFlagService.update(
          editingFeatureFlag.id,
          formData as Partial<FeatureFlag>
        );

        setFeatureFlags((prev) =>
          prev.map((flag) =>
            flag.id === editingFeatureFlag.id ? { ...flag, ...formData } : flag
          )
        );

        toast.success("Feature flag updated successfully");
        refresh(); // Changed from refetch to refresh
      } else {
        const newFlag = await FeatureFlagService.create(formData);

        setFeatureFlags((prev) => [...prev, newFlag]);

        toast.success("Falg created successfully");
        refresh(); // Changed from refetch to refresh
      }

      setDialogOpen(false);
    } catch (error) {
      console.error("Falg operation failed:", error);
      toast.error(
        editingFeatureFlag ? "Failed to update flag" : "Failed to create flag"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <PageHeader
        title="Feature Flags"
        description="Toggle application features"
        // actions={
        //   <Button>
        //     <PlusCircle className="mr-2 h-4 w-4" />
        //     New Feature Flag
        //   </Button>
        // }
      />

      {/* <DataFilters
          filters={filters}
          options={filterOptions}
          onChange={setFilters}
          onReset={resetFilters}
          className="mt-4"
        /> */}

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
        className="mt-4"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Enabled Features
            </CardTitle>
            <CardDescription>
              Out of {featureFlags.length} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getEnabledCount()} ({getPercentage()}%)
            </div>
            <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${getPercentage()}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Environment Distribution
            </CardTitle>
            <CardDescription>Flag distribution by environment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold">
                  {
                    featureFlags.filter((f) => f.environment?.includes("All"))
                      .length
                  }
                </span>
                <span className="text-xs text-muted-foreground">All</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold">
                  {
                    featureFlags.filter((f) =>
                      f.environment?.includes("Production")
                    ).length
                  }
                </span>
                <span className="text-xs text-muted-foreground">
                  Production
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold">
                  {
                    featureFlags.filter((f) =>
                      f.environment?.includes("Development")
                    ).length
                  }
                </span>
                <span className="text-xs text-muted-foreground">
                  Development
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
            <CardDescription>Latest flag updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium leading-none">
                  enhanced_security enabled
                </p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium leading-none">
                  advanced_analytics updated
                </p>
                <p className="text-xs text-muted-foreground">Yesterday</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Feature Flag Management</CardTitle>
              {/* <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button> */}
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              data={featureFlagData}
              columns={columns}
              title=""
              pagination={true}
              showAddButton={true}
              onAddClick={openCreateDialog}
              isLoading={isLoading}
              pageIndex={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              totalItems={totalItems}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFeatureFlag
                ? "Edit feature flag"
                : "Create new feature flag"}
            </DialogTitle>
            <DialogDescription>
              {editingFeatureFlag
                ? "Make changes to the featue flag details below."
                : "Enter the details for the new feature flag."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Input name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: value,
                      value: value === "Boolean" ? "true" : "", // Reset value for Boolean
                    }))
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="String">String</SelectItem>
                    <SelectItem value="Integer">Integer</SelectItem>
                    <SelectItem value="Float">Float</SelectItem>
                    <SelectItem value="Boolean">Boolean</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="value">Value</Label>
                {formData.type === "Boolean" ? (
                  <Select
                    value={formData.value}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        value,
                      }))
                    }
                  >
                    <SelectTrigger id="value">
                      <SelectValue placeholder="Select value" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="value"
                    name="value"
                    type={
                      formData.type === "Integer" || formData.type === "Float"
                        ? "number"
                        : "text"
                    }
                    step={formData.type === "Float" ? "any" : undefined}
                    value={formData.value}
                    onChange={handleInputChange}
                    placeholder={`Enter ${formData.type?.toLowerCase()} value`}
                    required
                  />
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Feature flag description and permissions"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="environment">Environment</Label>
                <Select defaultValue="ALL">
                  <SelectTrigger id="environment">
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="DEV">Development</SelectItem>
                    <SelectItem value="PROD">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select defaultValue="GENERAL">
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">General</SelectItem>
                    <SelectItem value="REGIONAL">Regional</SelectItem>
                    <SelectItem value="SYSTEM">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Processing..."
                  : editingFeatureFlag
                  ? "Save Changes"
                  : "Create Feature flag"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeatureFlags;
