import React, { useEffect, useState } from "react";
import { Material } from "@/types/material";
import { Unit } from "@/types/unit";
import {
  getAllMaterials,
  updateMaterial,
  deleteMaterial,
  createMaterial,
  MaterialsPaginatedResponse,
} from "@/services/materials/materialService";
import { getAllUnits } from "@/services/units/unitService";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  PlusCircle,
  Search,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
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
import { UnitCombobox } from "@/components/common/UnitCombobox";

import { useAuthStore } from "@/stores/auth";

export default function MaterialManagementPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  const [newName, setNewName] = useState("");
  const [newUnitId, setNewUnitId] = useState("");
  const [newStatus, setNewStatus] = useState<"active" | "inactive">("active");

  // Edit dialog state
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editName, setEditName] = useState("");
  const [editUnitId, setEditUnitId] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "inactive">("active");
  const [editLoading, setEditLoading] = useState(false);

  const user = useAuthStore((state) => state.user);

  // Fetch units for dropdown
  const fetchUnits = async () => {
    try {
      const data = await getAllUnits(0, 1000); // Get all units for dropdown
      setUnits(data.units.filter((unit) => unit.status === "active"));
    } catch {
      toast.error("Không thể tải danh sách đơn vị.");
    }
  };

  // Fetch materials with pagination and search
  const fetchMaterials = async (page: number = 1, search: string = "") => {
    setLoading(true);
    try {
      const skip = (page - 1) * itemsPerPage;
      const data: MaterialsPaginatedResponse = await getAllMaterials(
        skip,
        itemsPerPage
      );
      let filtered = data.materials;
      let total = data.total;
      if (search.trim()) {
        filtered = data.materials.filter((material) =>
          material.name.toLowerCase().includes(search.toLowerCase())
        );
        total = filtered.length;
      }
      setMaterials(filtered);
      setTotalItems(total);
      setTotalPages(Math.ceil(total / itemsPerPage));
    } catch {
      toast.error("Không thể tải danh sách nguyên liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
    fetchMaterials(currentPage, searchTerm);
    // eslint-disable-next-line
  }, [currentPage, searchTerm]);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(Math.max(1, currentPage - 1));
  const goToNextPage = () => goToPage(Math.min(totalPages, currentPage + 1));

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCreate = async () => {
    if (!newName.trim() || !newUnitId) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    try {
      setCreating(true);
      toast.loading("Đang tạo nguyên liệu...");
      const newMaterial = await createMaterial({
        name: newName,
        unit_id: newUnitId,
        status: newStatus,
        image_url: "",
      });
      setMaterials((prev) => [newMaterial, ...prev]);
      setNewName("");
      setNewUnitId("");
      setNewStatus("active");
      toast.dismiss();
      toast.success(`Đã tạo nguyên liệu '${newMaterial.name}'`);
    } catch (error: unknown) {
      toast.dismiss();
      const errorMessage =
        error instanceof Error ? error.message : "Không thể tạo nguyên liệu.";
      toast.error(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (materialId: string) => {
    if (user?.role.role_name !== "admin") {
      toast.error(
        "Tài khoản không đủ quyền hạn, không thể xóa nguyên liệu này."
      );
      return;
    }

    try {
      toast.loading("Đang xóa nguyên liệu...");
      await deleteMaterial(materialId);
      setMaterials((prev) => prev.filter((m) => m.material_id !== materialId));
      toast.dismiss();
      toast.success("Đã xóa nguyên liệu");
    } catch {
      toast.dismiss();
      toast.error("Không thể xóa nguyên liệu.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial || !editName.trim() || !editUnitId) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    try {
      setEditLoading(true);
      toast.loading("Đang cập nhật nguyên liệu...");
      const updated = await updateMaterial(editingMaterial.material_id, {
        name: editName,
        unit_id: editUnitId,
        status: editStatus,
        image_url: "",
      });
      setMaterials((prev) =>
        prev.map((m) =>
          m.material_id === editingMaterial.material_id ? updated : m
        )
      );
      setEditingMaterial(null);
      setEditName("");
      setEditUnitId("");
      setEditStatus("active");
      toast.dismiss();
      toast.success(`Đã cập nhật nguyên liệu '${updated.name}'`);
    } catch (error: unknown) {
      toast.dismiss();
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể cập nhật nguyên liệu.";
      toast.error(errorMessage);
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quản lý Nguyên liệu
              </h1>
              <p className="text-gray-600 mt-1">
                Quản lý và tổ chức các nguyên liệu trong hệ thống
              </p>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg"
                size="lg"
              >
                <PlusCircle className="w-5 h-5" />
                Thêm Nguyên liệu
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Tạo nguyên liệu mới
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreate();
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Tên nguyên liệu *
                  </label>
                  <Input
                    placeholder="Nhập tên nguyên liệu"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Đơn vị *
                  </label>
                  <UnitCombobox
                    units={units}
                    value={newUnitId}
                    onValueChange={setNewUnitId}
                    placeholder="Chọn đơn vị"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Trạng thái
                  </label>
                  <Select
                    value={newStatus}
                    onValueChange={(val) =>
                      setNewStatus(val as "active" | "inactive")
                    }
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="inactive">Không hoạt động</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={creating} className="w-full">
                    {creating ? "Đang tạo..." : "Tạo nguyên liệu"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Section */}
        <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Tìm kiếm nguyên liệu..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Materials Table */}
        <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Tên Nguyên liệu
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Đơn vị
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <p className="text-gray-600">
                            Đang tải danh sách nguyên liệu...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : materials.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <Package className="w-12 h-12 text-gray-300" />
                          <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {searchTerm
                                ? "Không tìm thấy nguyên liệu phù hợp"
                                : "Không có nguyên liệu nào"}
                            </h3>
                            <p className="text-gray-600">
                              {searchTerm
                                ? "Thử tìm kiếm với từ khóa khác"
                                : "Chưa có nguyên liệu nào được tạo trong hệ thống"}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    materials.map((material) => (
                      <tr
                        key={material.material_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {material.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant="outline" className="text-xs">
                            {material.unit_name}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge
                            variant={
                              material.status === "active"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {material.status === "active"
                              ? "Hoạt động"
                              : "Không hoạt động"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingMaterial(material);
                                setEditName(material.name);
                                setEditUnitId(material.unit_id);
                                setEditStatus(
                                  material.status as "active" | "inactive"
                                );
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Xác nhận xóa nguyên liệu
                                  </AlertDialogTitle>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDelete(material.material_id!)
                                    }
                                  >
                                    Xác nhận
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && materials.length > 0 && (
              <div className="px-6 py-4 border-t bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Hiển thị {(currentPage - 1) * itemsPerPage + 1} đến{" "}
                    {Math.min(currentPage * itemsPerPage, totalItems)} trong
                    tổng số {totalItems} nguyên liệu
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToFirstPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => goToPage(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToLastPage}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog
          open={!!editingMaterial}
          onOpenChange={() => setEditingMaterial(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Sửa nguyên liệu
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Tên nguyên liệu *
                </label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Đơn vị *
                </label>
                <UnitCombobox
                  units={units}
                  value={editUnitId}
                  onValueChange={setEditUnitId}
                  placeholder="Chọn đơn vị"
                  disabled={editLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Trạng thái
                </label>
                <Select
                  value={editStatus}
                  onValueChange={(val) =>
                    setEditStatus(val as "active" | "inactive")
                  }
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={editLoading} className="flex-1">
                  {editLoading ? "Đang cập nhật..." : "Cập nhật"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
