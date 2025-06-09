import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, File, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  accept?: string;
  maxSize?: number; // in MB
  maxFiles?: number;
  className?: string;
}

export function FileUpload({
  files,
  onFilesChange,
  accept = "image/*,video/*",
  maxSize = 20,
  maxFiles = 10,
  className,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState("");

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

      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    },
    [files, maxFiles, maxSize]
  );

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter((file) => {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File ${file.name} quá lớn. Tối đa ${maxSize}MB`);
        return false;
      }
      return true;
    });

    const totalFiles = [...files, ...validFiles];
    if (totalFiles.length > maxFiles) {
      alert(`Chỉ được upload tối đa ${maxFiles} files`);
      onFilesChange([...files, ...validFiles].slice(0, maxFiles));
    } else {
      onFilesChange([...files, ...validFiles]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      addFiles(newFiles);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      // Tạo một File object từ URL (placeholder)
      // Trong thực tế, bạn sẽ cần xử lý URL này khác
      console.log("URL submitted:", urlInput);
      setUrlInput("");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isImage = (file: File) => file.type.startsWith("image/");
  const isVideo = (file: File) => file.type.startsWith("video/");

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drag & Drop Area */}
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
            {maxSize} MB hoặc tập tin .mp4 chất lượng cao có kích thước dưới{" "}
            {maxSize * 10} MB.
          </p>
          <Label htmlFor="file-upload">
            <Button type="button" variant="outline" className="cursor-pointer">
              Chọn file
            </Button>
            <Input
              id="file-upload"
              type="file"
              multiple
              accept={accept}
              onChange={handleFileInput}
              className="hidden"
            />
          </Label>
        </CardContent>
      </Card>

      {/* URL Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Hoặc dán URL hình ảnh/video..."
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleUrlSubmit} variant="outline">
          Lưu từ URL
        </Button>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Files đã chọn ({files.length})
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {files.map((file, index) => (
              <Card key={`${file.name}-${index}`} className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {isImage(file) ? (
                      <ImageIcon className="h-8 w-8 text-green-500" />
                    ) : isVideo(file) ? (
                      <File className="h-8 w-8 text-blue-500" />
                    ) : (
                      <File className="h-8 w-8 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="flex-shrink-0 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
