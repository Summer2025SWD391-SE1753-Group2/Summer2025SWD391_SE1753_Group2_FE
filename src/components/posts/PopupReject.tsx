import React, { useState } from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { moderatePost } from "@/services/posts/postService";

interface Props {
  postId: string;
  approvedBy: string; // ID người duyệt
  onSuccess?: () => void;
  onClose: () => void;
}

export const PopupReject = ({ postId, approvedBy, onSuccess, onClose }: Props) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!reason.trim()) return;
    setLoading(true);
    try {
      await moderatePost(postId, {
        status: "rejected",
        rejection_reason: reason,
        approved_by: approvedBy,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      alert("Từ chối thất bại: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Lý do từ chối bài viết</DialogTitle>
      </DialogHeader>
      <div className="space-y-3 py-2">
        <Textarea
          placeholder="Nhập lý do từ chối..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Huỷ
        </Button>
        <Button onClick={handleReject} disabled={loading || !reason.trim()}>
          {loading ? "Đang gửi..." : "Từ chối"}
        </Button>
      </DialogFooter>
    </>
  );
};
