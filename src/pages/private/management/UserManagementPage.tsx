import { useEffect, useState } from "react";
import { banAccount, getAllAccounts } from "@/services/accounts/accountService";
import type { UserProfile } from "@/types/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { format } from "date-fns";
import { useAuthStore } from "@/stores/auth";
import clsx from "clsx";

const PAGE_SIZE = 8;

const UserManagementPage = () => {
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
    await banAccount(accountId);
    fetchAccounts();
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
    const text = status === "active" ? "Đang hoạt động" : status === "banned" ? "Bị khóa" : "Không hoạt động";
    const colorClass =
      status === "active"
        ? "text-green-600 font-medium"
        : status === "banned"
        ? "text-red-600 font-medium"
        : "text-gray-500";
    return <span className={colorClass}>{text}</span>;
  };

  const renderRole = (role: string) => {
    let text = "";
    let colorClass = "";

    switch (role) {
      case "admin":
        text = "Quản trị viên";
        colorClass = "text-red-600 font-medium";
        break;
      case "moderator":
        text = "Kiểm duyệt viên";
        colorClass = "text-blue-600 font-medium";
        break;
      case "user":
      default:
        text = "Thành viên";
        colorClass = "text-green-700";
        break;
    }

    return <span className={colorClass}>{text}</span>;
  };

  return (
    <div className="p-4 space-y-4">
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

      <div className="border-2 rounded-3xl p-2 shadow">
        {loading ? (
          <p className="text-center py-4">Đang tải dữ liệu...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">STT</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tham gia</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAccounts.map((acc, index) => (
                <TableRow key={acc.account_id}>
                  <TableCell>{(currentPage - 1) * PAGE_SIZE + index + 1}</TableCell>
                  <TableCell>{acc.full_name}</TableCell>
                  <TableCell>{acc.email}</TableCell>
                  <TableCell>{renderStatus(acc.status)}</TableCell>
                  <TableCell>{format(new Date(acc.created_at), "dd/MM/yyyy")}</TableCell>
                  <TableCell>{renderRole(acc.role.role_name)}</TableCell>
                  <TableCell className="flex gap-2">
                    {acc.account_id !== user?.account_id ? (
                      <>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleBan(acc.account_id)}
                        >
                          Ban
                        </Button>
                        <Button variant="outline" size="sm">
                          Phân quyền
                        </Button>
                      </>
                    ) : (
                      <span className="text-gray-500 text-sm">Tài khoản của bạn</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

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
  );
};

export default UserManagementPage;
