import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { DataFilters, FilterOption } from "@/components/common/DataFilters";
import { ActionsMenu, ActionType } from "@/components/common/ActionsMenu";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { File as LucideFile, Download, Eye, Trash2, Share2 } from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSearchParams, useNavigate } from "react-router-dom";
import EnhancedApiService from "@/services/EnhancedApiService";

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  url: string;
}

const Files = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [shareType, setShareType] = useState("public");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Mock data
  useEffect(() => {
    // Simulate fetching files from an API
    const mockFiles: FileItem[] = [
      {
        id: "1",
        name: "Document.pdf",
        size: 2.5,
        type: "pdf",
        uploadDate: "2023-01-01",
        url: "/files/Document.pdf",
      },
      {
        id: "2",
        name: "Image.jpg",
        size: 1.2,
        type: "jpg",
        uploadDate: "2023-02-15",
        url: "/files/Image.jpg",
      },
      {
        id: "3",
        name: "Presentation.pptx",
        size: 3.8,
        type: "pptx",
        uploadDate: "2023-03-20",
        url: "/files/Presentation.pptx",
      },
    ];
    setFiles(mockFiles);
  }, []);

  // Dropzone configuration
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach(async (uploadedFile) => {
        const filename = uploadedFile.name;
        const uploadDate = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD
        const newFile: FileItem = {
          id: Date.now().toString(), // Generate a unique ID
          name: filename,
          size: uploadedFile.size / 1024, // Convert to KB
          type: uploadedFile.type.split("/")[1], // Extract file extension
          uploadDate: uploadDate,
          url: URL.createObjectURL(uploadedFile), // Create a local URL for display
        };

        setFiles((prevFiles) => [...prevFiles, newFile]);
        toast.success(`${filename} uploaded successfully`);

        try {
          // Simulate API call to upload file
          // In a real app, you'd send the file to your server here
          // await apiService.uploadFile(file);
          EnhancedApiService.logUserAction('files', 'upload', { filename, size: uploadedFile.size });
        } catch (error) {
          console.error("File upload error:", error);
          toast.error(`Failed to upload ${filename}`);
        }
      });
    },
    [setFiles]
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  // Filter options
  const filterOptions: FilterOption[] = [
    {
      id: "search",
      label: "Search",
      type: "search",
      placeholder: "Search files...",
    },
    {
      id: "type",
      label: "Type",
      type: "select",
      options: [
        { value: "pdf", label: "PDF" },
        { value: "jpg", label: "JPG" },
        { value: "pptx", label: "PPTX" },
      ],
    },
  ];

  // Actions for files
  const getActionItems = (file: FileItem) => {
    return [
      {
        type: "view" as ActionType,
        label: "View File",
        onClick: () => handleViewFile(file),
      },
      {
        type: "download" as ActionType,
        label: "Download File",
        onClick: () => handleDownloadFile(file),
      },
      {
        type: "share" as ActionType,
        label: "Share File",
        onClick: () => handleShareFile(file),
      },
      {
        type: "delete" as ActionType,
        label: "Delete File",
        onClick: () => handleDeleteFile(file),
      },
    ];
  };

  // Handle file operations
  const handleDeleteFile = async (file: FileItem) => {
    setFiles(files.filter((f) => f.id !== file.id));
    toast.success(`${file.name} deleted successfully`);

    try {
      // Simulate API call to delete file
      // In a real app, you'd call your API to delete the file from the server
      // await apiService.deleteFile(file.id);
      EnhancedApiService.logUserAction('files', 'delete', { id: file.id, name: file.name });
    } catch (error) {
      console.error("File delete error:", error);
      toast.error(`Failed to delete ${file.name}`);
    }
  };

  const handleViewFile = async (file: FileItem) => {
    toast.info(`Viewing ${file.name}`);

    try {
      // Simulate API call to view file
      // In a real app, you'd open the file in a new tab or display it in a viewer
      // await apiService.viewFile(file.id);
      EnhancedApiService.logUserAction('files', 'view', { id: file.id, name: file.name });
    } catch (error) {
      console.error("File view error:", error);
      toast.error(`Failed to view ${file.name}`);
    }
  };

  const handleDownloadFile = async (file: FileItem) => {
    toast.success(`Downloading ${file.name}`);

    try {
      // Simulate API call to download file
      // In a real app, you'd trigger a download from your server
      // const blob = await apiService.downloadFile(file.id);
      EnhancedApiService.logUserAction('files', 'download', { id: file.id, name: file.name });

      // Create a temporary URL for the blob and trigger the download
      // const url = window.URL.createObjectURL(new Blob([blob.data]));
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', file.name);
      // document.body.appendChild(link);
      // link.click();
      // link.parentNode?.removeChild(link);

      // If needed, handle blob.data here
    } catch (error) {
      console.error("File download error:", error);
      toast.error(`Failed to download ${file.name}`);
    }
  };

  const handleShareFile = async (file: FileItem) => {
    setSelectedFile(file);
    setIsShareDialogOpen(true);
  };

  const handleShareConfirm = async () => {
    if (!selectedFile) return;

    toast.success(`Sharing ${selectedFile.name} as ${shareType}`);
    setIsShareDialogOpen(false);

    try {
      // Simulate API call to share file
      // In a real app, you'd call your API to share the file with the selected options
      // await apiService.shareFile(selectedFile.id, shareType);
      EnhancedApiService.logUserAction('files', 'share', { id: selectedFile.id, name: selectedFile.name, shareType });
    } catch (error) {
      console.error("File share error:", error);
      toast.error(`Failed to share ${selectedFile.name}`);
    }
  };

  const columns = [
    {
      header: "Name",
      accessorKey: "name",
      cell: (file: FileItem) => (
        <div className="flex items-center">
          <LucideFile className="mr-2 h-4 w-4" />
          {file.name}
        </div>
      ),
      sortable: true,
    },
    {
      header: "Size",
      accessorKey: "size",
      cell: (file: FileItem) => <span>{file.size} KB</span>,
      sortable: true,
    },
    {
      header: "Type",
      accessorKey: "type",
      sortable: true,
    },
    {
      header: "Upload Date",
      accessorKey: "uploadDate",
      sortable: true,
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (file: FileItem) => (
        <ActionsMenu actions={getActionItems(file)} />
      ),
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Breadcrumbs items={[{ label: "Files", path: "/files" }]} />

        <PageHeader title="Files" description="Manage your files">
          <div {...getRootProps()} className="mt-4">
            <Input {...getInputProps()} id="upload" className="hidden" />
            <Label htmlFor="upload" className="cursor-pointer">
              <Button>Upload Files</Button>
            </Label>
          </div>

          <DataFilters
            filters={{ search: searchTerm }}
            options={filterOptions}
            onChange={(newFilters) => {
              setSearchTerm(newFilters.search as string);
              const updateSearchParams = (filters: ApiQueryFilters) => {
                const params = new URLSearchParams();
                Object.entries(filters).forEach(([key, value]) => {
                  if (value !== undefined && value !== null && value !== '') {
                    params.set(key, value.toString());
                  }
                });
                setSearchParams(params);
              };
              updateSearchParams(newFilters);
            }}
            onReset={() => {
              setSearchTerm("");
              setSearchParams({});
            }}
            className="mt-4"
          />
        </PageHeader>

        <div className="mt-4">
          <DataTable data={files} columns={columns} title="Files" />
        </div>

        {/* Share File Dialog */}
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share File</DialogTitle>
              <DialogDescription>
                Choose how you want to share this file.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="shareType" className="text-right">
                  Share Type
                </Label>
                <select
                  id="shareType"
                  className="col-span-3 rounded-md border border-gray-200 px-2 py-1"
                  value={shareType}
                  onChange={(e) => setShareType(e.target.value)}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsShareDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleShareConfirm}>
                Share
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Files;
