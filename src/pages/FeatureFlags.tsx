import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
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
import {
  BarChart3,
  Clock,
  Filter,
  PlusCircle,
  Settings,
  Shield,
  ToggleLeft,
} from "lucide-react";
import { FeatureFlag } from "@/types/Configuration";

const FeatureFlags = () => {
  // Mock data
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([
    {
      id: 1,
      key: "new_dashboard",
      value: "true",
      type: "boolean",
      description: "Enable new dashboard interface",
      enabled: true,
      environments: ["All"],
      createdAt: "2025-03-15",
      lastUpdated: "2025-04-10",
      group: "Interface",
    },
    {
      id: 2,
      key: "beta_features",
      value: "false",
      type: "boolean",
      description: "Enable beta features for testing",
      enabled: false,
      environments: ["Development"],
      createdAt: "2025-03-20",
      lastUpdated: "2025-04-05",
      group: "Testing",
    },
    {
      id: 3,
      key: "advanced_analytics",
      value: "true",
      type: "boolean",
      description: "Enable advanced analytics module",
      enabled: true,
      environments: ["Production"],
      createdAt: "2025-02-18",
      lastUpdated: "2025-04-12",
      group: "Analytics",
    },
    {
      id: 4,
      key: "ai_suggestions",
      value: "false",
      type: "boolean",
      description: "Enable AI-powered suggestions",
      enabled: false,
      environments: ["All"],
      createdAt: "2025-03-25",
      lastUpdated: "2025-04-08",
      group: "AI & ML",
    },
    {
      id: 5,
      key: "dark_mode",
      value: "true",
      type: "boolean",
      description: "Enable dark mode UI theme",
      enabled: true,
      environments: ["All"],
      createdAt: "2025-03-10",
      lastUpdated: "2025-04-01",
      group: "Interface",
    },
  ]);

  const handleToggle = (id: number, currentValue: boolean) => {
    setFeatureFlags((prev) =>
      prev.map((flag) =>
        flag.id === id ? { ...flag, enabled: !currentValue } : flag
      )
    );
    toast.success(
      `Feature flag ${id} ${currentValue ? "disabled" : "enabled"}`
    );
  };

  const columns = [
    {
      header: "#",
      accessorKey: "id",
      cell: (item: FeatureFlag) => (
        <span className="text-muted-foreground">{item.id}</span>
      ),
    },
    {
      header: "Flag Name",
      accessorKey: "name" as const,
      cell: (item: FeatureFlag) => (
        <div className="font-medium">{item.key}</div>
      ),
    },
    {
      header: "Value",
      accessorKey: "value" as const,
      cell: (item: FeatureFlag) => (
        <div className="text-sm text-muted-foreground">{item.value}</div>
      ),
    },
    {
      header: "Type",
      accessorKey: "type" as const,
      cell: (item: FeatureFlag) => (
        <Badge variant="outline" className="text-xs">
          {item.type}
        </Badge>
      ),
    },
    {
      header: "Description",
      accessorKey: "description" as const,
      cell: (item: FeatureFlag) => (
        <div className="max-w-xs truncate">{item.description}</div>
      ),
    },
    {
      header: "Status",
      accessorKey: "enabled" as const,
      cell: (item: FeatureFlag) => (
        <Switch
          checked={item.enabled}
          onCheckedChange={() => handleToggle(item.id, item.enabled)}
          className="data-[state=checked]:bg-green-500"
        />
      ),
    },
    {
      header: "Environment",
      accessorKey: "environment" as const,
      cell: (item: FeatureFlag) => {
        const envs = item.environments;

        const getEnvColor = (env: string) => {
          if (env === "All") {
            return "bg-gray-100 text-gray-800";
          } else if (env === "Production") {
            return "bg-green-100 text-green-800";
          } else if (env === "Development") {
            return "bg-yellow-100 text-yellow-800";
          }
          return "bg-blue-100 text-blue-800";
        };

        return envs.map((env) => (
          <span
            key={env}
            className={`px-2 py-1 rounded-full text-xs ${getEnvColor}`}
          >
            {env}
          </span>
        ));
      },
    },
    {
      header: "Category",
      accessorKey: "category" as const,
      cell: (item: FeatureFlag) => {
        const category = item.group || "General";
        let icon = <ToggleLeft className="mr-2 h-4 w-4" />;

        if (category === "Analytics") {
          icon = <BarChart3 className="mr-2 h-4 w-4" />;
        } else if (category === "Security") {
          icon = <Shield className="mr-2 h-4 w-4" />;
        } else if (category === "Interface") {
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
    { header: "Last Updated", accessorKey: "lastUpdated" as const },
  ];

  const getEnabledCount = () =>
    featureFlags.filter((flag) => flag.enabled).length;
  const getPercentage = () =>
    Math.round((getEnabledCount() / featureFlags.length) * 100);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader
          title="Feature Flags"
          description="Toggle application features"
          actions={
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Feature Flag
            </Button>
          }
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
              <CardDescription>
                Flag distribution by environment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold">
                    {
                      featureFlags.filter((f) => f.environments.includes("All"))
                        .length
                    }
                  </span>
                  <span className="text-xs text-muted-foreground">All</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold">
                    {
                      featureFlags.filter((f) =>
                        f.environments.includes("Production")
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
                        f.environments.includes("Development")
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
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={featureFlags}
                columns={columns}
                title=""
                pagination={true}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default FeatureFlags;
