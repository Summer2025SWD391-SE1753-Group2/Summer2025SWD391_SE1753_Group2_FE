import React, { useEffect, useState } from "react";
import {
  getAllUnits,
  createUnit,
  updateUnit,
  deleteUnit,
  UnitsPaginatedResponse,
} from "@/services/units/unitService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
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
import { useAuthStore } from "@/stores/auth";
import { Unit } from "@/types/unit";

export default function UnitManagementPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  const [newName, setNewName] = useState("");
  const [newStatus, setNewStatus] = useState<"active" | "inactive">("active");

  // Edit dialog state
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "inactive">("active");
  const [editLoading, setEditLoading] = useState(false);

  const user = useAuthStore((state) => state.user);

  // Fetch units with pagination and search
  const fetchUnits = async (page: number = 1, search: string = "") => {
    setLoading(true);
    try {
      const skip = (page - 1) * itemsPerPage;
      const data: UnitsPaginatedResponse = await getAllUnits(
        skip,
        itemsPerPage
      );
      let filtered = data.units;
      let total = data.total;
      if (search.trim()) {
        filtered = data.units.filter((unit) =>
          unit.name.toLowerCase().includes(search.toLowerCase())
        );
        total = filtered.length;
      }
      setUnits(filtered);
      setTotalItems(total);
      setTotalPages(Math.ceil(total / itemsPerPage));
    } catch {
      toast.error("Không thể tải danh sách đơn vị.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits(currentPage, searchTerm);
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
    if (!newName.trim() || !user?.account_id) return;

    try {
      setCreating(true);
      toast.loading("Đang tạo đơn vị...");
      const newUnit = await createUnit({
        name: newName,
        description: "",
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

  const handleDelete = async (unitId: string) => {
    if (user?.role.role_name !== "admin") {
      toast.error("Tài khoản không đủ quyền hạn, không thể xóa đơn vị này.");
      return;
    }

    try {
      toast.loading("Đang xóa đơn vị...");
      await deleteUnit(unitId);
      setUnits((prev) => prev.filter((u) => u.unit_id !== unitId));
      toast.dismiss();
      toast.success("Đã xóa đơn vị");
    } catch {
      toast.dismiss();
      toast.error("Không thể xóa đơn vị.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit || !editName.trim()) return;

    try {
      setEditLoading(true);
      toast.loading("Đang cập nhật đơn vị...");
      const updated = await updateUnit(editingUnit.unit_id, {
        name: editName,
        description: "",
        status: editStatus,
        updated_by: user?.account_id,
      });
      setUnits((prev) =>
        prev.map((u) => (u.unit_id === editingUnit.unit_id ? updated : u))
      );
      setEditingUnit(null);
      setEditName("");
      setEditStatus("active");
      toast.dismiss();
      toast.success(`Đã cập nhật đơn vị '${updated.name}'`);
    } catch {
      toast.dismiss();
      toast.error("Không thể cập nhật đơn vị.");
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
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quản lý Đơn vị
              </h1>
              <p className="text-gray-600 mt-1">
                Quản lý các đơn vị và tổ chức trong hệ thống
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
                Thêm Đơn vị
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Tạo đơn vị mới
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
                    Tên đơn vị *
                  </label>
                  <Input
                    placeholder="Nhập tên đơn vị"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="h-12"
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
                    {creating ? "Đang tạo..." : "Tạo đơn vị"}
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
                placeholder="Tìm kiếm đơn vị..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Units Table */}
        <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Tên Đơn vị
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
                      <td colSpan={3} className="px-6 py-12">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <p className="text-gray-600">
                            Đang tải danh sách đơn vị...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : units.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <Building2 className="w-12 h-12 text-gray-300" />
                          <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {searchTerm
                                ? "Không tìm thấy đơn vị phù hợp"
                                : "Không có đơn vị nào"}
                            </h3>
                            <p className="text-gray-600">
                              {searchTerm
                                ? "Thử tìm kiếm với từ khóa khác"
                                : "Chưa có đơn vị nào được tạo trong hệ thống"}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    units.map((unit) => (
                      <tr
                        key={unit.unit_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {unit.name}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <Badge
                            variant={
                              unit.status === "active"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {unit.status === "active"
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
                                setEditingUnit(unit);
                                setEditName(unit.name);
                                setEditStatus(
                                  unit.status as "active" | "inactive"
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
                                    Xác nhận xóa đơn vị
                                  </AlertDialogTitle>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(unit.unit_id!)}
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
            {!loading && units.length > 0 && (
              <div className="px-6 py-4 border-t bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Hiển thị {(currentPage - 1) * itemsPerPage + 1} đến{" "}
                    {Math.min(currentPage * itemsPerPage, totalItems)} trong
                    tổng số {totalItems} đơn vị
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
        <Dialog open={!!editingUnit} onOpenChange={() => setEditingUnit(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Sửa đơn vị
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Tên đơn vị *
                </label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-12"
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
