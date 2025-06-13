import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import type { Post } from "@/types/post";
import { useState } from "react";

interface PopupDetailProps {
  post: Post | null;
  onClose: () => void;
}

export const PopupDetail = ({ post, onClose }: PopupDetailProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  if (!post) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "text-yellow-600";
      case "approved":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <>
      {/* Popup chính */}
      <Dialog open={!!post} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-xl px-6 py-8 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              {post.title}
            </DialogTitle>
          </DialogHeader>

          {/* Trạng thái */}
          <div className="text-sm text-muted-foreground">
            <strong>Trạng thái:</strong>{" "}
            <span className={getStatusColor(post.status)}>
              {post.status === "waiting"
                ? "Chờ duyệt"
                : post.status === "approved"
                ? "Đã duyệt"
                : "Đã từ chối"}
            </span>
          </div>

          {/* Lý do từ chối */}
          {post.status === "rejected" && post.rejection_reason && (
            <div className="bg-red-100 border border-red-200 p-3 rounded-md text-sm text-red-700">
              <strong>Lý do từ chối:</strong> {post.rejection_reason}
            </div>
          )}

          {/* Hình ảnh */}
          {post.images?.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {post.images.map((img) => (
                <img
                  key={img.image_id}
                  src={img.image_url}
                  alt="Post Image"
                  onClick={() => setSelectedImage(img.image_url)}
                  className="rounded-lg border shadow-sm aspect-video object-cover cursor-pointer hover:opacity-80 transition"
                />
              ))}
            </div>
          )}

          {/* Nội dung */}
          <div>
            <h3 className="font-semibold mb-1">Nội dung:</h3>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {post.content}
            </div>
          </div>

          {/* Các bước thực hiện */}
          {post.steps && post.steps.length > 0 && (
            <div className="bg-gray-50 border rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg mb-4">Các bước thực hiện</h3>
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
          )}

          {/* Nguyên liệu */}
          {post.materials?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-1">Nguyên liệu</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                {post.materials.map((m) => (
                  <li key={m.material_id}>
                    {m.material_name} – {m.quantity} {m.unit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Chủ đề */}
          {post.topics?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-1">Chủ đề</h3>
              <div className="flex gap-2 flex-wrap">
                {post.topics.map((topic) => (
                  <Badge key={topic.topic_id} variant="outline">
                    {topic.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-1">Tags</h3>
              <div className="flex gap-2 flex-wrap">
                {post.tags.map((tag) => (
                  <Badge key={tag.tag_id}>{tag.name}</Badge>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="pt-6">
            <Button variant="secondary" onClick={onClose}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xem ảnh to */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Ảnh lớn"
              className="w-full h-auto object-contain rounded"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
