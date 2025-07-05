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
      <Dialog open={!!post} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl px-6 py-8 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold leading-tight">
              {post.title}
            </DialogTitle>
          </DialogHeader>

          {/* Trạng thái */}
          <div className="text-sm">
            <span className="font-medium text-muted-foreground">
              Trạng thái:
            </span>{" "}
            <span className={`font-semibold ${getStatusColor(post.status)}`}>
              {post.status === "waiting"
                ? "Chờ duyệt"
                : post.status === "approved"
                ? "Đã duyệt"
                : "Đã từ chối"}
            </span>
          </div>

          {/* Lý do từ chối */}
          {post.status === "rejected" && post.rejection_reason && (
            <div className="bg-red-50 border border-red-200 text-sm text-red-700 rounded-md p-4">
              <strong>Lý do từ chối:</strong> {post.rejection_reason}
            </div>
          )}

          {/* Hình ảnh */}
          <h3 className="font-semibold mb-2 text-base">Hình ảnh:</h3>
          {post.images?.length > 0 && (
            <section className="w-full">
              <div
                className={`
        grid gap-4
        ${
          post.images.length === 1
            ? "grid-cols-1"
            : post.images.length === 2
            ? "grid-cols-2"
            : post.images.length === 3
            ? "grid-cols-2"
            : post.images.length === 4
            ? "grid-cols-2"
            : "grid-cols-3"
        }
      `}
              >
                {post.images.map((img) => (
                  <img
                    key={img.image_id}
                    src={img.image_url}
                    alt="Post Image"
                    onClick={() => setSelectedImage(img.image_url)}
                    className={`
            w-full rounded-xl border shadow-sm object-cover cursor-pointer
            transition hover:opacity-90
            ${
              post.images.length === 1
                ? "aspect-video max-h-[400px]"
                : "aspect-[4/3] max-h-[240px]"
            }
          `}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Nội dung */}
          <section>
            <h3 className="font-semibold mb-2 text-base">Nội dung:</h3>
            <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
              {post.content}
            </div>
          </section>

          {/* Các bước thực hiện */}
          {post.steps?.length > 0 && (
            <section className="space-y-4">
              <h3 className="font-semibold text-base">Các bước thực hiện:</h3>
              <div className="grid gap-4">
                {post.steps
                  .sort((a, b) => a.order_number - b.order_number)
                  .map((step) => (
                    <div
                      key={step.step_id}
                      className="border border-muted rounded-lg p-4 bg-muted/30"
                    >
                      <h4 className="font-medium mb-2">
                        Bước {step.order_number}:
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {step.content}
                      </p>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Nguyên liệu */}
          {post.materials?.length > 0 && (
            <section>
              <h3 className="font-semibold mb-2 text-base">Nguyên liệu:</h3>
              <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                {post.materials.map((m) => (
                  <li key={m.material_id}>
                    {m.material_name} – {m.quantity} {m.unit}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Chủ đề */}
          {post.topics?.length > 0 && (
            <section>
              <h3 className="font-semibold mb-2 text-base">Chủ đề:</h3>
              <div className="flex flex-wrap gap-2">
                {post.topics.map((topic) => (
                  <Badge key={topic.topic_id} variant="outline">
                    {topic.name}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Tags */}
          {post.tags?.length > 0 && (
            <section>
              <h3 className="font-semibold mb-2 text-base">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag.tag_id}>{tag.name}</Badge>
                ))}
              </div>
            </section>
          )}

          <DialogFooter className="pt-6">
            <Button variant="secondary" onClick={onClose}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Xem ảnh lớn */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-xl">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Xem ảnh lớn"
              className="w-full object-contain rounded"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
