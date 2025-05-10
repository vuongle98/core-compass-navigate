import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { DataFilters } from "@/components/common/DataFilters";
import { ActionsMenu, ActionType } from "@/components/common/ActionsMenu";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { File as LucideFile } from "lucide-react";
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
import LoggingService from "@/services/LoggingService";
import { FileItem } from "@/types/Storage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FileService from "@/services/FileService";
import useApiQuery from "@/hooks/use-api-query";
import { DetailViewModal } from "@/components/ui/detail-view-modal";
import { useDetailView } from "@/hooks/use-detail-view";
import { FilterOption } from "@/types/Common";

// Define a type for filter values
interface QueryFilters {
  [key: string]: string | number | boolean | undefined;
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
        id: 1,
        name: "Document.pdf",
        size: 2.5,
        contentType: "pdf",
        extension: "pdf",
        createdAt: "2023-01-01",
        path: "/files/Document.pdf",
        updatedAt: "2023-01-01",
      },
      {
        id: 2,
        name: "Image.jpg",
        size: 1.2,
        extension: "jpg",
        contentType: "jpg",
        createdAt: "2023-02-15",
        path: "/files/Image.jpg",
        updatedAt: "2023-02-15",
      },
      {
        id: 3,
        name: "Presentation.pptx",
        size: 3.8,
        extension: "pptx",
        contentType: "pptx",
        createdAt: "2023-03-20",
        path: "/files/Presentation.pptx",
        updatedAt: "2023-03-20",
      },
    ];
    setFiles(mockFiles);
  }, []);

  // Use our custom API query hook
  const {
    data: filesData,
    isLoading,
    filters,
    setFilters,
    resetFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalItems,
    refresh,
  } = useApiQuery<FileItem>({
    endpoint: "/api/file",
    queryKey: ["files", searchTerm],
    initialPageSize: 10,
    persistFilters: true,
    mockData: {
      content: files,
      totalElements: 3,
      totalPages: 1,
      number: 0,
      size: 10,
    },
  });

  // Dropzone configuration
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach(async (uploadedFile) => {
        const filename = uploadedFile.name;
        const uploadDate = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD
        const newFile: FileItem = {
          id: 1000, // Generate a unique ID
          name: filename,
          size: uploadedFile.size / 1024, // Convert to KB
          contentType: uploadedFile.type.split("/")[1], // Extract file extension
          createdAt: uploadDate,
          path: URL.createObjectURL(uploadedFile), // Create a local URL for display
          extension: filename.split(".").pop() || "",
        };

        setFiles((prevFiles) => [...prevFiles, newFile]);
        toast.success(`${filename} uploaded successfully`);

        try {
          // Simulate API call to upload file
          // In a real app, you'd send the file to your server here
          // await apiService.uploadFile(file);
          LoggingService.logUserAction(
            "files",
            "upload",
            "File uploaded successfully",
            { filename, size: uploadedFile.size }
          );
        } catch (error) {
          console.error("File upload error:", error);
          toast.error(`Failed to upload ${filename}`);
        }
      });
    },
    [setFiles]
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  // Setup for detail view modal
  const {
    selectedItem: selectedItem,
    isModalOpen: isDetailOpen,
    openDetail: openItemDetail,
    closeModal: closeItemDetail,
  } = useDetailView<FileItem>({
    modalThreshold: 10,
  });

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
      LoggingService.logUserAction(
        "files",
        "delete",
        "File deleted successfully",
        { id: file.id, name: file.name }
      );
    } catch (error) {
      console.error("File delete error:", error);
      toast.error(`Failed to delete ${file.name}`);
    }
  };

  const handleViewFile = async (file: FileItem) => {
    openItemDetail(file);
  };

  const handleDownloadFile = async (file: FileItem) => {
    toast.success(`Downloading ${file.name}`);

    try {
      // Simulate API call to download file
      // In a real app, you'd trigger a download from your server
      // const blob = await apiService.downloadFile(file.id);
      LoggingService.logUserAction("files", "download", "File downloaded", {
        id: file.id,
        name: file.name,
      });

      // Create a temporary URL for the blob and trigger the download
      // const url = window.URL.createObjectURL(new Blob([blob.data]));
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', file.name);
      // document.body.appendChild(link);
      // link.click();
      // link.parentNode?.removeChild(link);

      // Download the file using FileService
      const blob = await FileService.downloadFile(file.id);

      console.log("Blob data:", blob);

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;

      // Append the link to the document and trigger the download
      document.body.appendChild(link);
      link.click();

      // Clean up the temporary link and URL
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

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
      LoggingService.logUserAction("files", "share", "File shared", {
        id: selectedFile.id,
        name: selectedFile.name,
        shareType,
      });
    } catch (error) {
      console.error("File share error:", error);
      toast.error(`Failed to share ${selectedFile.name}`);
    }
  };

  const columns = [
    {
      header: "#",
      accessorKey: "id",
      cell: (file: FileItem) => <span>{file.id}</span>,
      sortable: true,
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: (file: FileItem) => (
        <div className="flex items-center">
          <LucideFile className="mr-2 h-4 w-4" />
          <span className="truncate">
            {file.name.length > 10 ? file.name.slice(0, 20) + "..." : file.name}
          </span>
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
      header: "Extension",
      accessorKey: "extension",
      sortable: true,
    },
    {
      header: "Uploaded Date",
      accessorKey: "createdAt",
      sortable: true,
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (file: FileItem) => <ActionsMenu actions={getActionItems(file)} />,
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
        </PageHeader>
        <DataFilters
          filters={{ search: searchTerm }}
          options={filterOptions}
          onChange={(newFilters) => {
            setSearchTerm(newFilters.search as string);
            const updateSearchParams = (filters: QueryFilters) => {
              const params = new URLSearchParams();
              Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
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

        <div className="mt-4">
          <DataTable
            data={filesData}
            columns={columns}
            title="Files"
            pagination={true}
            pageIndex={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            totalItems={totalItems}
            isLoading={isLoading}
          />
        </div>

        {/* view file dialog */}
        {selectedItem && (
          <DetailViewModal
            isOpen={isDetailOpen}
            onClose={closeItemDetail}
            title="File Details"
            size="md"
            showCloseButton={false}
          >
            <div className="space-y-4">
              <div className="flex items-center">
                {selectedItem.contentType.startsWith("image/") ||
                  (["jpg", "png", "gif"].includes(selectedItem.extension) ? (
                    // Show image preview if the file is an image
                    <img
                      src={selectedItem.path}
                      alt={selectedItem.name}
                      className="mr-2 h-16 w-16 object-cover rounded"
                    />
                  ) : (
                    <LucideFile className="mr-2 h-4 w-4" />
                  ))}
              </div>
              <div>
                <h3 className="text-sm font-medium">Name</h3>
                <p className="mt-1">{selectedItem.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Extension</h3>
                <p className="mt-1">{selectedItem.extension}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Content type</h3>
                <p className="mt-1">{selectedItem.contentType}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Size</h3>
                <p className="mt-1">{selectedItem.size} KB</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Created At</h3>
                <p className="mt-1">{selectedItem.createdAt}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Updated At</h3>
                <p className="mt-1">{selectedItem.updatedAt}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Path</h3>
                <p className="mt-1">{selectedItem.path}</p>
              </div>
            </div>
          </DetailViewModal>
        )}

        {/* Share File Dialog - Replace the native select with Shadcn UI Select */}
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
                <div className="col-span-3">
                  <Select
                    value={shareType}
                    onValueChange={(value) => setShareType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select share type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsShareDialogOpen(false)}
              >
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
