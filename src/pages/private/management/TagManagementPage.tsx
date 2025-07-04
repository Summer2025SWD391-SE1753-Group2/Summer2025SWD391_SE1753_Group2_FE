import React, { useEffect, useState } from "react";
import { Tag } from "@/types/tag";
import {
  getAllTags,
  updateTag,
  deleteTag,
  createTag,
} from "@/services/tags/tagsService";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { Pagination } from "@/components/ui/pagination";

const PAGE_SIZE = 8;

export default function TagManagementPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [newName, setNewName] = useState("");
  const [newStatus, setNewStatus] = useState<"active" | "inactive">("active");
  const [currentPage, setCurrentPage] = useState(1);

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchTags = async () => {
      toast.loading("Đang tải tag...");
      try {
        const data = await getAllTags();
        setTags(data);
        toast.dismiss();
      } catch {
        toast.dismiss();
        toast.error("Không thể tải tag.");
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim() || !user?.account_id) return;

    try {
      setCreating(true);
      toast.loading("Đang tạo tag...");
      const newTag = await createTag({
        name: newName,
        status: newStatus,
        created_by: user.account_id,
      });
      setTags((prev) => [newTag, ...prev]);
      setNewName("");
      setNewStatus("active");
      setCurrentPage(1); // Reset về trang đầu
      toast.dismiss();
      toast.success(`Đã tạo tag '${newTag.name}'`);
    } catch {
      toast.dismiss();
      toast.error("Không thể tạo tag.");
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (tag: Tag) => {
    try {
      toast.loading("Đang cập nhật trạng thái...");
      const updated = await updateTag(tag.tag_id!, {
        name: tag.name,
        status: tag.status === "active" ? "inactive" : "active",
      });
      setTags((prev) =>
        prev.map((t) => (t.tag_id === tag.tag_id ? updated : t))
      );
      toast.dismiss();
      toast.success(`Đã cập nhật trạng thái tag '${updated.name}'`);
    } catch {
      toast.dismiss();
      toast.error("Không thể cập nhật trạng thái.");
    }
  };

  const handleDelete = async (id: string) => {
    if (user?.role.role_name !== "admin") {
      toast.error("Tài khoản không đủ quyền hạn, không thể xoá tag này.");
      return;
    }

    try {
      toast.loading("Đang xoá tag...");
      await deleteTag(id);
      setTags((prev) => prev.filter((t) => t.tag_id !== id));
      setCurrentPage(1); // Reset về trang đầu
      toast.dismiss();
      toast.success("Đã xoá tag");
    } catch {
      toast.dismiss();
      toast.error("Không thể xoá tag.");
    }
  };

  const totalPages = Math.ceil(tags.length / PAGE_SIZE);
  const paginatedTags = tags.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold"> Quản lý Tags</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">+ Thêm Tag</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo tag mới</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreate();
              }}
              className="space-y-4"
            >
              <Input
                placeholder="Tên tag"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <Select
                value={newStatus}
                onValueChange={(val) =>
                  setNewStatus(val as "active" | "inactive")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
              <DialogFooter>
                <Button type="submit" disabled={creating}>
                  {creating ? "Đang tạo..." : "Tạo"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : tags.length === 0 ? (
        <p>Không có tag nào luôn á </p>
      ) : (
        <div className="rounded-xl border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Tên Tag</TableHead>
                <TableHead className="w-1/3">Trạng thái</TableHead>
                <TableHead className="text-center">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTags.map((tag) => (
                <TableRow key={tag.tag_id}>
                  <TableCell>{tag.name}</TableCell>
                  <TableCell
                    className={cn(
                      "font-medium",
                      tag.status === "active"
                        ? "text-green-600"
                        : "text-red-500"
                    )}
                  >
                    {tag.status === "active" ? "Hoạt động" : "Không hoạt động"}
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => toggleStatus(tag)}
                        className="w-10"
                      >
                        {tag.status === "active" ? "Ẩn" : "Hiện"}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            Xoá
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Bạn có chắc muốn xoá tag này không?
                            </AlertDialogTitle>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Huỷ</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(tag.tag_id!)}
                            >
                              Xác nhận
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
