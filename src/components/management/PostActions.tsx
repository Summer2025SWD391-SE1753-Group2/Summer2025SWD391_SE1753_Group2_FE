import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PopupDetail } from "./PopupDetail";
import { PopupReject } from "./PopupReject";
import { getPostById, moderatePost } from "@/services/posts/postService";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Post } from "@/types/post";
import { useAuthStore } from "@/stores/auth";
import { paths } from "@/utils/constant/path";
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Calendar,
} from "lucide-react";

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
  const navigate = useNavigate();
  const { user } = useAuthStore();
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

  const handleReview = () => {
    const reviewPath =
      user?.role?.role_name === "admin"
        ? paths.admin.postReview.replace(":postId", post.post_id)
        : paths.moderator.postReview.replace(":postId", post.post_id);
    navigate(reviewPath);
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
      <TableRow className="hover:bg-gray-50/50">
        <TableCell className="font-medium">
          <div className="max-w-[250px] truncate" title={post.title}>
            {post.title}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
              {(post.creator?.username || "A")[0].toUpperCase()}
            </div>
            <span className="text-sm">
              {post.creator?.username || "Ẩn danh"}
            </span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            {post.status === "waiting" && (
              <>
                <Calendar className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-600 font-medium text-sm">
                  Chờ duyệt
                </span>
              </>
            )}
            {post.status === "approved" && (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-600 font-medium text-sm">
                  Đã duyệt
                </span>
              </>
            )}
            {post.status === "rejected" && (
              <>
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-600 font-medium text-sm">
                  Từ chối
                </span>
              </>
            )}
          </div>
        </TableCell>
        <TableCell className="text-sm text-gray-600">
          {new Date(post.created_at).toLocaleDateString("vi-VN")}
        </TableCell>
        <TableCell className="text-center">
          <div className="flex items-center justify-center gap-2 min-h-[36px]">
            {/* Nút xem bài viết - luôn hiển thị */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleView}
              className="h-8 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <Eye className="w-4 h-4 mr-1" />
              Xem nhanh
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReview}
              className="h-8 bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
            >
              <FileText className="w-4 h-4 mr-1" />
              Xem chi tiết
            </Button>

            {/* Dropdown menu cho các action duyệt/từ chối */}
            {post.status === "waiting" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={handleApprove}
                    className="text-green-600"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Duyệt bài viết
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setRejectingPost(post)}
                    className="text-red-600"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Từ chối bài viết
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Placeholder để giữ alignment cho các bài viết đã duyệt/từ chối */
              <div className="w-8 h-8"></div>
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* Popup xem chi tiết */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPost && (
            <PopupDetail
              post={selectedPost}
              onClose={() => setSelectedPost(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Popup từ chối */}
      <Dialog
        open={!!rejectingPost}
        onOpenChange={() => setRejectingPost(null)}
      >
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
