import React, { useState, useEffect, useCallback } from "react";
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
import { CommentItem } from "@/components/posts/CommentItem";
import { BookmarkModal } from "@/components/posts/BookmarkModal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatRelativeTime } from "@/utils/dateUtils";
import { useAuthStore } from "@/stores/auth";
import { useFavoriteStore } from "@/stores/favoriteStore";
import { getPostById } from "@/services/posts/postService";
import {
  createComment,
  getCommentsByPost,
  deleteComment,
} from "@/services/comments/commentService";
import type { Post } from "@/types/post";
import type { Comment } from "@/types/comment";

export const PostDetailPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isPostSaved, initializeFavorites } = useFavoriteStore();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set()
  );
  const [isLiked, setIsLiked] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [deletingComments, setDeletingComments] = useState<Set<string>>(
    new Set()
  );
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [showDeletedComments, setShowDeletedComments] =
    useState<boolean>(false);

  useEffect(() => {
    initializeFavorites();
  }, [initializeFavorites]);

  useEffect(() => {
    if (!postId) return;
    // Check if post is bookmarked - not needed for UI state
    isPostSaved(postId);
  }, [postId, isPostSaved]);

  const role = user?.role?.role_name || "user";
  // Count deleted comments to show in toggle button
  const countDeletedComments = (commentsList: Comment[]): number => {
    let count = 0;
    for (const comment of commentsList) {
      if (comment.status === "deleted") count++;
      if (comment.replies && comment.replies.length > 0) {
        count += countDeletedComments(comment.replies);
      }
    }
    return count;
  };

  const deletedCommentsCount = countDeletedComments(comments);

  const fetchComments = useCallback(async () => {
    if (!postId) return;

    try {
      setCommentsLoading(true);
      const commentsData = await getCommentsByPost(postId);
      setComments(commentsData);
      setCommentsLoaded(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải bình luận";
      toast.error(errorMessage);
    } finally {
      setCommentsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (!postId) {
      navigate("/");
      return;
    }

    // Reset comments state when postId changes
    setComments([]);
    setCommentsLoaded(false);

    const fetchPost = async () => {
      try {
        setLoading(true);
        const postData = await getPostById(postId);

        // Check quyền truy cập nếu bài viết chưa được duyệt
        const isAuthor = user?.account_id === postData.created_by;
        const isModerator =
          user?.role.role_name === "moderator" ||
          user?.role.role_name === "admin";

        if (
          (postData.status === "waiting" || postData.status === "rejected") &&
          !isAuthor &&
          !isModerator
        ) {
          toast.warning("Bạn không có quyền truy cập bài viết này.");
          navigate("/");
          return;
        }

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

  // Separate useEffect for loading comments after post is loaded
  useEffect(() => {
    if (post && post.status === "approved" && !commentsLoaded) {
      fetchComments();
    } else if (post && post.status !== "approved") {
      setComments([]);
      setCommentsLoaded(false);
    }
  }, [post, fetchComments, commentsLoaded]);

  // Auto-refresh comments every 30 seconds
  useEffect(() => {
    if (!post || post.status !== "approved" || !commentsLoaded) return;

    const intervalId = setInterval(() => {
      fetchComments();
      setLastRefresh(new Date());
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [post, commentsLoaded, fetchComments]);

  // Force re-render every 60 seconds to update relative time display
  useEffect(() => {
    const intervalId = setInterval(() => {
      setLastRefresh(new Date());
    }, 60000); // 60 seconds for time display update

    return () => clearInterval(intervalId);
  }, []);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !postId) return;

    try {
      await createComment({
        content: newComment,
        post_id: postId,
      });
      toast.success("Đã thêm bình luận!");
      setNewComment("");

      // Refresh comments after creating new one
      await fetchComments();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tạo bình luận";
      toast.error(errorMessage);
    }
  };

  const handleSubmitReply = async (
    parentCommentId: string,
    content: string
  ) => {
    if (!content.trim() || !postId) return;

    try {
      await createComment({
        content: content,
        post_id: postId,
        parent_comment_id: parentCommentId,
      });
      toast.success("Đã thêm phản hồi!");

      // Cancel reply mode to avoid duplicate
      setReplyingTo(null);

      // Refresh comments after creating new reply
      await fetchComments();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tạo phản hồi";
      toast.error(errorMessage);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      setDeletingComments((prev) => new Set(prev).add(commentId));
      await deleteComment(commentId);
      toast.success("Đã xóa bình luận!");

      // Cancel any active reply to the deleted comment
      if (replyingTo === commentId) {
        setReplyingTo(null);
      }

      // Refresh comments after deleting
      await fetchComments();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể xóa bình luận";
      toast.error(errorMessage);
    } finally {
      setDeletingComments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  const toggleExpandComment = (commentId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
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
    // Use lastRefresh to trigger re-calculation of relative time
    return formatRelativeTime(dateString, lastRefresh);
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
      <Button
        variant="ghost"
        onClick={() => navigate(`/${role}`)}
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
                  Bình luận ({comments.length})
                </span>
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
                <span className="ml-1 text-sm">Chia sẻ</span>
              </Button>
            </div>
            <BookmarkModal postId={post.post_id}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-muted-foreground"
              >
                <Bookmark className="h-4 w-4 mr-1" />
                Lưu
              </Button>
            </BookmarkModal>
          </div>
        </CardContent>
      </Card>
      {/* Comments Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Bình luận ({comments.length})
            </h3>
            {/* Toggle deleted comments visibility - only show if there are deleted comments */}
            {deletedCommentsCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeletedComments(!showDeletedComments)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {showDeletedComments
                  ? "Ẩn comment đã xóa"
                  : `Hiện ${deletedCommentsCount} comment đã xóa`}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Comment Form - Only show for approved posts */}
          {post?.status === "approved" && (
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
          )}
          {/* Comments List */}
          {commentsLoading ? (
            <div className="flex justify-center items-center p-4">
              <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
              <span className="ml-2">Đang tải bình luận...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment: Comment) => (
                <CommentItem
                  key={comment.comment_id}
                  comment={comment}
                  depth={0}
                  currentUser={user}
                  onReply={handleSubmitReply}
                  onDelete={handleDeleteComment}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  expandedComments={expandedComments}
                  toggleExpandComment={toggleExpandComment}
                  deletingComments={deletingComments}
                  formatDate={formatDate}
                  getInitials={getInitials}
                  showDeletedComments={showDeletedComments}
                />
              ))}
              {comments.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    {post?.status === "approved"
                      ? "Chưa có bình luận nào. Hãy là người đầu tiên bình luận!"
                      : "Bài viết này chưa được duyệt nên không thể xem bình luận."}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
