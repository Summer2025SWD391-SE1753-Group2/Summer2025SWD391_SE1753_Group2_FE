import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { FileUpload } from "@/components/posts/FileUpload";
import { MultiSelect } from "@/components/posts/MultiSelect";
import { SimpleMaterialInput } from "@/components/posts/SimpleMaterialInput";
import { StepsInput } from "@/components/posts/StepsInput";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type {
  Tag,
  Topic,
  Material,
  PostMaterial,
  Step,
  Post,
} from "@/types/post";
import {
  getPostById,
  updatePost,
  UpdatePostRequest,
} from "@/services/posts/postService";
import { getAllTopics } from "@/services/topics/topicService";
import { getAllMaterials } from "@/services/materials/materialService";
import { getAllTags } from "@/services/tags/tagsService";

interface FileUploadItem {
  file: File;
  previewUrl: string;
  id: string;
}

interface FormData {
  title: string;
  content: string;
  selectedTags: Tag[];
  selectedTopics: Topic[];
  selectedMaterials: PostMaterial[];
  steps: Step[];
}

export function EditPostPage() {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);

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
    steps: [],
  });

  const [uploadedFiles, setUploadedFiles] = useState<FileUploadItem[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      if (!postId) {
        toast.error("ID bài viết không hợp lệ");
        navigate("/user/my-posts");
        return;
      }

      try {
        const [postData, tagsData, topicsData, materialsData] =
          await Promise.all([
            getPostById(postId),
            getAllTags(),
            getAllTopics(),
            getAllMaterials(),
          ]);

        // Set reference data
        setTags(tagsData.tags);
        setTopics(topicsData.topics);
        setMaterials(materialsData.materials);
        setPost(postData);

        // Pre-fill form with existing post data
        setFormData({
          title: postData.title,
          content: postData.content,
          selectedTags: postData.tags || [],
          selectedTopics: postData.topics || [],
          selectedMaterials:
            postData.materials?.map((material) => ({
              material_id: material.material_id,
              material_name: material.material_name,
              quantity: material.quantity,
              unit: material.unit,
            })) || [],
          steps:
            postData.steps?.map((step) => ({
              step_id: step.step_id,
              order_number: step.order_number,
              content: step.content,
            })) || [],
        });

        // Set existing images
        setExistingImages(postData.images?.map((img) => img.image_url) || []);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Không thể tải dữ liệu bài viết. Vui lòng thử lại.");
        navigate("/user/my-posts");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [postId, navigate]);

  const handleInputChange = (field: keyof FormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!postId) {
      toast.error("ID bài viết không hợp lệ");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài viết");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("Vui lòng nhập nội dung bài viết");
      return;
    }

    if (formData.steps.length < 2) {
      toast.error("Vui lòng thêm ít nhất 2 bước thực hiện");
      return;
    }

    const emptySteps = formData.steps.filter((step) => !step.content.trim());
    if (emptySteps.length > 0) {
      toast.error("Vui lòng điền đầy đủ nội dung cho tất cả các bước");
      return;
    }

    if (formData.selectedMaterials.length === 0) {
      toast.error("Vui lòng chọn ít nhất một nguyên liệu");
      return;
    }

    if (formData.selectedTags.length === 0) {
      toast.error("Vui lòng chọn ít nhất một tag");
      return;
    }

    if (formData.selectedTopics.length === 0) {
      toast.error("Vui lòng chọn ít nhất một chủ đề");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload new images to Firebase first
      const newUploadedImageUrls: string[] = [];

      if (uploadedFiles.length > 0) {
        toast.info("Đang tải ảnh mới lên...");

        const { uploadFile } = await import(
          "@/services/firebase/uploadService"
        );

        for (const fileItem of uploadedFiles) {
          try {
            const result = await uploadFile(fileItem.file, "posts");
            newUploadedImageUrls.push(result.url);
          } catch (uploadError) {
            console.error(
              `Failed to upload ${fileItem.file.name}:`,
              uploadError
            );
            toast.error(`Không thể tải ảnh ${fileItem.file.name}`);
            return;
          }
        }
      }

      // Combine existing images with new uploaded images
      const allImages = [...existingImages, ...newUploadedImageUrls];

      const requestData: UpdatePostRequest = {
        title: formData.title,
        content: formData.content,
        tag_ids: formData.selectedTags.map((tag) => tag.tag_id),
        topic_ids: formData.selectedTopics.map((topic) => topic.topic_id),
        materials: formData.selectedMaterials.map((pm) => ({
          material_id: pm.material_id,
          quantity: pm.quantity,
        })),
        images: allImages,
        steps: formData.steps.map((step) => ({
          order_number: step.order_number,
          content: step.content,
        })),
      };

      await updatePost(postId, requestData);

      toast.success(
        "Bài viết đã được cập nhật thành công! Bài viết sẽ chuyển về trạng thái chờ duyệt và các bình luận cũ sẽ bị xóa."
      );
      navigate("/user/my-posts");
    } catch (err) {
      console.error("Error updating post:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Không thể cập nhật bài viết. Vui lòng thử lại."
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
            <p className="text-muted-foreground">
              Đang tải dữ liệu bài viết...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-muted-foreground">Không tìm thấy bài viết</p>
            <Button onClick={() => navigate("/user/my-posts")} className="mt-4">
              Quay lại danh sách bài viết
            </Button>
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
          onClick={() => navigate("/user/my-posts")}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Chỉnh sửa bài viết</h1>
          <p className="text-muted-foreground">
            Cập nhật thông tin bài viết của bạn
          </p>
          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              ⚠️ <strong>Lưu ý:</strong> Khi cập nhật bài viết, trạng thái sẽ
              chuyển về "chờ duyệt" và tất cả bình luận hiện tại sẽ bị xóa.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề bài viết *</Label>
                <Input
                  id="title"
                  placeholder="Nhập tiêu đề bài viết..."
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Nội dung *</Label>
                <Textarea
                  id="content"
                  placeholder="Mô tả chi tiết về món ăn, cách chế biến, nguồn gốc..."
                  className="min-h-[150px]"
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Hình ảnh</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Ảnh hiện có</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                      {existingImages.map((imageUrl, index) => (
                        <div
                          key={index}
                          className="relative aspect-square bg-muted rounded-lg overflow-hidden"
                        >
                          <img
                            src={imageUrl}
                            alt={`Existing image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setExistingImages((prev) =>
                                prev.filter((_, i) => i !== index)
                              );
                            }}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Thêm ảnh mới</Label>
                  <FileUpload
                    files={uploadedFiles}
                    onFilesChange={setUploadedFiles}
                    onUrlsChange={() => {}} // Not used in edit mode
                    maxFiles={5 - existingImages.length}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Các bước thực hiện *</CardTitle>
            </CardHeader>
            <CardContent>
              <StepsInput
                steps={formData.steps}
                onChange={(steps) => handleInputChange("steps", steps)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Materials */}
          <Card>
            <CardHeader>
              <CardTitle>Nguyên liệu *</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleMaterialInput
                materials={materials}
                selectedMaterials={formData.selectedMaterials}
                onSelectionChange={(materials) =>
                  handleInputChange("selectedMaterials", materials)
                }
              />
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags *</CardTitle>
            </CardHeader>
            <CardContent>
              <MultiSelect
                label="Tags"
                items={tags.map((tag) => ({ id: tag.tag_id, name: tag.name }))}
                selectedItems={formData.selectedTags.map((tag) => ({
                  id: tag.tag_id,
                  name: tag.name,
                }))}
                onSelectionChange={(items) => {
                  const selectedTags = items.map(
                    (item) => tags.find((tag) => tag.tag_id === item.id)!
                  );
                  handleInputChange("selectedTags", selectedTags);
                }}
                placeholder="Chọn tags..."
              />
            </CardContent>
          </Card>

          {/* Topics */}
          <Card>
            <CardHeader>
              <CardTitle>Chủ đề *</CardTitle>
            </CardHeader>
            <CardContent>
              <MultiSelect
                label="Chủ đề"
                items={topics.map((topic) => ({
                  id: topic.topic_id,
                  name: topic.name,
                }))}
                selectedItems={formData.selectedTopics.map((topic) => ({
                  id: topic.topic_id,
                  name: topic.name,
                }))}
                onSelectionChange={(items) => {
                  const selectedTopics = items.map(
                    (item) =>
                      topics.find((topic) => topic.topic_id === item.id)!
                  );
                  handleInputChange("selectedTopics", selectedTopics);
                }}
                placeholder="Chọn chủ đề..."
              />
            </CardContent>
          </Card>

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật & Gửi duyệt lại"}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/user/my-posts")}
              className="w-full"
            >
              Hủy bỏ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditPostPage;
