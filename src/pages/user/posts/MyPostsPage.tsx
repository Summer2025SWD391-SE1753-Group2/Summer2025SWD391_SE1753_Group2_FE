import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Post } from "@/types/post";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMyPosts } from "@/services/posts/postService";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Edit,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { paths } from "@/utils/constant/path";
import { PostDetailPopup } from "@/components/posts/PostDetailPopup";

const MyPostsPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const fetchMyPosts = async () => {
    setLoading(true);
    try {
      const data = await getMyPosts(0, 50);
      setPosts(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

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

  const getPostCounts = () => {
    const approved = posts.filter((p) => p.status === "approved").length;
    const waiting = posts.filter((p) => p.status === "waiting").length;
    const rejected = posts.filter((p) => p.status === "rejected").length;
    return { approved, waiting, rejected, total: posts.length };
  };

  const counts = getPostCounts();

  const handleUpdatePost = (post: Post) => {
    navigate(`/user/posts/edit/${post.post_id}`);
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) return <div className="p-4 text-red-500">Lỗi: {error}</div>;

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý bài viết của tôi</h1>
        <Button asChild>
          <Link to={paths.user.createPost}>Tạo bài viết mới</Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng bài viết
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">
              Đã duyệt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {counts.approved}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">
              Chờ duyệt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {counts.waiting}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">
              Bị từ chối
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {counts.rejected}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Posts Table */}
      {posts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              Bạn chưa có bài viết nào.
              <Link to="/posts/create" className="text-primary ml-1 underline">
                Tạo bài viết đầu tiên
              </Link>
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Danh sách bài viết</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Lý do từ chối</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.post_id}>
                    <TableCell className="font-medium max-w-xs">
                      <div className="truncate" title={post.title}>
                        {post.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "flex items-center gap-1 w-fit",
                          getStatusColor(post.status)
                        )}
                      >
                        {getStatusIcon(post.status)}
                        {getStatusText(post.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(post.created_at).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {post.rejection_reason ? (
                        <div
                          className="truncate text-red-600"
                          title={post.rejection_reason}
                        >
                          {post.rejection_reason}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {/* Button Xem - chỉ hiển thị cho bài chờ duyệt/từ chối */}
                      {(post.status === "waiting" ||
                        post.status === "rejected") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPost(post)}
                        >
                          <Eye className="h-4 w-4" />
                          Xem
                        </Button>
                      )}

                      {/* Button Xem chi tiết - chỉ hiển thị cho bài đã duyệt */}
                      {post.status === "approved" && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/posts/${post.post_id}`} target="_blank">
                            <Eye className="h-4 w-4" />
                            Xem chi tiết
                          </Link>
                        </Button>
                      )}

                      {/* Button Cập nhật - chỉ hiển thị cho bài đã duyệt */}
                      {post.status === "approved" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdatePost(post)}
                          title="Cập nhật bài viết sẽ chuyển về trạng thái chờ duyệt"
                        >
                          <Edit className="h-4 w-4" />
                          Cập nhật
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Popup xem chi tiết - Sử dụng PostDetailPopup để hiển thị đầy đủ thông tin */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Chi tiết bài viết</DialogTitle>
          <DialogDescription className="sr-only">
            Xem thông tin chi tiết của bài viết
          </DialogDescription>
          {selectedPost && (
            <PostDetailPopup
              post={selectedPost}
              onClose={() => setSelectedPost(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyPostsPage;
