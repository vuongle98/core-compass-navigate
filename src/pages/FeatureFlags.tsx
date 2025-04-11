
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";

const FeatureFlags = () => {
  // Mock data
  const featureFlags = [
    { 
      id: 1, 
      name: "new_dashboard", 
      description: "Enable new dashboard interface", 
      enabled: true,
      environment: "All"
    },
    { 
      id: 2, 
      name: "beta_features", 
      description: "Enable beta features for testing", 
      enabled: false,
      environment: "Development"
    },
    { 
      id: 3, 
      name: "advanced_analytics", 
      description: "Enable advanced analytics module", 
      enabled: true,
      environment: "Production"
    },
    { 
      id: 4, 
      name: "ai_suggestions", 
      description: "Enable AI-powered suggestions", 
      enabled: false,
      environment: "All"
    },
  ];

  const handleToggle = (id: number, currentValue: boolean) => {
    toast.success(`Feature flag ${id} ${currentValue ? "disabled" : "enabled"}`);
  };

  const columns = [
    { header: "Flag Name", accessorKey: "name" },
    { header: "Description", accessorKey: "description" },
    { 
      header: "Status", 
      accessorKey: "enabled",
      cell: (flag) => (
        <Switch 
          checked={flag.enabled} 
          onCheckedChange={() => handleToggle(flag.id, flag.enabled)} 
        />
      )
    },
    { header: "Environment", accessorKey: "environment" },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader 
          title="Feature Flags" 
          description="Toggle application features"
        />
        
        <div className="mt-6">
          <DataTable data={featureFlags} columns={columns} title="Feature Flag Management" />
        </div>
      </main>
    </div>
  );
};

export default FeatureFlags;
