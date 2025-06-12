import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { FileUpload } from "@/components/posts/FileUpload";
import { MultiSelect } from "@/components/posts/MultiSelect";
import { SimpleMaterialInput } from "@/components/posts/SimpleMaterialInput";
import { ArrowLeft, Send, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import type { Tag, Topic, Material, PostMaterial } from "@/types/post";
import { createPost, CreatePostApiRequest } from "@/services/posts/postService";

import { getAllTopics } from "@/services/topics/topicService";
import { getAllMaterials } from "@/services/materials/materialService";
import { getAllTags } from "@/services/tags/tagsService";

interface FileUploadItem {
  file: File;
  progress?: {
    progress: number;
    status: "uploading" | "completed" | "error";
  };
  result?: {
    url: string;
    fileName: string;
  };
  previewUrl?: string;
}

interface FormData {
  title: string;
  content: string;
  selectedTags: Tag[];
  selectedTopics: Topic[];
  selectedMaterials: PostMaterial[];
}

export function CreatePostPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data from API
  const [tags, setTags] = useState<Tag[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    selectedTags: [],
    selectedTopics: [],
    selectedMaterials: [],
  });

  const [uploadedFiles, setUploadedFiles] = useState<FileUploadItem[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [tagsData, topicsData, materialsData] = await Promise.all([
          getAllTags(),
          getAllTopics(),
          getAllMaterials(),
        ]);

        setTags(tagsData);
        setTopics(topicsData);
        setMaterials(materialsData);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Không thể tải dữ liệu. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (field: keyof FormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài viết");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("Vui lòng nhập nội dung bài viết");
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData: CreatePostApiRequest = {
        title: formData.title,
        content: formData.content,
        tag_ids: formData.selectedTags.map((tag) => tag.tag_id),
        topic_ids: formData.selectedTopics.map((topic) => topic.topic_id),
        materials: formData.selectedMaterials.map((pm) => ({
          material_id: pm.material_id,
          quantity: pm.quantity,
        })),
        images: imageUrls, // URLs từ Firebase
      };

      await createPost(requestData);

      toast.success("Bài viết của bạn đã được gửi và đang chờ duyệt");
      navigate("/");
    } catch (err) {
      console.error("Error creating post:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Không thể đăng bài. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Tạo bài viết mới</h1>
          <p className="text-sm text-muted-foreground">
            Chia sẻ món ăn và công thức nấu ăn với cộng đồng
          </p>
        </div>
      </div>

      {/* Post Status Info */}
      <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 text-amber-800 dark:text-amber-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-medium">Lưu ý về quy trình duyệt bài</p>
              <div className="text-sm space-y-1">
                <p>
                  • Bài viết sẽ được gửi tới moderator/admin để duyệt trước khi
                  hiển thị công khai
                </p>
                <p>• Quá trình duyệt thường mất 1-2 giờ trong giờ hành chính</p>
                <p>• Chỉ chọn từ danh sách tags, chủ đề, nguyên liệu có sẵn</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="title">Tiêu đề bài viết *</Label>
                <Input
                  id="title"
                  placeholder="VD: Cách làm phở bò ngon đúng điệu..."
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Content */}
              <div>
                <Label htmlFor="content">Nội dung bài viết *</Label>
                <Textarea
                  id="content"
                  placeholder="Chia sẻ công thức, cách làm, mẹo vặt hay những trải nghiệm của bạn về món ăn này..."
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  rows={8}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Media Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Hình ảnh món ăn</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                files={uploadedFiles}
                onFilesChange={setUploadedFiles}
                onUrlsChange={setImageUrls}
                accept="image/*"
                maxSize={10}
                maxFiles={1}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col space-y-6 h-fit">
          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Phân loại</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <MultiSelect
                label="Tags"
                placeholder="Tìm tag..."
                items={tags.map((tag) => ({
                  id: tag.tag_id,
                  name: tag.name,
                  description: tag.description,
                }))}
                selectedItems={formData.selectedTags.map((tag) => ({
                  id: tag.tag_id,
                  name: tag.name,
                  description: tag.description,
                }))}
                onSelectionChange={(items) =>
                  handleInputChange(
                    "selectedTags",
                    items.map((item) => ({
                      tag_id: item.id,
                      name: item.name,
                      description: item.description,
                      status: "active" as const,
                    }))
                  )
                }
                maxItems={5}
              />

              <Separator />

              <MultiSelect
                label="Chủ đề"
                placeholder="Tìm chủ đề..."
                items={topics.map((topic) => ({
                  id: topic.topic_id,
                  name: topic.name,
                  description: topic.description,
                }))}
                selectedItems={formData.selectedTopics.map((topic) => ({
                  id: topic.topic_id,
                  name: topic.name,
                  description: topic.description,
                }))}
                onSelectionChange={(items) =>
                  handleInputChange(
                    "selectedTopics",
                    items.map((item) => ({
                      topic_id: item.id,
                      name: item.name,
                      description: item.description,
                      status: "active" as const,
                    }))
                  )
                }
                maxItems={3}
              />
            </CardContent>
          </Card>

          {/* Materials */}
          <SimpleMaterialInput
            materials={materials}
            selectedMaterials={formData.selectedMaterials}
            onSelectionChange={(materials) =>
              handleInputChange("selectedMaterials", materials)
            }
            maxItems={20}
          />

          {/* Actions - Flex grow để fill hết không gian còn lại */}
          <Card className="flex-grow flex flex-col">
            <CardHeader>
              <CardTitle>Hành động</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between space-y-3">
              <div className="space-y-3">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Gửi bài để duyệt
                    </>
                  )}
                </Button>
              </div>

              {/* Post Info - Đẩy xuống dưới */}
              <div className="pt-3 space-y-2 text-xs text-muted-foreground mt-auto">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Thời gian duyệt: 1-2 giờ
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3" />
                  Tự động thông báo kết quả
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
