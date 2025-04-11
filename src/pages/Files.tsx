
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";

const Files = () => {
  // Mock data
  const files = [
    { 
      id: 1, 
      name: "annual-report.pdf", 
      type: "PDF", 
      size: "2.4 MB",
      uploadedBy: "Alice Smith",
      uploadedAt: "2023-04-10"
    },
    { 
      id: 2, 
      name: "user-avatar.png", 
      type: "Image", 
      size: "156 KB",
      uploadedBy: "Bob Johnson",
      uploadedAt: "2023-04-09"
    },
    { 
      id: 3, 
      name: "data-export.csv", 
      type: "CSV", 
      size: "1.2 MB",
      uploadedBy: "Carol Davis",
      uploadedAt: "2023-04-08"
    },
  ];

  const columns = [
    { header: "File Name", accessorKey: "name" as const },
    { header: "Type", accessorKey: "type" as const },
    { header: "Size", accessorKey: "size" as const },
    { header: "Uploaded By", accessorKey: "uploadedBy" as const },
    { header: "Upload Date", accessorKey: "uploadedAt" as const },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader 
          title="Files" 
          description="Manage uploaded files"
        />
        
        <div className="mt-6">
          <DataTable data={files} columns={columns} title="File Management" />
        </div>
      </main>
    </div>
  );
};

export default Files;
