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
import { StepsInput } from "@/components/posts/StepsInput";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { Tag, Topic, Material, PostMaterial, Step } from "@/types/post";
import { createPost } from "@/services/posts/postService";
import type { CreatePostRequest } from "@/types/post";

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
    steps: [],
  });

  const [uploadedFiles, setUploadedFiles] = useState<FileUploadItem[]>([]);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [tagsData, topicsData, materialsData] = await Promise.all([
          getAllTags(),
          getAllTopics(),
          getAllMaterials(),
        ]);

        setTags(tagsData.filter((tag) => tag.status === "active"));
        setTopics(topicsData.filter((topic) => topic.status === "active"));
        setMaterials(materialsData.filter((material) => material.status === "active"));
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

  // Function to clean and validate request data
  const createCleanRequestData = (): CreatePostRequest => {
    const validTagIds = formData.selectedTags
      .map((tag) => tag.tag_id)
      .filter((id) => id && id.trim() !== "");

    const validTopicIds = formData.selectedTopics
      .map((topic) => topic.topic_id)
      .filter((id) => id && id.trim() !== "");

    const validMaterials = formData.selectedMaterials.filter(
      (material) => material.material_id && material.quantity > 0
    );

    // Create request data with only the fields that backend expects
    const requestData: CreatePostRequest = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      tag_ids: validTagIds,
      topic_ids: validTopicIds,
      materials: validMaterials.map((pm) => ({
        material_id: pm.material_id,
        quantity: pm.quantity,
      })),
      images: [], // Will be populated with uploaded URLs
      steps: formData.steps.map((step) => ({
        order_number: step.order_number,
        content: step.content.trim(),
      })),
    };

    return requestData;
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

    // Validate tag_ids and topic_ids are not empty strings
    const validTagIds = formData.selectedTags
      .map((tag) => tag.tag_id)
      .filter((id) => id && id.trim() !== "");

    const validTopicIds = formData.selectedTopics
      .map((topic) => topic.topic_id)
      .filter((id) => id && id.trim() !== "");

    if (validTagIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một tag hợp lệ");
      return;
    }

    if (validTopicIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một chủ đề hợp lệ");
      return;
    }

    // Validate materials have valid material_id and quantity
    const validMaterials = formData.selectedMaterials.filter(
      (material) => material.material_id && material.quantity > 0
    );

    if (validMaterials.length === 0) {
      toast.error("Vui lòng chọn ít nhất một nguyên liệu với số lượng hợp lệ");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images to Firebase first
      const uploadedImageUrls: string[] = [];

      if (uploadedFiles.length > 0) {
        toast.info("Đang tải ảnh lên...");

        const { uploadFile } = await import(
          "@/services/firebase/uploadService"
        );

        for (const fileItem of uploadedFiles) {
          try {
            const result = await uploadFile(fileItem.file, "posts");
            uploadedImageUrls.push(result.url);
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

      // Create clean request data
      const requestData = createCleanRequestData();
      requestData.images = uploadedImageUrls; // Add uploaded image URLs

      // Debug logging
      console.log("📝 Request Data:", JSON.stringify(requestData, null, 2));
      console.log("🔍 Validation check:");
      console.log("- Title:", requestData.title);
      console.log("- Content:", requestData.content);
      console.log("- Tag IDs:", requestData.tag_ids);
      console.log("- Topic IDs:", requestData.topic_ids);
      console.log("- Materials:", requestData.materials);
      console.log("- Images:", requestData.images);
      console.log("- Steps:", requestData.steps);

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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Tiêu đề bài viết
                  {/* <span className="text-red-500">*</span> */}
                </Label>
                <Input
                  id="title"
                  placeholder="VD: Cách làm phở bò ngon đúng điệu..."
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                />
                {/* {formData.title.trim() === "" && (
                  <p className="text-xs text-red-600">
                    Tiêu đề không được để trống
                  </p>
                )} */}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium">
                  Mô tả món ăn
                  {/* <span className="text-red-500">*</span> */}
                </Label>
                <Textarea
                  id="content"
                  placeholder="Chia sẻ về món ăn, nguồn gốc, đặc điểm, cách chế biến tổng quát..."
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  rows={6}
                />
                {/* {formData.content.trim() === "" && (
                  <p className="text-xs text-red-600">
                    Mô tả không được để trống
                  </p>
                )} */}
              </div>
            </CardContent>
          </Card>

          {/* Steps */}
          <StepsInput
            steps={formData.steps}
            onChange={(steps) => handleInputChange("steps", steps)}
          />

          {/* Media Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Hình ảnh món ăn</CardTitle>
              <p className="text-sm text-muted-foreground">
                Thêm tối đa 5 ảnh chất lượng cao để minh họa món ăn
              </p>
            </CardHeader>
            <CardContent>
              <FileUpload
                files={uploadedFiles}
                onFilesChange={setUploadedFiles}
                onUrlsChange={() => { }}
                accept="image/*"
                maxSize={10}
                maxFiles={5}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col space-y-6 h-fit">
          {/* Materials */}
          <Card>
            <CardHeader>
              <CardTitle>Nguyên liệu</CardTitle>
              <p className="text-sm text-muted-foreground">
                Chọn nguyên liệu và ghi rõ số lượng cần thiết
              </p>
            </CardHeader>
            <CardContent>
              <SimpleMaterialInput
                materials={materials}
                selectedMaterials={formData.selectedMaterials}
                onSelectionChange={(materials) =>
                  handleInputChange("selectedMaterials", materials)
                }
                maxItems={20}
              />
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Phân loại</CardTitle>
              <p className="text-sm text-muted-foreground">
                Chọn tags và chủ đề để dễ dàng tìm kiếm
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <MultiSelect
                label="Tags"
                placeholder="Tìm kiếm tag..."
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
                placeholder="Tìm kiếm chủ đề..."
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

          {/* Actions */}
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Kiểm tra trước khi gửi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Validation Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Tiêu đề:</span>
                  <span
                    className={
                      formData.title.trim() ? "text-green-600" : "text-red-600"
                    }
                  >
                    {formData.title.trim() ? "✓" : "✗"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Mô tả:</span>
                  <span
                    className={
                      formData.content.trim()
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {formData.content.trim() ? "✓" : "✗"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Các bước:</span>
                  <span
                    className={
                      formData.steps.length >= 2
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {formData.steps.length >= 2 ? "✓" : "✗"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Nguyên liệu:</span>
                  <span
                    className={
                      formData.selectedMaterials.length > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {formData.selectedMaterials.length > 0 ? "✓" : "✗"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tags:</span>
                  <span
                    className={
                      formData.selectedTags.length > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {formData.selectedTags.length > 0 ? "✓" : "✗"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Chủ đề:</span>
                  <span
                    className={
                      formData.selectedTopics.length > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {formData.selectedTopics.length > 0 ? "✓" : "✗"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Hình ảnh:</span>
                  <span
                    className={
                      uploadedFiles.length > 0
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    {uploadedFiles.length}/5
                  </span>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full h-12"
                size="lg"
              >
                {isSubmitting ? "Đang gửi..." : "Gửi bài để duyệt"}
              </Button>

              {/* Post Info */}
              <div className="pt-2 space-y-1 text-xs text-muted-foreground border-t">
                <div>• Thời gian duyệt: 1-2 giờ</div>
                <div>• Tự động thông báo kết quả</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
