import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { FileUpload } from "@/components/posts/FileUpload";
import { MultiSelect } from "@/components/posts/MultiSelect";
import { MaterialInput } from "@/components/posts/MaterialInput";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Send,
  Save,
  AlertCircle,
  Clock,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import type {
  PostFormData,
  Tag,
  Topic,
  Material,
  PostMaterial,
  MaterialCategory,
  CookingUnit,
} from "@/types/post";

// Mock data - sẽ được thay thế bằng API calls
const mockTags: Tag[] = [
  {
    tag_id: "1",
    name: "Món chính",
    description: "Các món ăn chính trong bữa cơm",
    status: "active",
  },
  {
    tag_id: "2",
    name: "Tráng miệng",
    description: "Các món ăn tráng miệng",
    status: "active",
  },
  {
    tag_id: "3",
    name: "Đồ uống",
    description: "Các loại đồ uống",
    status: "active",
  },
  {
    tag_id: "4",
    name: "Ăn vặt",
    description: "Các món ăn nhẹ",
    status: "active",
  },
  {
    tag_id: "5",
    name: "Ăn kiêng",
    description: "Món ăn dành cho người ăn kiêng",
    status: "active",
  },
];

const mockTopics: Topic[] = [
  {
    topic_id: "1",
    name: "Món Việt",
    description: "Các món ăn truyền thống Việt Nam",
    status: "active",
  },
  {
    topic_id: "2",
    name: "Món Âu",
    description: "Các món ăn châu Âu",
    status: "active",
  },
  {
    topic_id: "3",
    name: "Món Á",
    description: "Các món ăn châu Á",
    status: "active",
  },
  {
    topic_id: "4",
    name: "Bánh ngọt",
    description: "Các loại bánh ngọt",
    status: "active",
  },
  { topic_id: "5", name: "Lẩu", description: "Các món lẩu", status: "active" },
];

const mockMaterials: Material[] = [
  {
    material_id: "1",
    name: "Thịt heo",
    description: "Thịt heo tươi, sạch",
    default_unit: "gram",
    category: "thit",
    status: "active",
  },
  {
    material_id: "2",
    name: "Gạo tẻ",
    description: "Gạo tẻ thơm",
    default_unit: "kg",
    category: "hat_lua",
    status: "active",
  },
  {
    material_id: "3",
    name: "Cà chua",
    description: "Cà chua chín đỏ",
    default_unit: "qua",
    category: "rau_cu",
    status: "active",
  },
  {
    material_id: "4",
    name: "Hành lá",
    description: "Hành lá tươi",
    default_unit: "bo",
    category: "rau_cu",
    status: "active",
  },
  {
    material_id: "5",
    name: "Muối",
    description: "Muối tinh khiết",
    default_unit: "muong_cafe",
    category: "gia_vi",
    status: "active",
  },
  {
    material_id: "6",
    name: "Đường",
    description: "Đường cát trắng",
    default_unit: "muong_canh",
    category: "gia_vi",
    status: "active",
  },
  {
    material_id: "7",
    name: "Nước mắm",
    description: "Nước mắm Phú Quốc",
    default_unit: "muong_canh",
    category: "nuoc_tuong",
    status: "active",
  },
  {
    material_id: "8",
    name: "Dầu ăn",
    description: "Dầu ăn thực vật",
    default_unit: "ml",
    category: "dau_mo",
    status: "active",
  },
  {
    material_id: "9",
    name: "Trứng gà",
    description: "Trứng gà tươi",
    default_unit: "qua",
    category: "sua_trung",
    status: "active",
  },
  {
    material_id: "10",
    name: "Cá hồi",
    description: "Cá hồi tươi",
    default_unit: "gram",
    category: "ca",
    status: "active",
  },
];

export function CreatePostPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    content: "",
    selectedTags: [],
    selectedTopics: [],
    selectedMaterials: [],
    images: [],
  });

  const handleInputChange = (field: keyof PostFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (isDraft = false) => {
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
      // TODO: Replace with actual API call
      const createPostRequest = {
        title: formData.title,
        content: formData.content,
        tag_ids: formData.selectedTags.map((tag) => tag.tag_id),
        topic_ids: formData.selectedTopics.map((topic) => topic.topic_id),
        materials: formData.selectedMaterials.map((pm) => ({
          material_id: pm.material_id,
          quantity: pm.quantity,
          unit: pm.unit,
          notes: pm.notes,
        })),
        images: formData.images,
      };

      console.log("Create post request:", createPostRequest);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(
        isDraft
          ? "Bài viết đã được lưu vào nháp"
          : "Bài viết của bạn đã được gửi và đang chờ duyệt"
      );

      navigate("/");
    } catch (error) {
      toast.error("Không thể đăng bài. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTag = (name: string) => {
    const newTag: Tag = {
      tag_id: `new-${Date.now()}`,
      name,
      status: "active",
    };
    handleInputChange("selectedTags", [...formData.selectedTags, newTag]);
    toast.success(`Đã tạo tag mới: ${name}`);
  };

  const handleCreateTopic = (name: string) => {
    const newTopic: Topic = {
      topic_id: `new-${Date.now()}`,
      name,
      status: "active",
    };
    handleInputChange("selectedTopics", [...formData.selectedTopics, newTopic]);
    toast.success(`Đã tạo chủ đề mới: ${name}`);
  };

  const handleCreateMaterial = (name: string) => {
    const newMaterial: Material = {
      material_id: `new-${Date.now()}`,
      name,
      status: "active",
    };
    handleInputChange("selectedMaterials", [
      ...formData.selectedMaterials,
      newMaterial,
    ]);
    toast.success(`Đã tạo nguyên liệu mới: ${name}`);
  };

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
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Lưu ý về quy trình duyệt bài</p>
              <p className="text-sm">
                Bài viết của bạn sẽ được gửi tới moderator/admin để duyệt trước
                khi hiển thị công khai. Quá trình này thường mất 1-2 giờ trong
                giờ hành chính.
              </p>
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
              <CardTitle>Hình ảnh & Video</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                files={formData.images}
                onFilesChange={(files) => handleInputChange("images", files)}
                maxSize={20}
                maxFiles={10}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Phân loại</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <MultiSelect
                label="Tags"
                placeholder="Tìm hoặc tạo tag..."
                items={mockTags.map((tag) => ({
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
                canCreate={true}
                onCreateNew={handleCreateTag}
              />

              <Separator />

              <MultiSelect
                label="Chủ đề"
                placeholder="Tìm hoặc tạo chủ đề..."
                items={mockTopics.map((topic) => ({
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
                canCreate={true}
                onCreateNew={handleCreateTopic}
              />

              <Separator />

              <MaterialInput
                materials={mockMaterials}
                selectedMaterials={formData.selectedMaterials}
                onSelectionChange={(materials) =>
                  handleInputChange("selectedMaterials", materials)
                }
                maxItems={20}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Hành động</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => handleSubmit(false)}
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

              <Button
                variant="outline"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Lưu nháp
              </Button>

              {/* Post Info */}
              <div className="pt-3 space-y-2 text-xs text-muted-foreground">
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
