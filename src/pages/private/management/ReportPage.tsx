import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Loader2, FileText, Clock, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { getAllReports } from "@/services/reports/reportService";
import { Report } from "@/types/report";
import { authService } from "@/services/auth/authService";
import { ReportActions } from "@/components/management/approve/ReportActions";
import { Skeleton } from "@/components/ui/skeleton";

export const ReportPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    const token = authService.getToken();
    if (!token) {
      toast.error("Vui lòng đăng nhập để xem báo cáo");
      navigate("/login");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const reportsData = await getAllReports(token);
      setReports(reportsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Không thể tải báo cáo";
      toast.error(errorMessage);
      if (errorMessage.includes("401")) {
        authService.clearTokens();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleUpdateReportStatus = useCallback(
    async (id: string, status: "approve" | "reject") => {
      setReports((prev) =>
        prev.map((report) => (report.report_id === id ? { ...report, status } : report))
      );
      await fetchReports(); // Reload data after status update
    },
    [fetchReports]
  );

  const showUnitColumn = reports.some((report) => report.type === "report_material");

  // Tính toán statistics
  const getStatistics = () => {
    const total = reports.length;
    const waiting = reports.filter((p) => p.status === "pending").length;
    const approved = reports.filter((p) => p.status === "approve").length;
    const rejected = reports.filter((p) => p.status === "reject").length;

    return { total, waiting, approved, rejected };
  };

  const stats = getStatistics();

  // Statistics Cards Component
  const StatisticsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng báo cáo</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            Tất cả báo cáo trong hệ thống
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {stats.waiting}
          </div>
          <p className="text-xs text-muted-foreground">Cần xem xét và duyệt</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.approved}
          </div>
          <p className="text-xs text-muted-foreground">
            Báo cáo đã được phê duyệt
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Đã từ chối</CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {stats.rejected}
          </div>
          <p className="text-xs text-muted-foreground">Báo cáo bị từ chối</p>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="p-4 space-y-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Danh sách báo cáo
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Quản lý và xem xét các báo cáo đã được gửi
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <StatisticsCards />

        {/* Content Section */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold text-gray-900 w-[20%]">Tiêu đề</TableHead>
                  <TableHead className="font-semibold text-gray-900 w-[10%]">Loại</TableHead>
                  <TableHead className="font-semibold text-gray-900 w-[15%]">Lý do</TableHead>
                  <TableHead className="font-semibold text-gray-900 w-[10%]">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-gray-900 w-[15%]">Lý do từ chối</TableHead>
                  {showUnitColumn && <TableHead className="font-semibold text-gray-900 w-[10%]">Đơn vị</TableHead>}
                  <TableHead className="font-semibold text-gray-900 w-[15%]">Đối tượng bổ sung</TableHead>
                  <TableHead className="font-semibold text-gray-900 w-[10%]">Ngày tạo</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-center w-[10%]">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={showUnitColumn ? 9 : 8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-gray-400 text-lg">📝</div>
                        <p className="text-gray-500">Không có báo cáo nào</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <ReportActions
                      key={report.report_id}
                      report={report}
                      updateReportStatus={handleUpdateReportStatus}
                      showUnitColumn={showUnitColumn}
                      fetchReports={fetchReports}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};