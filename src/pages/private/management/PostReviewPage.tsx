import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { toast } from "sonner";
import type { Post } from "@/types/post";
import { getPostById, moderatePost } from "@/services/posts/postService";
import { useAuthStore } from "@/stores/auth";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function PostReviewPage() {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuthStore();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (!postId) {
      navigate("/moderator/approvepost");
      return;
    }

    const loadPost = async () => {
      try {
        const postData = await getPostById(postId);
        setPost(postData);
      } catch (error) {
        console.error("Error loading post:", error);
        toast.error("Không thể tải bài viết");
        navigate("/moderator/approvepost");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId, navigate]);

  const getStatusIcon = (status: Post["status"]) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "waiting":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: Post["status"]) => {
    switch (status) {
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Bị từ chối";
      case "waiting":
        return "Chờ duyệt";
      default:
        return "Không xác định";
    }
  };

  const getStatusColor = (status: Post["status"]) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      case "waiting":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const handleApprove = async () => {
    if (!post || !user) return;

    setIsApproving(true);
    try {
      await moderatePost(post.post_id, {
        status: "approved",
        rejection_reason: "",
        approved_by: user.account_id,
      });

      setPost({ ...post, status: "approved" });
      toast.success("Đã duyệt bài viết thành công");
    } catch (error) {
      console.error("Error approving post:", error);
      toast.error("Không thể duyệt bài viết");
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!post || !user || !rejectReason.trim()) return;

    setIsRejecting(true);
    try {
      await moderatePost(post.post_id, {
        status: "rejected",
        rejection_reason: rejectReason.trim(),
        approved_by: user.account_id,
      });

      setPost({
        ...post,
        status: "rejected",
        rejection_reason: rejectReason.trim(),
      });
      setShowRejectDialog(false);
      setRejectReason("");
      toast.success("Đã từ chối bài viết");
    } catch (error) {
      console.error("Error rejecting post:", error);
      toast.error("Không thể từ chối bài viết");
    } finally {
      setIsRejecting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Đang tải bài viết...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy bài viết</h1>
          <Button onClick={() => navigate("/moderator/approvepost")}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/moderator/approvepost")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Xem xét bài viết</h1>
          <p className="text-sm text-muted-foreground">
            Đánh giá và quyết định duyệt/từ chối bài viết
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`flex items-center gap-1 ${getStatusColor(post.status)}`}
          >
            {getStatusIcon(post.status)}
            {getStatusText(post.status)}
          </Badge>
        </div>
      </div>

      {/* Post Info */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={post.creator?.avatar}
                alt={post.creator?.full_name}
              />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(post.creator?.full_name || "Unknown")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{post.creator?.full_name}</p>
              <p className="text-sm text-muted-foreground">
                @{post.creator?.username} • {formatDate(post.created_at)}
              </p>
            </div>
          </div>

          {/* Rejection Reason */}
          {post.status === "rejected" && post.rejection_reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Lý do từ chối:</p>
                  <p className="text-red-700">{post.rejection_reason}</p>
                </div>
              </div>
            </div>
          )}
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
                <Label className="text-sm font-medium">Tiêu đề bài viết</Label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="font-medium">{post.title}</p>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Mô tả món ăn</Label>
                <div className="p-3 bg-gray-50 rounded-lg border min-h-[120px]">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {post.content}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Các bước thực hiện</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {post.steps
                  .sort((a, b) => a.order_number - b.order_number)
                  .map((step, index) => (
                    <div
                      key={step.step_id || index}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                          {step.order_number}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed">
                            {step.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          {post.images && post.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Hình ảnh món ăn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {post.images.map((image, index) => (
                    <div
                      key={image.image_id}
                      className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedImage(image.image_url)}
                    >
                      <img
                        src={image.image_url}
                        alt={image.caption || `Hình ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col space-y-6">
          {/* Materials */}
          <Card>
            <CardHeader>
              <CardTitle>Nguyên liệu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {post.materials.map((material, index) => (
                  <div
                    key={material.material_id || index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm font-medium">
                      {material.material_name || material.material?.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {material.quantity}{" "}
                      {material.unit || material.material?.unit}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tags & Topics */}
          <Card>
            <CardHeader>
              <CardTitle>Phân loại</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tags */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag.tag_id} variant="secondary">
                      #{tag.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Topics */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Chủ đề</Label>
                <div className="flex flex-wrap gap-2">
                  {post.topics.map((topic) => (
                    <Badge key={topic.topic_id} variant="outline">
                      {topic.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review Actions */}
          {post.status === "waiting" && (
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Hành động duyệt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isApproving ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang duyệt...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4" />
                        Duyệt
                      </div>
                    )}
                  </Button>

                  <Button
                    onClick={() => setShowRejectDialog(true)}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <div className="flex items-center gap-2">
                      <ThumbsDown className="h-4 w-4" />
                      Từ chối
                    </div>
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground text-center">
                  Hành động này không thể hoàn tác
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Image Lightbox */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-4xl p-0 bg-black/90">
          {selectedImage && (
            <div className="relative">
              <img
                src={selectedImage}
                alt="Xem ảnh lớn"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70"
              >
                ✕
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Từ chối bài viết</DialogTitle>
            <DialogDescription>
              Vui lòng cho biết lý do từ chối bài viết này để tác giả có thể
              chỉnh sửa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-reason">Lý do từ chối</Label>
              <Textarea
                id="reject-reason"
                placeholder="Nhập lý do từ chối..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason("");
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleReject}
              disabled={!rejectReason.trim() || isRejecting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isRejecting ? "Đang xử lý..." : "Từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
