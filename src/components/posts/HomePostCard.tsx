import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Bookmark, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import type { Post } from "@/types/post";
import { BookmarkModal } from "@/components/posts/BookmarkModal";
import { useAuthStore } from "@/stores/auth";

interface HomePostCardProps {
  post: Post;
  className?: string;
}

export function HomePostCard({ post, className }: HomePostCardProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role = user?.role?.role_name || "user";

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

  const handleCommentClick = () => {
    navigate(`/${role}/posts/${post.post_id}#comments`);
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
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
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <h3 className="text-lg font-semibold line-clamp-2">{post.title}</h3>
        <p className="text-muted-foreground line-clamp-3">{post.content}</p>

        {post.images && post.images.length > 0 && (
          <div>
            {post.images.length === 1 ? (
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={post.images[0].image_url}
                  alt={post.images[0].caption || "Post image"}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {post.images.slice(0, 4).map((image, index) => (
                  <div
                    key={image.image_id}
                    className="relative aspect-square bg-muted rounded-lg overflow-hidden"
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
          </div>
        )}

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

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-muted-foreground hover:text-blue-500"
              onClick={handleCommentClick}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Bình luận
            </Button>
          </div>
          <div className="flex items-center gap-2">
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
            <Button variant="ghost" size="sm" className="h-8 px-3" asChild>
              <Link to={`/${role}/posts/${post.post_id}`}>
                <ExternalLink className="h-4 w-4 mr-1" />
                Xem
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
