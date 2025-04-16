
import { ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { FileUp, X, CheckCircle, AlertCircle } from "lucide-react";

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  allowedTypes?: string[];
  maxSizeMB?: number;
  label?: string;
  className?: string;
  previewUrl?: string;
  accept?: string;
}

export function FileUploader({
  onFileUpload,
  allowedTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"],
  maxSizeMB = 5,
  label = "Upload File",
  className = "",
  previewUrl,
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const selectedFile = e.target.files[0];
    
    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(selectedFile.type)) {
      setError(`File type not supported. Please upload: ${allowedTypes.join(", ")}`);
      return;
    }
    
    // Check file size
    const fileSizeInMB = selectedFile.size / (1024 * 1024);
    if (fileSizeInMB > maxSizeMB) {
      setError(`File too large. Maximum size: ${maxSizeMB}MB`);
      return;
    }
    
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 300);
    
    try {
      // Replace with actual upload logic
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Call the callback function with the file
      onFileUpload(file);
      
      toast.success("File uploaded successfully");
      setProgress(100);
      
      // Reset after successful upload
      setTimeout(() => {
        setFile(null);
        setProgress(0);
      }, 1000);
    } catch (error) {
      toast.error("Failed to upload file");
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      clearInterval(interval);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setProgress(0);
    setError(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {!file ? (
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="dropzone-file"
            className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${
              error ? "border-red-300" : "border-gray-300"
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FileUp className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                {allowedTypes.join(", ")} (Max: {maxSizeMB}MB)
              </p>
              {error && (
                <p className="mt-2 text-sm text-red-500 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> {error}
                </p>
              )}
            </div>
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept={allowedTypes.join(",")}
            />
          </label>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="shrink-0 mr-3">
                {file.type.startsWith("image/") ? (
                  <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center overflow-hidden">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center">
                    <FileUp className="h-6 w-6 text-blue-600" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium truncate max-w-[200px]">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / (1024 * 1024)).toFixed(2)}MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="h-8 w-8 p-0"
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {progress > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-1" />
            </div>
          )}
          
          {!isUploading && progress === 0 && (
            <Button
              size="sm"
              className="w-full mt-2"
              onClick={handleUpload}
            >
              Upload
            </Button>
          )}
          
          {progress === 100 && (
            <div className="flex items-center text-green-600 text-sm mt-2">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>Upload complete</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
