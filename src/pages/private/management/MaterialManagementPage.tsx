import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getAllMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from "@/services/materials/materialService";
import { getAllUnits } from "@/services/units/unitService";
import type { Material } from "@/types/material";
import type { Unit } from "@/types/unit";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/stores/auth";
import { UnitCombobox } from "@/components/common/UnitCombobox";

export default function MaterialManagementPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editUnit, setEditUnit] = useState("");

  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState("");

  const user = useAuthStore((state) => state.user);
  const toggleStatus = async (material: Material) => {
    if (user?.role.role_name !== "admin") {
      toast.error("Tài Khoản không đủ quyền hạn, không thể xoá nguyên liệu này.");
      return;
    }
    try {
      toast.loading("Đang cập nhật trạng thái...");
      const updated = await updateMaterial(material.material_id, {
        name: material.name,
        unit: material.unit,
        status: material.status === "active" ? "inactive" : "active",
        updated_by: user.account_id,
      });
      setMaterials((prev) =>
        prev.map((m) => (m.material_id === material.material_id ? updated : m))
      );
      toast.dismiss();
      toast.success("Đã cập nhật trạng thái.");
    } catch {
      toast.dismiss();
      toast.error("Không thể cập nhật trạng thái.");
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      toast.loading("Đang tải nguyên liệu...");
      try {
        const [materialsData, unitsData] = await Promise.all([
          getAllMaterials(),
          getAllUnits(),
        ]);
        setMaterials(materialsData);
        setUnits(unitsData.filter((u) => u.status === "active"));
        toast.dismiss();
      } catch {
        toast.dismiss();
        toast.error("Không thể tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim() || !newUnit || !user?.account_id) return;
    try {
      setCreating(true);
      toast.loading("Đang tạo nguyên liệu...");
      const newMaterial = await createMaterial({
        name: newName,
        unit: newUnit,
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
    setEditUnit(material.unit || "");
  };

  const handleSave = async () => {
    if (!editingId || !user?.account_id) return;
    try {
      toast.loading("Đang cập nhật...");
      const updated = await updateMaterial(editingId, {
        name: editName,
        unit: editUnit,
        updated_by: user.account_id,
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
    if (user?.role.role_name !== "admin") {
      toast.error("Tài Khoản không đủ quyền hạn, không thể xoá nguyên liệu này.");
      return;
    }
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
              <UnitCombobox
                units={units}
                value={newUnit}
                onChange={setNewUnit}
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
        <div className="rounded-xl border shadow-sm overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Tên nguyên liệu</TableHead>
                <TableHead className="w-1/4">Đơn vị</TableHead>
                <TableHead className="w-1/4">Trạng thái</TableHead>
                <TableHead className="text-center pr-6">Hành động</TableHead>
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
                      <TableCell>
                        <Select value={editUnit} onValueChange={setEditUnit}>
                          <UnitCombobox
                            units={units}
                            value={editUnit}
                            onChange={setEditUnit}
                          />
                        </Select>
                      </TableCell>
                      <TableCell className={material.status === "active" ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                        {material.status === "active" ? "Hoạt động" : "Không hoạt động"}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
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
                      <TableCell>{material.unit}</TableCell>
                      <TableCell className={material.status === "active" ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                        {material.status === "active" ? "Hoạt động" : "Không hoạt động"}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => toggleStatus(material)}
                            className="w-10"
                          >
                            {material.status === "active" ? "Ẩn" : "Hiện"}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleEdit(material)}
                          >
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
                                <AlertDialogTitle>
                                  Bạn có chắc không?
                                </AlertDialogTitle>
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
