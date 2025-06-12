import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  getAllMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from "@/services/materials/materialService";
import type { Material } from "@/types/material";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useAuthStore } from "@/stores/auth";

export default function MaterialManagementPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editUnit, setEditUnit] = useState("");

  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState("");

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchMaterials = async () => {
      toast.loading("Đang tải nguyên liệu...");
      try {
        const data = await getAllMaterials();
        setMaterials(data);
        toast.dismiss();
      } catch {
        toast.dismiss();
        toast.error("Không thể tải nguyên liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim() || !newUnit.trim() || !user?.account_id) return;
    try {
      setCreating(true);
      toast.loading("Đang tạo nguyên liệu...");
      const newMaterial = await createMaterial({
        name: newName,
        status: "active",
        image_url: "",
        created_by: user.account_id,
      });
      setMaterials((prev) => [newMaterial, ...prev]);
      setNewName("");
      setNewUnit("");
      toast.dismiss();
      toast.success("Đã tạo nguyên liệu");
    } catch {
      toast.dismiss();
      toast.error("Không thể tạo nguyên liệu.");
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (material: Material) => {
    setEditingId(material.material_id);
    setEditName(material.name);

  };

  const handleSave = async () => {
    if (!editingId) return;
    try {
      toast.loading("Đang cập nhật...");
      const updated = await updateMaterial(editingId, {
        name: editName,
      });
      setMaterials((prev) =>
        prev.map((m) => (m.material_id === editingId ? updated : m))
      );
      setEditingId(null);
      toast.dismiss();
      toast.success("Đã cập nhật nguyên liệu.");
    } catch {
      toast.dismiss();
      toast.error("Cập nhật thất bại.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      toast.loading("Đang xoá...");
      await deleteMaterial(id);
      setMaterials((prev) => prev.filter((m) => m.material_id !== id));
      toast.dismiss();
      toast.success("Đã xoá nguyên liệu");
    } catch {
      toast.dismiss();
      toast.error("Không thể xoá nguyên liệu.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý Nguyên liệu</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">+ Thêm Nguyên liệu</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm nguyên liệu mới</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreate();
              }}
              className="space-y-4"
            >
              <Input
                placeholder="Tên nguyên liệu"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
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
      ) : (
        <div className="rounded-xl border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Tên nguyên liệu</TableHead>
                <TableHead className="text-end pr-6">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material.material_id}>
                  {editingId === material.material_id ? (
                    <>
                      <TableCell>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={handleSave}>
                            Lưu
                          </Button>
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
                      <TableCell>{material.name}</TableCell>
                      <TableCell className="text-end">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={() => handleEdit(material)}>
                            Sửa
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                Xoá
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Bạn có chắc không?</AlertDialogTitle>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Huỷ</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDelete(material.material_id)
                                  }
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
