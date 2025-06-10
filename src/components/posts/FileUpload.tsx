import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  uploadFile,
  validateFile,
  UploadProgress,
  UploadResult,
} from "@/services/firebase/uploadService";

interface FileUploadItem {
  file: File;
  progress?: UploadProgress;
  result?: UploadResult;
  previewUrl?: string;
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
  maxFiles = 1,
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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    },
    [maxFiles, maxSize, onFilesChange]
  );

  const addFiles = useCallback(
    async (newFiles: File[]) => {
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

        validatedFiles.push({
          file,
          previewUrl,
        });
      }

      const totalFiles =
        maxFiles === 1 ? validatedFiles : [...files, ...validatedFiles];

      if (totalFiles.length > maxFiles) {
        alert(`Chỉ được upload tối đa ${maxFiles} ảnh`);
        return;
      }

      onFilesChange(totalFiles);

      if (validatedFiles.length > 0) {
        await uploadFiles(validatedFiles, totalFiles);
      }
    },
    [files, maxFiles, maxSize, onFilesChange]
  );

  const uploadFiles = useCallback(
    async (
      fileItems: FileUploadItem[],
      currentFilesList?: FileUploadItem[]
    ) => {
      const currentFiles = [...(currentFilesList || files)];

      for (const fileItem of fileItems) {
        const fileIndex = currentFiles.findIndex(
          (item) => item.file === fileItem.file
        );

        if (fileIndex === -1) {
          console.error(" File not found in current files array");
          continue;
        }

        try {
          const result = await uploadFile(
            fileItem.file,
            "posts",
            (progress) => {
              currentFiles[fileIndex] = {
                ...currentFiles[fileIndex],
                progress,
              };
              onFilesChange([...currentFiles]);
            }
          );

          currentFiles[fileIndex] = { ...currentFiles[fileIndex], result };
          onFilesChange([...currentFiles]);
        } catch (error) {
          console.error(` Upload failed for ${fileItem.file.name}:`, error);
          currentFiles[fileIndex] = {
            ...currentFiles[fileIndex],
            progress: { progress: 0, status: "error" },
          };
          onFilesChange([...currentFiles]);
        }
      }

      const allUrls = currentFiles
        .filter((item) => item.result)
        .map((item) => item.result!.url);
      onUrlsChange(allUrls);
    },
    [files, onFilesChange, onUrlsChange]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      addFiles(newFiles);
    }
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
      {files.length === 0 && (
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
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Chọn một tệp hoặc kéo và thả ở đây
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Bạn nên sử dụng tập tin .jpg chất lượng cao có kích thước dưới{" "}
              {maxSize} MB
            </p>
            <div>
              <Input
                id="file-upload"
                type="file"
                multiple={maxFiles > 1}
                accept={accept}
                onChange={handleFileInput}
                className="hidden"
              />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer pointer-events-none"
                >
                  Chọn file
                </Button>
              </Label>
            </div>
          </CardContent>
        </Card>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Ảnh đã chọn</Label>
            <div>
              <Input
                id="file-upload-replace"
                type="file"
                accept={accept}
                onChange={handleFileInput}
                className="hidden"
              />
              <Label htmlFor="file-upload-replace" className="cursor-pointer">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer pointer-events-none"
                >
                  Thay đổi ảnh
                </Button>
              </Label>
            </div>
          </div>
          {files.map((fileItem, index) => (
            <Card
              key={`${fileItem.file.name}-${index}`}
              className="overflow-hidden"
            >
              <div className="relative">
                <div className="aspect-video bg-muted/50 flex items-center justify-center relative overflow-hidden">
                  {fileItem.result?.url || fileItem.previewUrl ? (
                    <img
                      src={fileItem.result?.url || fileItem.previewUrl}
                      alt={fileItem.file.name}
                      className="w-full h-full object-cover"
                      onError={() => {
                        console.error(
                          "❌ Image failed to load:",
                          fileItem.result?.url || fileItem.previewUrl
                        );
                      }}
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Upload className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-sm">Đang tải ảnh...</p>
                    </div>
                  )}
                </div>

                {fileItem.progress &&
                  fileItem.progress.status === "uploading" && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="mb-2">
                          <Progress
                            value={fileItem.progress.progress}
                            className="w-48 h-2 bg-white/20"
                          />
                        </div>
                        <p className="text-sm">
                          Đang tải lên...{" "}
                          {Math.round(fileItem.progress.progress)}%
                        </p>
                      </div>
                    </div>
                  )}

                {fileItem.progress &&
                  fileItem.progress.status === "completed" && (
                    <div className="absolute top-2 left-2">
                      <div className="bg-green-500 text-white rounded-full p-1">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                    </div>
                  )}

                {fileItem.progress && fileItem.progress.status === "error" && (
                  <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                    <div className="text-white text-center">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Lỗi tải lên</p>
                    </div>
                  </div>
                )}
              </div>

              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">
                  {fileItem.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(fileItem.file.size)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
