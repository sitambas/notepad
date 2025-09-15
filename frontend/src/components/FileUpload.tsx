import React, { useCallback, useState } from "react";
import { Upload, X, File, Download, Trash2, Image, FileText, FileSpreadsheet, Presentation, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface FileUploadProps {
  onFilesUploaded: (files: File[]) => void;
  uploadedFiles: File[];
  onFileRemove: (index: number) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesUploaded,
  uploadedFiles,
  onFileRemove,
  isOpen,
  onOpenChange,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  // File type restrictions
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(`File type not supported: ${file.name}`);
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File too large: ${file.name} (max 5MB)`);
      return false;
    }

    return true;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      const validFiles = files.filter(validateFile);
      if (validFiles.length > 0) {
        onFilesUploaded(validFiles);
        toast.success(`${validFiles.length} file(s) uploaded successfully`);
      }
    },
    [onFilesUploaded]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const validFiles = files.filter(validateFile);
      if (validFiles.length > 0) {
        onFilesUploaded(validFiles);
        toast.success(`${validFiles.length} file(s) uploaded successfully`);
      }
    },
    [onFilesUploaded]
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.includes("image")) return <Image className="h-5 w-5 text-blue-500" />;
    if (type.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />;
    if (type.includes("word") || type.includes("document")) return <FileText className="h-5 w-5 text-blue-600" />;
    if (type.includes("excel") || type.includes("spreadsheet")) return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    if (type.includes("powerpoint") || type.includes("presentation")) return <Presentation className="h-5 w-5 text-orange-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const getFileTypeName = (file: File) => {
    const type = file.type;
    if (type.includes("image")) return "Image";
    if (type.includes("pdf")) return "PDF";
    if (type.includes("word") || type.includes("document")) return "Word Document";
    if (type.includes("excel") || type.includes("spreadsheet")) return "Excel Spreadsheet";
    if (type.includes("powerpoint") || type.includes("presentation")) return "PowerPoint Presentation";
    return "File";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Files
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop files here, or click to select
            </p>
            <Button
              variant="outline"
              onClick={() => {
                const fileInput = document.getElementById("file-input");
                if (fileInput) fileInput.click();
              }}
            >
              Choose Files
            </Button>
            <input
              id="file-input"
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="mt-4 text-xs text-muted-foreground">
              <p>Max file size: 5MB</p>
              <p>Supported formats: JPEG, PNG, WebP, PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileUpload;