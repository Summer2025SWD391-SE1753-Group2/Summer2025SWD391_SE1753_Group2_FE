import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MoreHorizontal, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateReport } from "@/services/reports/reportService";
import { Report } from "@/types/report";
import { authService } from "@/services/auth/authService";
import { formatRelativeTime } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";
import { TableRow, TableCell } from "@/components/ui/table";

interface ReportActionsProps {
  report: Report;
  updateReportStatus: (id: string, status: "approve" | "reject") => void;
  showUnitColumn: boolean;
  fetchReports: () => Promise<void>;
}

export const ReportActions = ({ report, updateReportStatus, showUnitColumn, fetchReports }: ReportActionsProps) => {
  const [open, setOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleUpdate = async (status: "approve" | "reject") => {
    const token = authService.getToken();
    if (!token) {
      toast.error("Vui lòng đăng nhập để thực hiện hành động");
      return;
    }

    try {
      const data: { status: string; reject_reason?: string } = {
        status,
      };
      if (status === "reject") {
        if (!rejectReason.trim()) {
          toast.error("Vui lòng nhập lý do từ chối");
          return;
        }
        data.reject_reason = rejectReason;
      }

      await updateReport(report.report_id, data, token);
      await fetchReports(); // Reload data after successful update
      toast.success(`Báo cáo đã được ${status === "approve" ? "duyệt" : "từ chối"}`);
      setOpen(false);
      setRejectReason("");
    } catch (err) {
      const errorMessage =
        (err as any)?.response?.data?.detail
          ? (err as any).response.data.detail
          : "Không thể cập nhật báo cáo";
      toast.error(errorMessage);
    }
  };

  const getStatusIconAndColor = (status: string) => {
    switch (status) {
      case "pending":
        return { icon: <Clock className="h-4 w-4 text-yellow-500" />, color: "text-yellow-600" };
      case "approve":
        return { icon: <CheckCircle2 className="h-4 w-4 text-green-500" />, color: "text-green-600" };
      case "reject":
        return { icon: <XCircle className="h-4 w-4 text-red-500" />, color: "text-red-600" };
      default:
        return { icon: null, color: "text-gray-600" };
    }
  };

  const { icon, color } = getStatusIconAndColor(report.status);

  return (
    <TableRow>
      <TableCell>{report.title}</TableCell>
      <TableCell>{report.type}</TableCell>
      <TableCell>{report.reason}</TableCell>
      <TableCell className={cn("flex items-center gap-1", color)}>
        {icon}
        {report.status}
      </TableCell>
      <TableCell>{report.reject_reason || "N/A"}</TableCell>
      {showUnitColumn && (
        <TableCell>{report.unit || "N/A"}</TableCell>
      )}
      <TableCell>{report.object_add || "N/A"}</TableCell>
      <TableCell>{formatRelativeTime(report.created_at)}</TableCell>
      <TableCell className="text-center">
        {report.status === "pending" ? (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-semibold">Hành động với báo cáo</h4>
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => handleUpdate("approve")}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Duyệt
                </Button>
                <div className="space-y-2">
                  <div className="space-y-2">
                    <Label htmlFor="reject_reason">Lý do từ chối</Label>
                    <Textarea
                      id="reject_reason"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Nhập lý do từ chối"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleUpdate("reject")}
                    disabled={!rejectReason.trim()}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Từ chối
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <span>-</span>
        )}
      </TableCell>
    </TableRow>
  );
};