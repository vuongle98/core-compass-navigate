
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";

const Configuration = () => {
  // Mock data
  const configurations = [
    { 
      id: 1, 
      key: "SYSTEM_NAME", 
      value: "Core Application", 
      type: "String",
      lastModified: "2023-03-15",
      environment: "All"
    },
    { 
      id: 2, 
      key: "MAX_FILE_SIZE", 
      value: "5242880", 
      type: "Number",
      lastModified: "2023-03-20",
      environment: "All"
    },
    { 
      id: 3, 
      key: "SMTP_SERVER", 
      value: "smtp.example.com", 
      type: "String",
      lastModified: "2023-04-01",
      environment: "Production"
    },
    { 
      id: 4, 
      key: "DEBUG_MODE", 
      value: "true", 
      type: "Boolean",
      lastModified: "2023-04-05",
      environment: "Development"
    },
  ];

  const columns = [
    { header: "Key", accessorKey: "key" },
    { header: "Value", accessorKey: "value" },
    { header: "Type", accessorKey: "type" },
    { header: "Last Modified", accessorKey: "lastModified" },
    { header: "Environment", accessorKey: "environment" },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader 
          title="Configuration" 
          description="System configuration parameters"
        />
        
        <div className="mt-6">
          <DataTable data={configurations} columns={columns} title="Configuration Management" />
        </div>
      </main>
    </div>
  );
};

export default Configuration;
