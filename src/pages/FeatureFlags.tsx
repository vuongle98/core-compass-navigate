
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
  Toggle 
} from "lucide-react";

interface FeatureFlag {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  environment: string;
  createdAt?: string;
  lastUpdated?: string;
  owner?: string;
  category?: string;
}

const FeatureFlags = () => {
  // Mock data
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([
    {
      id: 1,
      name: "new_dashboard",
      description: "Enable new dashboard interface",
      enabled: true,
      environment: "All",
      createdAt: "2025-03-15",
      lastUpdated: "2025-04-10",
      owner: "UI Team",
      category: "Interface"
    },
    {
      id: 2,
      name: "beta_features",
      description: "Enable beta features for testing",
      enabled: false,
      environment: "Development",
      createdAt: "2025-03-20",
      lastUpdated: "2025-04-05",
      owner: "Product Team",
      category: "Testing"
    },
    {
      id: 3,
      name: "advanced_analytics",
      description: "Enable advanced analytics module",
      enabled: true,
      environment: "Production",
      createdAt: "2025-02-18",
      lastUpdated: "2025-04-12",
      owner: "Analytics Team",
      category: "Analytics"
    },
    {
      id: 4,
      name: "ai_suggestions",
      description: "Enable AI-powered suggestions",
      enabled: false,
      environment: "All",
      createdAt: "2025-03-25",
      lastUpdated: "2025-04-08",
      owner: "AI Team",
      category: "AI & ML"
    },
    {
      id: 5,
      name: "dark_mode",
      description: "Enable dark mode UI theme",
      enabled: true,
      environment: "All",
      createdAt: "2025-03-10",
      lastUpdated: "2025-04-01",
      owner: "UI Team",
      category: "Interface"
    },
    {
      id: 6,
      name: "enhanced_security",
      description: "Enable additional security measures",
      enabled: true,
      environment: "Production",
      createdAt: "2025-02-28",
      lastUpdated: "2025-04-15",
      owner: "Security Team",
      category: "Security"
    },
  ]);

  const handleToggle = (id: number, currentValue: boolean) => {
    setFeatureFlags(prev => prev.map(flag => 
      flag.id === id ? { ...flag, enabled: !currentValue } : flag
    ));
    toast.success(
      `Feature flag ${id} ${currentValue ? "disabled" : "enabled"}`
    );
  };

  const columns = [
    {
      header: "#",
      accessorKey: "id",
      cell: (info: any) => <span className="text-muted-foreground">{info.getValue()}</span>
    },
    { 
      header: "Flag Name", 
      accessorKey: "name" as const,
      cell: (info: any) => (
        <div className="font-medium">{info.getValue()}</div>
      )
    },
    { 
      header: "Description", 
      accessorKey: "description" as const,
      cell: (info: any) => (
        <div className="max-w-xs truncate">{info.getValue()}</div>
      )
    },
    {
      header: "Status",
      accessorKey: "enabled" as const,
      cell: (flag: any) => (
        <Switch
          checked={flag.getValue()}
          onCheckedChange={() => handleToggle(flag.row.original.id, flag.getValue())}
          className="data-[state=checked]:bg-green-500"
        />
      ),
    },
    { 
      header: "Environment", 
      accessorKey: "environment" as const,
      cell: (info: any) => {
        const env = info.getValue();
        let bgColor = "bg-blue-100 text-blue-800";
        
        if (env === "Production") {
          bgColor = "bg-green-100 text-green-800";
        } else if (env === "Development") {
          bgColor = "bg-yellow-100 text-yellow-800";
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${bgColor}`}>
            {env}
          </span>
        );
      }
    },
    {
      header: "Category",
      accessorKey: "category" as const,
      cell: (info: any) => {
        const category = info.getValue();
        let icon = <Toggle className="mr-2 h-4 w-4" />;
        
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
      }
    },
    { header: "Last Updated", accessorKey: "lastUpdated" as const },
  ];

  const getEnabledCount = () => featureFlags.filter(flag => flag.enabled).length;
  const getPercentage = () => Math.round((getEnabledCount() / featureFlags.length) * 100);

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Enabled Features</CardTitle>
              <CardDescription>Out of {featureFlags.length} total</CardDescription>
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
              <CardTitle className="text-sm font-medium">Environment Distribution</CardTitle>
              <CardDescription>Flag distribution by environment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold">
                    {featureFlags.filter(f => f.environment.includes('All')).length}
                  </span>
                  <span className="text-xs text-muted-foreground">All</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold">
                    {featureFlags.filter(f => f.environment === 'Production').length}
                  </span>
                  <span className="text-xs text-muted-foreground">Production</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold">
                    {featureFlags.filter(f => f.environment === 'Development').length}
                  </span>
                  <span className="text-xs text-muted-foreground">Development</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
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

        <div className="mt-6">
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
                apiEndpoint="/api/featureFlag"
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default FeatureFlags;
