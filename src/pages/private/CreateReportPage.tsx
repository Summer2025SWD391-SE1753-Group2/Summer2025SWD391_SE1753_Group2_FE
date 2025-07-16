import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { createReport } from "@/services/reports/reportService";
import { authService } from "@/services/auth/authService";
import { Report } from "@/types/report";

const CreateReportPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<Report>>({
    title: "",
    type: "report_topic",
    reason: "",
    description: "",
    unit: "",
    object_add: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      type: value as "report_topic" | "report_tag" | "report_material",
      unit: value === "report_material" ? prev.unit : "", // Reset unit if not report_material
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = authService.getToken();
    if (!token) {
      toast.error("Vui lòng đăng nhập để tạo báo cáo");
      navigate("/login");
      return;
    }

    if (!formData.title || !formData.type || !formData.reason || !formData.description || !formData.object_add) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    setLoading(true);
    try {
      await createReport(
        {
          title: formData.title,
          type: formData.type,
          reason: formData.reason,
          description: formData.description,
          unit: formData.unit || "",
          object_add: formData.object_add,
        },
        token
      );
      toast.success("Báo cáo đã được tạo thành công");
      // Reset form inputs
      setFormData({
        title: "",
        type: "report_topic",
        reason: "",
        description: "",
        unit: "",
        object_add: "",
      });
    } catch (err) {
      const errorMessage =
        (err as any)?.response?.data?.detail || "Không thể tạo báo cáo";
      toast.error(errorMessage);
      if (errorMessage.includes("401")) {
        authService.clearTokens();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tạo báo cáo mới
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Điền thông tin để gửi báo cáo cho hệ thống
              </p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <Card className="bg-white rounded-lg shadow-sm border">
          <CardHeader>
            <CardTitle>Thông tin báo cáo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Nhập tiêu đề báo cáo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Loại báo cáo <span className="text-red-500">*</span></Label>
                <Select value={formData.type} onValueChange={handleTypeChange}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Chọn loại báo cáo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="report_topic">Báo cáo chủ đề</SelectItem>
                    <SelectItem value="report_tag">Báo cáo thẻ</SelectItem>
                    <SelectItem value="report_material">Báo cáo tài liệu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Lý do <span className="text-red-500">*</span></Label>
                <Input
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Nhập lý do báo cáo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả <span className="text-red-500">*</span></Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Nhập mô tả chi tiết"
                  required
                />
              </div>

              {formData.type === "report_material" && (
                <div className="space-y-2">
                  <Label htmlFor="unit">Đơn vị</Label>
                  <Input
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    placeholder="Nhập đơn vị (nếu có)"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="object_add">Đối tượng bổ sung <span className="text-red-500">*</span></Label>
                <Input
                  id="object_add"
                  name="object_add"
                  value={formData.object_add}
                  onChange={handleChange}
                  placeholder="Nhập đối tượng bổ sung"
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? "Đang gửi..." : "Gửi báo cáo"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateReportPage;