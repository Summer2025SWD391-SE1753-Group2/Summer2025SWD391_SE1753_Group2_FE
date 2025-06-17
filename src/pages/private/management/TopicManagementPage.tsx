import React, { useEffect, useState } from "react";

import {
  getAllTopics,
  createTopic,
  updateTopic,
  deleteTopic,
} from "@/services/topics/topicService";

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
import { Topic } from "@/types/topic";

export default function TopicManagementPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "inactive">("active");

  const [newName, setNewName] = useState("");
  const [newStatus, setNewStatus] = useState<"active" | "inactive">("active");

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchTopics = async () => {
      toast.loading("Đang tải chủ đề...");
      try {
        const data = await getAllTopics();
        setTopics(data);
        toast.dismiss();
      } catch {
        toast.dismiss();
        toast.error("Không thể tải chủ đề.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim() || !user?.account_id) return;

    try {
      setCreating(true);
      toast.loading("Đang tạo chủ đề...");
      const newTopic = await createTopic({
        name: newName,
        status: newStatus,
        created_by: user.account_id,
      });
      setTopics((prev) => [newTopic, ...prev]);
      setNewName("");
      setNewStatus("active");
      toast.dismiss();
      toast.success(`Đã tạo chủ đề '${newTopic.name}'`);
    } catch {
      toast.dismiss();
      toast.error("Không thể tạo chủ đề.");
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (topic: Topic) => {
    setEditingId(topic.topic_id || null);
    setEditName(topic.name);
    setEditStatus(topic.status);
  };

  const handleSave = async () => {
    if (!editingId) return;

    try {
      toast.loading("Đang cập nhật chủ đề...");
      const updated = await updateTopic(editingId, {
        name: editName,
        status: editStatus,
      });
      setTopics((prev) =>
        prev.map((t) => (t.topic_id === editingId ? updated : t))
      );
      setEditingId(null);
      toast.dismiss();
      toast.success(`Chủ đề '${updated.name}' đã được cập nhật.`);
    } catch {
      toast.dismiss();
      toast.error("Không thể cập nhật chủ đề.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      toast.loading("Đang xoá chủ đề...");
      await deleteTopic(id);
      setTopics((prev) => prev.filter((t) => t.topic_id !== id));
      toast.dismiss();
      toast.success("Đã xoá chủ đề");
    } catch {
      toast.dismiss();
      toast.error("Không thể xoá chủ đề.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold"> Quản lý Chủ đề</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">+ Thêm Chủ đề</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo chủ đề mới</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreate();
              }}
              className="space-y-4"
            >
              <Input
                placeholder="Tên chủ đề"
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
      ) : topics.length === 0 ? (
        <p>Không có chủ đề nào luôn á</p>
      ) : (
        <div className="rounded-xl border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Tên Chủ đề</TableHead>
                <TableHead className="w-1/3">Trạng thái</TableHead>
                <TableHead className="text-center">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topics.map((topic) => (
                <TableRow key={topic.topic_id}>
                  {editingId === topic.topic_id ? (
                    <>
                      <TableCell>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={editStatus}
                          onValueChange={(val) =>
                            setEditStatus(val as "active" | "inactive")
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
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button size="sm" onClick={handleSave}>Lưu</Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setEditingId(null)}
                          >
                            Huỷ
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{topic.name}</TableCell>
                      <TableCell
                        className={cn(
                          "font-medium",
                          topic.status === "active" ? "text-green-600" : "text-red-500"
                        )}
                      >
                        {topic.status === "active" ? "Hoạt động" : "Không hoạt động"}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button size="sm" onClick={() => handleEdit(topic)}>Sửa</Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">Xoá</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Bạn có chắc không?</AlertDialogTitle>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Huỷ</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(topic.topic_id!)}
                                >
                                  Xác nhận
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
