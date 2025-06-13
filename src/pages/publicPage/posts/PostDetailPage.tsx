import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
} from "lucide-react";
import { ImageLightbox } from "@/components/posts/ImageLightbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getPostById } from "@/services/posts/postService";
import type { Post } from "@/types/post";

interface Comment {
  comment_id: string;
  content: string;
  created_at: string;
  author: {
    username: string;
    full_name: string;
    avatar?: string;
  };
  replies?: Comment[];
}

export const PostDetailPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Mock comments data
  const mockComments: Comment[] = [
    {
      comment_id: "1",
      content:
        "Công thức này nhìn rất ngon! Mình sẽ thử làm cuối tuần này. Cảm ơn bạn đã chia sẻ!",
      created_at: "2024-01-18T10:30:00Z",
      author: {
        username: "food_lover_123",
        full_name: "Nguyễn Minh Hạnh",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      },
    },
    {
      comment_id: "2",
      content:
        "Mình đã thử làm theo công thức này rồi, rất thành công! Gia đình ai cũng khen ngon. Tips nhỏ: nên ướp thịt kỹ hơn khoảng 30 phút thì sẽ đậm đà hơn.",
      created_at: "2024-01-18T14:15:00Z",
      author: {
        username: "chef_mom",
        full_name: "Trần Thị Lan",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      },
      replies: [
        {
          comment_id: "2.1",
          content:
            "Cảm ơn bạn đã chia sẻ kinh nghiệm! Mình sẽ ghi nhớ tip này.",
          created_at: "2024-01-18T15:00:00Z",
          author: {
            username: "cooking_newbie",
            full_name: "Lê Văn Nam",
            avatar:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          },
        },
      ],
    },
    {
      comment_id: "3",
      content:
        "Nguyên liệu này có thể thay thế bằng gì khác không ạ? Ở chỗ mình khó mua lắm.",
      created_at: "2024-01-18T16:45:00Z",
      author: {
        username: "home_cook",
        full_name: "Phạm Thị Mai",
        avatar:
          "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face",
      },
    },
  ];

  useEffect(() => {
    if (!postId) {
      navigate("/");
      return;
    }

    const fetchPost = async () => {
      try {
        setLoading(true);
        const postData = await getPostById(postId);
        setPost(postData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Không thể tải bài viết";
        toast.error(errorMessage);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, navigate]);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    // Simulate comment submission
    toast.success("Đã thêm bình luận!");
    setNewComment("");
  };

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          <span className="ml-2">Đang tải bài viết...</span>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Không tìm thấy bài viết.</p>
            <Button onClick={() => navigate("/")} className="mt-4">
              Quay về trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className="mb-6 hover:bg-muted"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại
      </Button>

      {/* Post Content */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          {/* Author Info */}
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
                <p className="font-semibold">{post.creator?.full_name}</p>
                <p className="text-sm text-muted-foreground">
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

          {/* Title */}
          <h1 className="text-2xl font-bold mt-4">{post.title}</h1>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Images Gallery - Moved to top, removed title */}
          {post.images && post.images.length > 0 && (
            <div>
              {post.images.length === 1 ? (
                <div
                  className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => {
                    setLightboxIndex(0);
                    setLightboxOpen(true);
                  }}
                >
                  <img
                    src={post.images[0].image_url}
                    alt={post.images[0].caption || "Post image"}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {post.images.map((image, index) => (
                    <div
                      key={image.image_id}
                      className="relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        setLightboxIndex(index);
                        setLightboxOpen(true);
                      }}
                    >
                      <img
                        src={image.image_url}
                        alt={image.caption || `Ảnh ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="prose max-w-none">
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Materials */}
          {post.materials && post.materials.length > 0 && (
            <div className="bg-gray-50 border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4">
                Nguyên liệu cần thiết
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {post.materials.map((material, index) => (
                  <div
                    key={`${material.material_id}-${index}`}
                    className="flex items-center justify-between py-2 px-3 bg-white rounded border"
                  >
                    <span className="text-sm font-medium">
                      {material.material?.name ||
                        material.material_name ||
                        `Material ${material.material_id}`}
                    </span>
                    <span className="text-sm font-semibold bg-gray-100 px-2 py-1 rounded">
                      {material.quantity}{" "}
                      {material.unit || material.material?.unit || "đv"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Steps */}
          {post.steps && post.steps.length > 0 && (
            <div className="bg-gray-50 border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-6">Các bước thực hiện</h3>
              <div className="space-y-4">
                {post.steps
                  .sort((a, b) => a.order_number - b.order_number)
                  .map((step) => (
                    <div
                      key={step.step_id}
                      className="bg-white p-4 rounded border"
                    >
                      <h4 className="font-medium mb-2">
                        Bước {step.order_number}:
                      </h4>
                      <p className="text-gray-700 leading-relaxed">
                        {step.content}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Tags & Topics */}
          {(post.tags.length > 0 || post.topics.length > 0) && (
            <div className="space-y-3">
              {post.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Tags:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge
                        key={tag.tag_id}
                        variant="secondary"
                        className="text-xs"
                      >
                        #{tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {post.topics.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Chủ đề:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {post.topics.map((topic) => (
                      <Badge
                        key={topic.topic_id}
                        variant="outline"
                        className="text-xs"
                      >
                        {topic.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className={isLiked ? "text-red-600" : ""}
              >
                <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                <span className="ml-1 text-sm">Thích</span>
              </Button>
              <Button variant="ghost" size="sm">
                <MessageCircle className="h-4 w-4" />
                <span className="ml-1 text-sm">
                  Bình luận ({mockComments.length})
                </span>
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
                <span className="ml-1 text-sm">Chia sẻ</span>
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={isBookmarked ? "text-yellow-600" : ""}
            >
              <Bookmark
                className={cn("h-4 w-4", isBookmarked && "fill-current")}
              />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            Bình luận ({mockComments.length})
          </h3>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Comment Form */}
          <div className="space-y-3">
            <Textarea
              placeholder="Viết bình luận của bạn..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-20"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
              >
                Gửi bình luận
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {mockComments.map((comment) => (
              <div
                key={comment.comment_id}
                className="border-l-2 border-muted pl-4"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={comment.author.avatar}
                      alt={comment.author.full_name}
                    />
                    <AvatarFallback>
                      {getInitials(comment.author.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">
                          {comment.author.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(comment.created_at)}
                        </p>
                      </div>
                      <p className="text-sm leading-relaxed">
                        {comment.content}
                      </p>
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-4 space-y-2">
                        {comment.replies.map((reply) => (
                          <div
                            key={reply.comment_id}
                            className="flex items-start gap-3"
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={reply.author.avatar}
                                alt={reply.author.full_name}
                              />
                              <AvatarFallback className="text-xs">
                                {getInitials(reply.author.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="bg-muted/70 rounded-lg p-2 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-xs">
                                  {reply.author.full_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(reply.created_at)}
                                </p>
                              </div>
                              <p className="text-xs leading-relaxed">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Image Lightbox */}
      {post?.images && (
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
