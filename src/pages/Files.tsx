import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface FileItem {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  url?: string;
  actions?: string;
}

const Files = () => {
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  
  const files: FileItem[] = [
    { 
      id: 1, 
      name: "annual-report.pdf", 
      type: "PDF", 
      size: "2.4 MB",
      uploadedBy: "Alice Smith",
      uploadedAt: "2023-04-10",
      url: null
    },
    { 
      id: 2, 
      name: "user-avatar.png", 
      type: "Image", 
      size: "156 KB",
      uploadedBy: "Bob Johnson",
      uploadedAt: "2023-04-09",
      url: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&q=80&w=500"
    },
    { 
      id: 3, 
      name: "data-export.csv", 
      type: "CSV", 
      size: "1.2 MB",
      uploadedBy: "Carol Davis",
      uploadedAt: "2023-04-08",
      url: null
    },
    { 
      id: 4, 
      name: "product-photo.jpg", 
      type: "Image", 
      size: "1.8 MB",
      uploadedBy: "Dave Wilson",
      uploadedAt: "2023-04-07",
      url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=500"
    },
    { 
      id: 5, 
      name: "marketing-banner.png", 
      type: "Image", 
      size: "2.1 MB",
      uploadedBy: "Eve Brown",
      uploadedAt: "2023-04-06",
      url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=500"
    },
  ];

  const columns = [
    { header: "File Name", accessorKey: "name" as const },
    { header: "Type", accessorKey: "type" as const },
    { header: "Size", accessorKey: "size" as const },
    { header: "Uploaded By", accessorKey: "uploadedBy" as const },
    { header: "Upload Date", accessorKey: "uploadedAt" as const },
    {
      header: "Actions",
      accessorKey: "actions" as const,
      cell: ({ row }) => {
        const file = row.original;
        if (file.type === "Image") {
          return (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setPreviewFile(file)}
              title="Preview Image"
            >
              <Eye className="h-4 w-4" />
            </Button>
          );
        }
        return null;
      },
    },
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

        <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{previewFile?.name}</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center p-2">
              {previewFile?.url ? (
                <img 
                  src={previewFile.url} 
                  alt={previewFile.name} 
                  className="max-h-[70vh] object-contain rounded-md"
                />
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  No preview available
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Files;
