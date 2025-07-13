import { useEffect, useState } from "react";
import { banAccount, getAllAccounts } from "@/services/accounts/accountService";
import type { UserProfile } from "@/types/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useAuthStore } from "@/stores/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export default function UserManagementPage() {
  const [accounts, setAccounts] = useState<UserProfile[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const user = useAuthStore((state) => state.user);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const status = statusFilter === "all" ? undefined : statusFilter;
      const result = await getAllAccounts(status);
      setAccounts(result);
      applySearch(result, searchTerm);
    } catch {
      setAccounts([]);
      setFilteredAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [statusFilter]);


  const handleBan = async (accountId: string) => {
    try {
      toast.loading("Đang khóa tài khoản...");

      await banAccount(accountId);
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.account_id === accountId ? { ...acc, status: "banned" } : acc
        )
      );
      setFilteredAccounts((prev) =>
        prev.map((acc) =>
          acc.account_id === accountId ? { ...acc, status: "banned" } : acc
        )
      );

      toast.dismiss();
      toast.success("Tài khoản đã bị khóa thành công");
    } catch {
      toast.dismiss();
      toast.error("Không thể khóa tài khoản");
    }
  };



  const applySearch = (data: UserProfile[], term: string) => {
    if (term.trim() === "") {
      setFilteredAccounts(data);
    } else {
      const filtered = data.filter(
        (acc) =>
          acc.full_name?.toLowerCase().includes(term.toLowerCase()) ||
          acc.email.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredAccounts(filtered);
    }
    setCurrentPage(1);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applySearch(accounts, term);
  };

  const totalPages = Math.ceil(filteredAccounts.length / PAGE_SIZE);
  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const renderStatus = (status: string) => {
    const color =
      status === "active"
        ? "green"
        : status === "banned"
          ? "red"
          : "gray";
    const label =
      status === "active"
        ? "Đang hoạt động"
        : status === "banned"
          ? "Bị khóa"
          : "Không hoạt động";
    return <Badge variant={color === "gray" ? "outline" : "default"}>{label}</Badge>;
  };

  const renderRole = (role: string) => {
    const colorClass =
      role === "admin"
        ? "text-red-600"
        : role === "moderator"
          ? "text-blue-600"
          : "text-green-700";
    const label =
      role === "admin"
        ? "Quản trị viên"
        : role === "moderator"
          ? "Kiểm duyệt viên"
          : "Thành viên";
    return <span className={`${colorClass} font-medium`}>{label}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Tài khoản</h1>
            <p className="text-gray-600 mt-1">Quản lý người dùng trong hệ thống</p>
          </div>
        </div>

        <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Tìm kiếm tên hoặc email"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-1/3"
              />
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-1/3">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="banned">Bị khóa</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">STT</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Tên</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Trạng thái</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Ngày tham gia</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Vai trò</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10">Đang tải dữ liệu...</td>
                    </tr>
                  ) : paginatedAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-gray-500">
                        Không tìm thấy tài khoản nào phù hợp
                      </td>
                    </tr>
                  ) : (
                    paginatedAccounts.map((acc, index) => (
                      <tr key={acc.account_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                        <td className="px-4 py-3">{acc.full_name}</td>
                        <td className="px-4 py-3">{acc.email}</td>
                        <td className="px-4 py-3 text-center">{renderStatus(acc.status)}</td>
                        <td className="px-4 py-3 text-center">{format(new Date(acc.created_at), "dd/MM/yyyy")}</td>
                        <td className="px-4 py-3 text-center">{renderRole(acc.role.role_name)}</td>
                        <td className="px-4 py-3 text-center">
                          {acc.account_id !== user?.account_id ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleBan(acc.account_id)}>
                                  <span className="text-red-600">Ban tài khoản</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Phân quyền
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span className="text-gray-400 text-sm">Tài khoản của bạn</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-between items-center pt-4">
                <p className="text-sm text-gray-600">
                  Trang {currentPage} / {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}