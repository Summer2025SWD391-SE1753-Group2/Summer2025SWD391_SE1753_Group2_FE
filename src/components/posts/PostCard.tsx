import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Post } from "@/types/post";

interface PostCardProps {
  post: Post;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  className?: string;
}

export function PostCard({
  post,
  onLike,
  onComment,
  onShare,
  onBookmark,
  className,
}: PostCardProps) {
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

  const getCookingUnitAbbr = (unit: string) => {
    const units: Record<string, string> = {
      gram: "g",
      kg: "kg",
      mg: "mg",
      lit: "l",
      ml: "ml",
      muong_cafe: "mcf",
      muong_canh: "mc",
      coc: "cốc",
      chen: "chén",
      thia: "thìa",
      qua: "quả",
      cu: "củ",
      la: "lá",
      bo: "bó",
      canh: "cành",
      thai: "thái",
      mieng: "miếng",
      lon: "lon",
      chai: "chai",
      goi: "gói",
      tui: "túi",
      hop: "hộp",
    };
    return units[unit] || unit;
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        {/* Author Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={post.creator?.avatar}
                alt={post.creator?.full_name}
              />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(post.creator?.full_name || "Unknown")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{post.creator?.full_name}</p>
              <p className="text-xs text-muted-foreground">
                @{post.creator?.username} • {formatDate(post.created_at)}
              </p>
            </div>
          </div>

          {/* Status Badge */}
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
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Title */}
        <h3 className="text-lg font-semibold line-clamp-2">{post.title}</h3>

        {/* Content Preview */}
        <p className="text-muted-foreground line-clamp-3">{post.content}</p>

        {/* Images Preview */}
        {post.images && post.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {post.images.slice(0, 4).map((image, index) => (
              <div
                key={image.image_id}
                className="relative aspect-video bg-muted rounded-lg overflow-hidden"
              >
                <img
                  src={image.image_url}
                  alt={image.caption || "Post image"}
                  className="w-full h-full object-cover"
                />
                {index === 3 && post.images.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-medium">
                      +{post.images.length - 4} ảnh
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tags & Topics */}
        {(post.tags.length > 0 || post.topics.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag.tag_id} variant="secondary" className="text-xs">
                #{tag.name}
              </Badge>
            ))}
            {post.topics.slice(0, 2).map((topic) => (
              <Badge key={topic.topic_id} variant="outline" className="text-xs">
                {topic.name}
              </Badge>
            ))}
            {(post.tags.length > 3 || post.topics.length > 2) && (
              <Badge variant="outline" className="text-xs">
                +{post.tags.length - 3 + (post.topics.length - 2)} khác
              </Badge>
            )}
          </div>
        )}

        {/* Materials Section */}
        {post.materials && post.materials.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Nguyên liệu:
            </h4>
            <div className="flex flex-wrap gap-2">
              {post.materials.slice(0, 6).map((postMaterial) => (
                <Badge
                  key={postMaterial.material_id}
                  variant="secondary"
                  className="text-xs flex items-center gap-1"
                >
                  <span>{postMaterial.material?.name}</span>
                  {postMaterial.quantity && (
                    <span className="text-muted-foreground">
                      ({postMaterial.quantity}{" "}
                      {getCookingUnitAbbr(postMaterial.unit || "")}))
                    </span>
                  )}
                </Badge>
              ))}
              {post.materials.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{post.materials.length - 6} khác
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Rejection Reason */}
        {post.status === "rejected" && post.rejection_reason && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              <strong>Lý do từ chối:</strong> {post.rejection_reason}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onLike}>
              <Heart className="h-4 w-4" />
              <span className="ml-1 text-sm">Thích</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onComment}>
              <MessageCircle className="h-4 w-4" />
              <span className="ml-1 text-sm">Bình luận</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onShare}>
              <Share2 className="h-4 w-4" />
              <span className="ml-1 text-sm">Chia sẻ</span>
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={onBookmark}>
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
