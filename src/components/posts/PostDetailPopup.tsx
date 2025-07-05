import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
} from "lucide-react";
import { ImageLightbox } from "@/components/posts/ImageLightbox";
import { cn } from "@/lib/utils";
import type { Post } from "@/types/post";

interface PostDetailPopupProps {
  post: Post;
  onClose: () => void;
}

export const PostDetailPopup = ({ post, onClose }: PostDetailPopupProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const getStatusIcon = (status: Post["status"]) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "waiting":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
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

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Chi tiết bài viết</h2>
        <Button variant="ghost" onClick={onClose}></Button>
      </div>

      {/* Post Content */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={post.creator?.avatar}
                  alt={post.creator?.full_name}
                />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(post.creator?.full_name || "Unknown")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{post.creator?.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  @{post.creator?.username} • {formatDate(post.created_at)}
                </p>
              </div>
            </div>
            {/* Status Badge - Chỉ hiển thị khi không phải đã duyệt */}
            {post.status !== "approved" && (
              <Badge
                variant="outline"
                className={cn(
                  "flex items-center gap-1",
                  getStatusColor(post.status)
                )}
              >
                {getStatusIcon(post.status)}
                {getStatusText(post.status)}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Title */}
          <h1 className="text-2xl font-bold">{post.title}</h1>

          {/* Content */}
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Rejection Reason - Chỉ hiển thị cho bài bị từ chối */}
          {post.status === "rejected" && post.rejection_reason && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-red-600">
                Lý do từ chối
              </h3>
              <p className="text-red-700 whitespace-pre-wrap">
                {post.rejection_reason}
              </p>
            </div>
          )}

          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Hình ảnh</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {post.images.map((image, index) => (
                  <div
                    key={image.image_id}
                    className="relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openLightbox(index)}
                  >
                    <img
                      src={image.image_url}
                      alt={image.caption || `Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Materials */}
          {post.materials && post.materials.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Nguyên liệu</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {post.materials.map((material, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium">
                      {material.material_name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {material.quantity} {material.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Steps */}
          {post.steps && post.steps.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Cách làm</h3>
              <div className="space-y-4">
                {post.steps
                  .sort((a, b) => a.order_number - b.order_number)
                  .map((step, index) => (
                    <div
                      key={step.step_id || index}
                      className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-16 h-8  text-black rounded-full flex items-center justify-center font-semibold text-sm">
                        Bước {step.order_number}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700">{step.content}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Tags & Topics */}
          {(post.tags.length > 0 || post.topics.length > 0) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Thẻ & Chủ đề</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag.tag_id} variant="secondary">
                    #{tag.name}
                  </Badge>
                ))}
                {post.topics.map((topic) => (
                  <Badge key={topic.topic_id} variant="outline">
                    {topic.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons - Chỉ hiển thị cho bài đã duyệt */}
          {post.status === "approved" && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-muted-foreground hover:text-red-500",
                    isLiked && "text-red-500"
                  )}
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart
                    className={cn("h-4 w-4 mr-1", isLiked && "fill-current")}
                  />
                  Thích
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-blue-500"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Bình luận
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-green-500"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Chia sẻ
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-muted-foreground hover:text-orange-500",
                  isBookmarked && "text-orange-500"
                )}
                onClick={() => setIsBookmarked(!isBookmarked)}
              >
                <Bookmark
                  className={cn("h-4 w-4 mr-1", isBookmarked && "fill-current")}
                />
                Lưu
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Lightbox */}
      {post.images && post.images.length > 0 && (
        <ImageLightbox
          images={post.images}
          currentIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNext={() =>
            setLightboxIndex((prev) =>
              Math.min(prev + 1, post.images.length - 1)
            )
          }
          onPrev={() => setLightboxIndex((prev) => Math.max(prev - 1, 0))}
        />
      )}
    </div>
  );
};
