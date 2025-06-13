import React, { useEffect, useState } from "react";

import type { Post } from "@/types/post";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllPosts } from "@/services/posts/postService";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const ApprovePostPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getAllPosts();
        setPosts(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

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

  if (error) return <div className="p-4 text-red-500">Lỗi: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">
        Danh sách bài viết chờ duyệt
      </h1>

      <div className="border-2 rounded-3xl p-2 shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right pr-18">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.post_id}>
                <TableCell>{post.title}</TableCell>
                <TableCell>{post.approved_by || "Ẩn danh"}</TableCell>
                <TableCell
                  className={cn(
                    "font-medium",
                    post.status === "waiting"
                      ? "text-yellow-500"
                      : post.status === "approved"
                      ? "text-green-600"
                      : post.status === "rejected"
                      ? "text-red-600"
                      : "text-gray-600"
                  )}
                >
                  {post.status === "waiting"
                    ? "Chờ duyệt"
                    : post.status === "approved"
                    ? "Đã duyệt"
                    : post.status === "rejected"
                    ? "Bị từ chối"
                    : "Không xác định"}
                </TableCell>
                <TableCell>
                  {new Date(post.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button className="text-red-400 ">Từ chối</Button>
                  <Button className="text-green-600 ">Duyệt</Button>
                  <Button
                    className="text-blue-500"
                    onClick={() => setSelectedPost(post)}
                  >
                    Xem
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Dialog
          open={!!selectedPost}
          onOpenChange={() => setSelectedPost(null)}
        >
          <DialogContent className="w-full h-3/4 overflow-y-auto p-0"></DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ApprovePostPage;
