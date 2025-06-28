import React, { useEffect, useState } from "react";
import {
  getAllUnits,
  createUnit,
  updateUnit,
  deleteUnit,
} from "@/services/units/unitService";
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
import { Unit } from "@/types/unit";

export default function UnitManagementPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "inactive">("active");
  const [newName, setNewName] = useState("");
  const [newStatus, setNewStatus] = useState<"active" | "inactive">("active");

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchUnits = async () => {
      toast.loading("Đang tải đơn vị...");
      try {
        const data = await getAllUnits();
        setUnits(data);
        toast.dismiss();
      } catch {
        toast.dismiss();
        toast.error("Không thể tải đơn vị.");
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim() || !user?.account_id) return;

    try {
      setCreating(true);
      toast.loading("Đang tạo đơn vị...");
      const newUnit = await createUnit({
        name: newName,
        status: newStatus,
        created_by: user.account_id,
      });
      setUnits((prev) => [newUnit, ...prev]);
      setNewName("");
      setNewStatus("active");
      toast.dismiss();
      toast.success(`Đã tạo đơn vị '${newUnit.name}'`);
    } catch {
      toast.dismiss();
      toast.error("Không thể tạo đơn vị.");
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (unit: Unit) => {
    setEditingId(unit.unit_id);
    setEditName(unit.name);
    setEditStatus(unit.status);
  };

  const handleSave = async () => {
    if (!editingId || !user?.account_id) return;

    try {
      toast.loading("Đang cập nhật đơn vị...");
      const updated = await updateUnit(editingId, {
        name: editName,
        status: editStatus,
        updated_by: user.account_id,
      });
      setUnits((prev) => prev.map((u) => (u.unit_id === editingId ? updated : u)));
      setEditingId(null);
      toast.dismiss();
      toast.success(`Đơn vị '${updated.name}' đã được cập nhật.`);
    } catch {
      toast.dismiss();
      toast.error("Không thể cập nhật đơn vị.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      toast.loading("Đang xoá đơn vị...");
      await deleteUnit(id);
      setUnits((prev) => prev.filter((u) => u.unit_id !== id));
      toast.dismiss();
      toast.success("Đã xoá đơn vị");
    } catch {
      toast.dismiss();
      toast.error("Tài Khoản không đủ quyền hạn, không thể xoá đơn vị.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý Đơn vị</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">+ Thêm Đơn vị</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo đơn vị mới</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreate();
              }}
              className="space-y-4"
            >
              <Input
                placeholder="Tên đơn vị"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <Select
                value={newStatus}
                onValueChange={(val) => setNewStatus(val as "active" | "inactive")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Đang sử dụng</SelectItem>
                  <SelectItem value="inactive">Ngưng sử dụng</SelectItem>
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
      ) : units.length === 0 ? (
        <p>Không có đơn vị nào</p>
      ) : (
        <div className="rounded-xl border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Tên đơn vị</TableHead>
                <TableHead className="w-1/3">Trạng thái</TableHead>
                <TableHead className="text-center">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map((unit) => (
                <TableRow key={unit.unit_id}>
                  {editingId === unit.unit_id ? (
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
                            <SelectItem value="active">Đang sử dụng</SelectItem>
                            <SelectItem value="inactive">Ngưng sử dụng</SelectItem>
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
                      <TableCell>{unit.name}</TableCell>
                      <TableCell
                        className={cn(
                          "font-medium",
                          unit.status === "active" ? "text-green-600" : "text-red-500"
                        )}
                      >
                        {unit.status === "active" ? "Đang sử dụng" : "Ngưng sử dụng"}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button size="sm" onClick={() => handleEdit(unit)}>Sửa</Button>
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
                                <AlertDialogAction onClick={() => handleDelete(unit.unit_id)}>
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
