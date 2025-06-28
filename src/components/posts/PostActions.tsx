import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PopupDetail } from "./PopupDetail";
import { PopupReject } from "./PopupReject";
import { getPostById, moderatePost } from "@/services/posts/postService";
import { useState } from "react";
import type { Post } from "@/types/post";

type Props = {
  post: Post;
  moderatorId: string;
  updatePostStatus: (postId: string, status: "approved" | "rejected") => void;
};

export const PostActions: React.FC<Props> = ({
  post,
  moderatorId,
  updatePostStatus,
}) => {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [rejectingPost, setRejectingPost] = useState<Post | null>(null);

  const handleView = async () => {
    try {
      const fullPost = await getPostById(post.post_id);
      setSelectedPost(fullPost);
    } catch (err) {
      alert("Không thể tải bài viết: " + (err as Error).message);
    }
  };

  const handleApprove = async () => {
    try {
      await moderatePost(post.post_id, {
        status: "approved",
        rejection_reason: "",
        approved_by: moderatorId,
      });
      updatePostStatus(post.post_id, "approved");
    } catch (err) {
      alert("Duyệt thất bại: " + (err as Error).message);
    }
  };

  return (
    <>
      <TableRow>
        <TableCell>{post.title}</TableCell>
        <TableCell>{post.creator?.username || "Ẩn danh"}</TableCell>
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
        <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
        <TableCell className="text-right space-x-1">
          <Button className="text-red-400" onClick={() => setRejectingPost(post)}>Từ chối</Button>
          <Button className="text-green-600" onClick={handleApprove}>Duyệt</Button>
          <Button className="text-blue-500" onClick={handleView}>Xem</Button>
        </TableCell>
      </TableRow>

      {/* Popup xem chi tiết */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedPost && <PopupDetail post={selectedPost} onClose={() => setSelectedPost(null)} />}
        </DialogContent>
      </Dialog>

      {/* Popup từ chối */}
      <Dialog open={!!rejectingPost} onOpenChange={() => setRejectingPost(null)}>
        <DialogContent className="max-w-md">
          {rejectingPost && (
            <PopupReject
              postId={rejectingPost.post_id}
              approvedBy={moderatorId}
              onSuccess={() => {
                updatePostStatus(rejectingPost.post_id, "rejected");
                setRejectingPost(null);
              }}
              onClose={() => setRejectingPost(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
