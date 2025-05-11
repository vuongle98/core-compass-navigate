import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/common/FileUploader";
import { toast } from "sonner";
import {
  Archive,
  Download,
  FileImage,
  FileText,
  Grid,
  List,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface MediaFile {
  id: number;
  name: string;
  type: string;
  size: string;
  url: string;
  dateUploaded: string;
}

const Media = () => {
  const [files, setFiles] = useState<MediaFile[]>([
    {
      id: 1,
      name: "banner-image.jpg",
      type: "image/jpeg",
      size: "2.4 MB",
      url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      dateUploaded: "2023-04-15",
    },
    {
      id: 2,
      name: "product-catalog.pdf",
      type: "application/pdf",
      size: "5.1 MB",
      url: "/documents/catalog.pdf",
      dateUploaded: "2023-04-10",
    },
    {
      id: 3,
      name: "logo.png",
      type: "image/png",
      size: "0.8 MB",
      url: "https://images.unsplash.com/photo-1518770660439-4636190af475",
      dateUploaded: "2023-03-22",
    },
    {
      id: 4,
      name: "presentation.pptx",
      type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      size: "3.2 MB",
      url: "/documents/presentation.pptx",
      dateUploaded: "2023-03-15",
    },
    {
      id: 5,
      name: "data-report.csv",
      type: "text/csv",
      size: "1.1 MB",
      url: "/documents/report.csv",
      dateUploaded: "2023-03-05",
    },
    {
      id: 6,
      name: "team-photo.jpg",
      type: "image/jpeg",
      size: "3.7 MB",
      url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
      dateUploaded: "2023-02-28",
    },
  ]);

  const [view, setView] = useState<"grid" | "list">("grid");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);

  const handleFileUpload = (file: File) => {
    // In a real app, this would upload to a server and return a URL
    const newFile: MediaFile = {
      id: files.length + 1,
      name: file.name,
      type: file.type,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      url: URL.createObjectURL(file),
      dateUploaded: new Date().toISOString().split("T")[0],
    };

    setFiles([newFile, ...files]);
    setIsUploadModalOpen(false);
    toast.success(`File ${file.name} uploaded successfully`);
  };

  const handleFileSelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedFiles((prev) => [...prev, id]);
    } else {
      setSelectedFiles((prev) => prev.filter((fileId) => fileId !== id));
    }
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map((file) => file.id));
    }
  };

  const handleDelete = () => {
    if (selectedFiles.length === 0) {
      toast.error("No files selected");
      return;
    }

    setFiles((prevFiles) =>
      prevFiles.filter((file) => !selectedFiles.includes(file.id))
    );

    toast.success(`${selectedFiles.length} files deleted`);
    setSelectedFiles([]);
  };

  const handleArchive = () => {
    if (selectedFiles.length === 0) {
      toast.error("No files selected");
      return;
    }

    toast.success(`${selectedFiles.length} files archived`);
    setSelectedFiles([]);
  };

  const handleDownload = () => {
    if (selectedFiles.length === 0) {
      toast.error("No files selected");
      return;
    }

    toast.success(`Downloading ${selectedFiles.length} files`);
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fileTypeIcon = (type: string) => {
    if (type.startsWith("image/"))
      return <FileImage className="h-8 w-8 text-blue-500" />;
    if (type.includes("pdf"))
      return <FileText className="h-8 w-8 text-red-500" />;
    if (type.includes("spreadsheet") || type.includes("csv"))
      return <FileText className="h-8 w-8 text-green-500" />;
    if (type.includes("presentation"))
      return <FileText className="h-8 w-8 text-yellow-500" />;
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <PageHeader
        title="Media Library"
        description="Manage your media files"
        actions={
          <div className="flex space-x-2">
            {selectedFiles.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete ({selectedFiles.length})
                </Button>
                <Button variant="outline" size="sm" onClick={handleArchive}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </>
            )}
            <Button onClick={() => setIsUploadModalOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Files
            </Button>
          </div>
        }
      />

      <div className="mt-4">
        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all">All Files</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search files..."
                  className="pl-8 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex border rounded-md">
                <Button
                  variant={view === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-r-none"
                  onClick={() => setView("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={view === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-l-none"
                  onClick={() => setView("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            {filteredFiles.length > 0 ? (
              <>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={
                        selectedFiles.length === filteredFiles.length &&
                        filteredFiles.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all files"
                      className={
                        selectedFiles.length > 0 &&
                        selectedFiles.length < filteredFiles.length
                          ? "opacity-70"
                          : ""
                      }
                    />
                    <span className="text-sm text-muted-foreground">
                      {selectedFiles.length === 0
                        ? `${filteredFiles.length} files`
                        : `${selectedFiles.length} of ${filteredFiles.length} files selected`}
                    </span>
                  </div>
                </div>

                {view === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredFiles.map((file) => (
                      <Card
                        key={file.id}
                        className={`overflow-hidden ${
                          selectedFiles.includes(file.id)
                            ? "ring-2 ring-primary"
                            : ""
                        }`}
                      >
                        <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
                          {file.type.startsWith("image/") ? (
                            <img
                              src={file.url}
                              alt={file.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              {fileTypeIcon(file.type)}
                            </div>
                          )}
                          <Checkbox
                            checked={selectedFiles.includes(file.id)}
                            onCheckedChange={(checked) =>
                              handleFileSelect(file.id, !!checked)
                            }
                            className="absolute top-2 left-2"
                          />
                        </div>
                        <CardContent className="p-3">
                          <div className="truncate font-medium text-sm">
                            {file.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {file.size}
                          </div>
                        </CardContent>
                        <CardFooter className="p-3 pt-0 flex justify-between text-xs text-muted-foreground">
                          <span>{file.dateUploaded}</span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-md divide-y">
                    {filteredFiles.map((file) => (
                      <div
                        key={file.id}
                        className={`flex items-center p-3 hover:bg-muted/50 ${
                          selectedFiles.includes(file.id) ? "bg-muted/30" : ""
                        }`}
                      >
                        <Checkbox
                          checked={selectedFiles.includes(file.id)}
                          onCheckedChange={(checked) =>
                            handleFileSelect(file.id, !!checked)
                          }
                          className="mr-3"
                        />
                        <div className="mr-3">
                          {file.type.startsWith("image/") ? (
                            <div className="h-10 w-10 rounded bg-gray-100 overflow-hidden">
                              <img
                                src={file.url}
                                alt={file.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                              {fileTypeIcon(file.type)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="truncate font-medium">
                            {file.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {file.size} • {file.dateUploaded}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-64 border rounded-md">
                <div className="text-center">
                  <FileImage className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-medium text-lg mb-1">No files found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm
                      ? "No results match your search"
                      : "Upload files to get started"}
                  </p>
                  {searchTerm && (
                    <Button
                      variant="link"
                      onClick={() => setSearchTerm("")}
                      className="mt-4"
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Similar content for other tabs */}
          <TabsContent value="images">
            {/* Images tab content */}
            <div className="flex items-center justify-center h-64 border rounded-md">
              <p className="text-center text-muted-foreground">
                Image files will be displayed here.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="documents">
            {/* Documents tab content */}
            <div className="flex items-center justify-center h-64 border rounded-md">
              <p className="text-center text-muted-foreground">
                Document files will be displayed here.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="other">
            {/* Other tab content */}
            <div className="flex items-center justify-center h-64 border rounded-md">
              <p className="text-center text-muted-foreground">
                Other file types will be displayed here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <FileUploader
              onFileUpload={handleFileUpload}
              allowedTypes={[
                "image/jpeg",
                "image/png",
                "image/gif",
                "application/pdf",
                "text/csv",
                "application/vnd.ms-excel",
              ]}
              maxSizeMB={10}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Media;
