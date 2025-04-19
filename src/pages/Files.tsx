import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Download,
  Trash,
  Info,
  Upload,
  Clock,
  FileText,
  FileImage,
  FileAudio,
  FileVideo,
  File as FileIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import EnhancedApiService from "@/services/EnhancedApiService";
import { toast } from "sonner";
import useApiQuery from "@/hooks/use-api-query";
import { DataFilters, FilterOption } from "@/components/common/DataFilters";
import useDebounce from "@/hooks/use-debounce";

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

const FileTypeIcon = ({ type }: { type: string }) => {
  switch (type.toLowerCase()) {
    case "image":
      return <FileImage className="h-4 w-4" />;
    case "audio":
      return <FileAudio className="h-4 w-4" />;
    case "video":
      return <FileVideo className="h-4 w-4" />;
    case "pdf":
      return <FileText className="h-4 w-4" />;
    default:
      return <FileIcon className="h-4 w-4" />;
  }
};

const Files = () => {
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [draggedFile, setDraggedFile] = useState<number | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  const mockFiles: FileItem[] = [
    {
      id: 1,
      name: "annual-report.pdf",
      type: "PDF",
      size: "2.4 MB",
      uploadedBy: "Alice Smith",
      uploadedAt: "2023-04-10",
      url: null,
    },
    {
      id: 2,
      name: "user-avatar.png",
      type: "Image",
      size: "156 KB",
      uploadedBy: "Bob Johnson",
      uploadedAt: "2023-04-09",
      url: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&q=80&w=500",
    },
    {
      id: 3,
      name: "data-export.csv",
      type: "CSV",
      size: "1.2 MB",
      uploadedBy: "Carol Davis",
      uploadedAt: "2023-04-08",
      url: null,
    },
    {
      id: 4,
      name: "product-photo.jpg",
      type: "Image",
      size: "1.8 MB",
      uploadedBy: "Dave Wilson",
      uploadedAt: "2023-04-07",
      url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=500",
    },
    {
      id: 5,
      name: "marketing-banner.png",
      type: "Image",
      size: "2.1 MB",
      uploadedBy: "Eve Brown",
      uploadedAt: "2023-04-06",
      url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=500",
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");

  // Debounce the search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const {
    data: fileData,
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
  } = useApiQuery<FileItem>({
    endpoint: "/api/file",
    queryKey: ["files", debouncedSearchTerm],
    initialPage: 0,
    initialPageSize: 10,
    persistFilters: true,
    onError: (err) => {
      console.error("Failed to fetch files:", err);
      toast.error("Failed to load files, using cached data", {
        description: "Could not connect to the server. Please try again later.",
      });
    },
    mockData: {
      content: mockFiles,
      totalElements: mockFiles.length,
      totalPages: 1,
      number: 0,
      size: 10,
    },
  });

  const filterOptions: FilterOption[] = [
    {
      id: "search",
      label: "Search",
      type: "search",
      placeholder: "Search roles...",
    },
    {
      id: "size",
      label: "File size",
      type: "select",
      options: [
        { value: "large", label: "Large (> 50MB)" },
        { value: "medium", label: "Medium (> 10MB)" },
        { value: "small", label: "Small (< 10MB)" },
      ],
    },
    {
      id: "type",
      label: "File type",
      type: "select",
      options: [
        { value: "image", label: "Image" },
        { value: "pdf", label: "PDF" },
        { value: "zip", label: "Zip" },
        { value: "other", label: "Others" },
      ],
    },
  ];

  const handleDragStart = (fileId: number) => {
    setDraggedFile(fileId);
    EnhancedApiService.logUserAction2("file_drag_started", { fileId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    // Handle file drops
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
    // Handle reordering (if draggedFile is set)
    else if (draggedFile !== null) {
      EnhancedApiService.logUserAction2("file_reordered", {
        fileId: draggedFile,
      });
      toast.success("File order updated");
    }

    setDraggedFile(null);
  };

  const handleFileUpload = (fileList: FileList) => {
    // Simulated optimistic UI update
    const newFiles: FileItem[] = [];

    setIsUploading(true);

    // Start progress simulation
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress > 100) {
        clearInterval(interval);
        setIsUploading(false);

        // Add mock files after "upload" completes
        for (let i = 0; i < fileList.length; i++) {
          const file = fileList[i];

          const newFile: FileItem = {
            id: Date.now() + i,
            name: file.name,
            type:
              file.type.split("/")[0].charAt(0).toUpperCase() +
              file.type.split("/")[0].slice(1),
            size: (file.size / 1024).toFixed(2) + " KB",
            uploadedBy: "Current User",
            uploadedAt: new Date().toLocaleDateString(),
            url: file.type.startsWith("image/")
              ? URL.createObjectURL(file)
              : null,
          };

          newFiles.push(newFile);
        }

        toast.success(`${fileList.length} file(s) uploaded successfully`);
        EnhancedApiService.logUserAction2("files_uploaded", {
          count: fileList.length,
        });
      }
      setUploadProgress(progress);
    }, 100);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  };

  const handleDeleteFile = (id: number) => {
    toast.success("File deleted successfully");
    EnhancedApiService.logUserAction2("file_deleted", { fileId: id });
  };

  const columns = [
    {
      header: "#",
      accessorKey: "id",
      cell: (item: FileItem) => (
        <span className="text-muted-foreground">{item.id}</span>
      ),
      sortable: true,
    },
    {
      header: "File Name",
      accessorKey: "name" as const,
      cell: (fileInfo) => {
        return (
          <div className="flex items-center space-x-2">
            <FileTypeIcon type={fileInfo.type} />
            <span>{fileInfo.name}</span>
          </div>
        );
      },
    },
    { header: "Type", accessorKey: "type" as const },
    { header: "Size", accessorKey: "size" as const },
    { header: "Uploaded By", accessorKey: "uploadedBy" as const },
    { header: "Upload Date", accessorKey: "uploadedAt" as const },
    {
      header: "Actions",
      accessorKey: "actions" as const,
      cell: (fileInfo) => {
        return (
          <div className="flex space-x-1">
            {fileInfo.type === "Image" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setPreviewFile(fileInfo);
                        EnhancedApiService.logUserAction2(
                          "file_preview_opened",
                          {
                            fileId: fileInfo.id,
                          }
                        );
                      }}
                      draggable
                      onDragStart={() => handleDragStart(fileInfo.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Preview Image</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      toast.info("Download started");
                      EnhancedApiService.logUserAction2(
                        "file_download_started",
                        {
                          fileId: fileInfo.id,
                        }
                      );
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download File</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteFile(fileInfo.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete File</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="h-4 w-4" />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">{fileInfo.name}</h4>
                  <div className="text-sm">
                    <p>
                      <span className="font-medium">Type:</span> {fileInfo.type}
                    </p>
                    <p>
                      <span className="font-medium">Size:</span> {fileInfo.size}
                    </p>
                    <p>
                      <span className="font-medium">Uploaded by:</span>{" "}
                      {fileInfo.uploadedBy}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span>{" "}
                      {fileInfo.uploadedAt}
                    </p>
                    <p>
                      <span className="font-medium">ID:</span> {fileInfo.id}
                    </p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        );
      },
    },
  ];

  const renderFileSkeletons = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 border-b">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      ));
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main
        className="flex-1 overflow-y-auto p-8"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <PageHeader title="Files" description="Manage uploaded files">
          <DataFilters
            filters={filters}
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
            className="mt-2"
          />
        </PageHeader>

        {isDraggingOver && (
          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center z-10 pointer-events-none">
            <div className="bg-background p-8 rounded-lg shadow-lg text-center">
              <Upload className="h-12 w-12 mx-auto text-primary" />
              <p className="text-lg font-medium mt-2">Drop files to upload</p>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full h-2" />
          </div>
        )}

        <div className="flex justify-end mb-4 mt-4">
          <div className="relative">
            <input
              type="file"
              id="file-upload"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileInputChange}
              multiple
            />
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Files
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <DataTable
            data={fileData}
            columns={columns}
            title="File Management"
            pagination={true}
            showAddButton={false}
            isLoading={isLoading}
            pageIndex={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            totalItems={totalItems}
          />
        </div>

        <Dialog
          open={!!previewFile}
          onOpenChange={(open) => !open && setPreviewFile(null)}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{previewFile?.name}</DialogTitle>
              <DialogDescription>
                {previewFile?.size} • Uploaded by {previewFile?.uploadedBy} on{" "}
                {previewFile?.uploadedAt}
              </DialogDescription>
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
