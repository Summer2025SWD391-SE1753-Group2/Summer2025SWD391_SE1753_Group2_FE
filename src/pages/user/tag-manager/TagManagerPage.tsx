import React, { useEffect, useState } from "react";
import { Tag } from "@/types/tag";
import { getAllTags, updateTag, deleteTag, createTag } from "@/services/tags/tags-service";
import { useAuthStore } from "@/store/auth/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function TagManagerPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "inactive">("active");

  const [newName, setNewName] = useState("");
  const [newStatus, setNewStatus] = useState<"active" | "inactive">("active");

  const user = useAuthStore((state) => state.user);

 useEffect(() => {
  const fetchTags = async () => {
    toast.loading("Đang tải tag..."); // toast loading
    try {
      const data = await getAllTags();
      setTags(data);
      toast.dismiss(); // tắt toast loading khi thành công
    } catch (err) {
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
    toast.dismiss();
    toast.success(`Đã tạo tag '${newTag.name}'`);
  } catch (err) {
    toast.dismiss();
    toast.error("Không thể tạo tag.");
  } finally {
    setCreating(false);
  }
};

const handleEdit = (tag: Tag) => {
  setEditingId(tag.tag_id || null);
  setEditName(tag.name);
  setEditStatus(tag.status);
};


const handleSave = async () => {
  if (!editingId) return;

  try {
    toast.loading("Đang cập nhật tag...");
    const updated = await updateTag(editingId, {
      name: editName,
      status: editStatus,
    });
    setTags((prev) => prev.map((t) => (t.tag_id === editingId ? updated : t)));
    setEditingId(null);
    toast.dismiss();
    toast.success(`Tag '${updated.name}' đã được cập nhật.`);
  } catch (err) {
    toast.dismiss();
    toast.error("Không thể cập nhật tag.");
  }
};

const handleDelete = async (id: string) => {
  try {
    toast.loading("Đang xoá tag...");
    await deleteTag(id);
    setTags((prev) => prev.filter((t) => t.tag_id !== id));
    toast.dismiss();
    toast.success("Đã xoá tag");
  } catch (err) {
    toast.dismiss();
    toast.error("Không thể xoá tag.");
  }
};


  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">🏷️ Quản lý Tags</h1>
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
            >
            <Input
              placeholder="Tên tag"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Select value={newStatus} onValueChange={(val) => setNewStatus(val as "active" | "inactive")}>
              <SelectTrigger><SelectValue placeholder="Trạng thái" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">active</SelectItem>
                <SelectItem value="inactive">inactive</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={creating}>
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
  <p>Không có tag nào luôn á 😅</p>
) : (
  <table className="min-w-full table-auto border-collapse border border-gray-300">
    <thead>
      <tr className="bg-gray-100">
        <th className="border border-gray-300 px-4 py-2 text-left">Tên Tag</th>
        <th className="border border-gray-300 px-4 py-2 text-left">Trạng Thái</th>
        {/* <th className="border border-gray-300 px-4 py-2 text-left">Tạo bởi</th> */}
        <th className="border border-gray-300 px-4 py-2 text-center">Hành động</th>
      </tr>
    </thead>
    <tbody>
      {tags.map((tag) => (
        <tr key={tag.tag_id} className="even:bg-gray-50">
          {editingId === tag.tag_id ? (
            <>
              <td className="border border-gray-300 px-4 py-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full"
                />
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <Select
                  value={editStatus}
                  onValueChange={(val) => setEditStatus(val as "active" | "inactive")}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">active</SelectItem>
                    <SelectItem value="inactive">inactive</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              {/* <td className="border border-gray-300 px-4 py-2">
                {tag.created_by?.slice(0, 6)}...
              </td> */}
              <td className="border border-gray-300 px-4 py-2 text-center flex justify-center gap-2">
                <Button size="sm" onClick={handleSave}>Lưu</Button>
                <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>Huỷ</Button>
              </td>
            </>
          ) : (
            <>
              <td className="border border-gray-300 px-4 py-2">{tag.name}</td>
              <td
                className={`border border-gray-300 px-4 py-2 font-medium ${
                  tag.status === "active" ? "text-green-600" : "text-red-500"
                }`}
              >
                {tag.status}
              </td>
              {/* <td className="border border-gray-300 px-4 py-2 text-gray-600">
                {tag.created_by?.slice(0, 6)}...
              </td> */}
              <td className="border border-gray-300 px-4 py-2 text-center flex justify-center gap-2">
                <Button size="sm" onClick={() => handleEdit(tag)}>Sửa</Button>
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
                      <AlertDialogAction onClick={() => handleDelete(tag.tag_id!)}>Xác nhận</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </td>
            </>
          )}
        </tr>
      ))}
    </tbody>
  </table>
)}

    </div>
  );
}
