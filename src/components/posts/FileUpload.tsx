import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { validateFile } from "@/services/firebase/uploadService";
import { X } from "lucide-react";

interface FileUploadItem {
  file: File;
  previewUrl: string;
  id: string; // unique identifier
}

interface FileUploadProps {
  files: FileUploadItem[];
  onFilesChange: (files: FileUploadItem[]) => void;
  onUrlsChange: (urls: string[]) => void;
  accept?: string;
  maxSize?: number; // in MB
  maxFiles?: number;
  className?: string;
}

export function FileUpload({
  files,
  onFilesChange,
  onUrlsChange,
  accept = "image/*",
  maxSize = 10,
  maxFiles = 5,
  className,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const validatedFiles: FileUploadItem[] = [];

      for (const file of newFiles) {
        const validation = validateFile(file, maxSize);
        if (!validation.isValid) {
          console.error(
            `❌ Validation failed for ${file.name}: ${validation.error}`
          );
          alert(`File ${file.name}: ${validation.error}`);
          continue;
        }

        const previewUrl = URL.createObjectURL(file);
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        validatedFiles.push({
          file,
          previewUrl,
          id,
        });
      }

      const totalFiles = [...files, ...validatedFiles];

      if (totalFiles.length > maxFiles) {
        alert(`Chỉ được upload tối đa ${maxFiles} ảnh`);
        return;
      }

      onFilesChange(totalFiles);
      // Clear URLs since we're not uploading yet
      onUrlsChange([]);
    },
    [files, maxFiles, maxSize, onFilesChange, onUrlsChange]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      addFiles(newFiles);
    }
  };

  const removeFile = (index: number) => {
    const fileToRemove = files[index];

    // Revoke the object URL to free memory
    if (fileToRemove?.previewUrl) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }

    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
    onUrlsChange([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {files.length < maxFiles && (
        <Card
          className={cn(
            "border-2 border-dashed transition-colors cursor-pointer",
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-medium mb-2">Thêm hình ảnh món ăn</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Kéo thả hoặc click để chọn ảnh (tối đa {maxFiles} ảnh, mỗi ảnh
              dưới {maxSize}MB)
            </p>
            <div className="text-sm text-muted-foreground mb-4">
              Đã chọn: {files.length}/{maxFiles} ảnh
            </div>
            <div>
              <Input
                id="file-upload"
                type="file"
                multiple={maxFiles > 1}
                accept={accept}
                onChange={handleFileInput}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("file-upload")?.click()}
                className="px-6"
              >
                Chọn ảnh
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Files Preview Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {files.map((fileItem, index) => (
            <Card
              key={fileItem.id}
              className="relative group overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              <CardContent className="p-0">
                {/* Image Preview */}
                <div className="relative aspect-square">
                  <img
                    src={fileItem.previewUrl}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover border border-gray-200 dark:border-gray-700"
                  />

                  {/* Hover Overlay with Remove Button */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Success Check Icon */}
                </div>

                {/* File Info */}
                <div className="p-2">
                  <p className="text-xs text-muted-foreground truncate">
                    {fileItem.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(fileItem.file.size)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add More Button */}
      {files.length > 0 && files.length < maxFiles && (
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById("file-upload")?.click()}
          className="w-full"
        >
          Thêm ảnh ({files.length}/{maxFiles})
        </Button>
      )}
    </div>
  );
}
