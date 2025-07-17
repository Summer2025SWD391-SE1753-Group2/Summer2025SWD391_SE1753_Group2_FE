import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { FileText, Clock, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { getReportsByUserId } from "@/services/reports/reportService";
import { Report } from "@/types/report";
import { authService } from "@/services/auth/authService";
import { Skeleton } from "@/components/ui/skeleton";

const getStatusDisplay = (status: Report["status"]) => {
  switch (status) {
    case "pending":
      return { text: "Chờ duyệt", color: "text-yellow-600" };
    case "approve":
      return { text: "Đã duyệt", color: "text-green-600" };
    case "reject":
      return { text: "Đã từ chối", color: "text-red-600" };
    default:
      return { text: status, color: "text-gray-600" };
  }
};

export const UserReportPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    const token = authService.getToken();
    const userInfo = authService.getUserInfo();
    const userId = userInfo?.account_id;

    if (!token || !userId) {
      toast.error("Vui lòng đăng nhập để xem báo cáo");
      navigate("/login");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const reportsData = await getReportsByUserId(userId, token, 0, 100);
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

  const showUnitColumn = reports.some((report) => report.type === "report_material");

  const getStatistics = () => {
    const total = reports.length;
    const waiting = reports.filter((p) => p.status === "pending").length;
    const approved = reports.filter((p) => p.status === "approve").length;
    const rejected = reports.filter((p) => p.status === "reject").length;

    return { total, waiting, approved, rejected };
  };

  const stats = getStatistics();

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
            Tất cả báo cáo của bạn
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
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Báo cáo của bạn
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Xem và quản lý các báo cáo bạn đã tạo
              </p>
            </div>
          </div>
        </div>

        <StatisticsCards />

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
                  <TableHead className="font-semibold text-gray-900 w-[15%]">Ngày tạo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={showUnitColumn ? 8 : 7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-gray-400 text-lg">📝</div>
                        <p className="text-gray-500">Bạn chưa tạo báo cáo nào</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => {
                    const { text: statusText, color: statusColor } = getStatusDisplay(report.status);
                    return (
                      <TableRow key={report.report_id}>
                        <TableCell>{report.title}</TableCell>
                        <TableCell>{report.type}</TableCell>
                        <TableCell>{report.reason}</TableCell>
                        <TableCell className={statusColor}>{statusText}</TableCell>
                        <TableCell>{report.reject_reason || "-"}</TableCell>
                        {showUnitColumn && <TableCell>{report.unit || "-"}</TableCell>}
                        <TableCell>{report.object_add || "-"}</TableCell>
                        <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};