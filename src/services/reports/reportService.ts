import axios from "axios";
import { Report } from "@/types/report";

const API_URL = "http://localhost:8000/api/v1/report/";

export const getAllReports = async (token: string): Promise<Report[]> => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateReport = async (
  reportId: string,
  data: { status: string; reject_reason?: string },
  token: string
): Promise<void> => {
  await axios.put(`${API_URL}${reportId}/`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const createReport = async (
  data: {
    title: string;
    type: "report_topic" | "report_tag" | "report_material";
    reason: string;
    description: string;
    unit?: string;
    object_add?: string;
  },
  token: string
): Promise<void> => {
  // Validate required fields
  if (!data.title?.trim()) {
    throw new Error("Tiêu đề là bắt buộc");
  }
  if (!data.type || !["report_topic", "report_tag", "report_material"].includes(data.type)) {
    throw new Error("Loại báo cáo không hợp lệ");
  }
  if (!data.reason?.trim()) {
    throw new Error("Lý do là bắt buộc");
  }
  if (!data.description?.trim()) {
    throw new Error("Mô tả là bắt buộc");
  }
  if (data.type === "report_material" && !data.unit?.trim()) {
    throw new Error("Đơn vị là bắt buộc đối với báo cáo vật liệu");
  }

  try {
    await axios.post(API_URL, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

export const getReportsByUserId = async (
  userId: string,
  token: string,
  skip: number = 0,
  limit: number = 100
): Promise<Report[]> => {
  try {
    const response = await axios.get(`${API_URL}by-user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { skip, limit },
    });
    return response.data;
  } catch (error) {
    throw new Error("Không thể tải báo cáo của người dùng");
  }
};

// Helper function to extract error message from API response
const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error) && error.response) {
    const { data, status } = error.response;
    if (status === 422 && data?.detail) {
      if (Array.isArray(data.detail)) {
        return data.detail.map((err: { msg: string }) => err.msg).join(", ");
      }
      return data.detail || "Dữ liệu không hợp lệ";
    }
    if (data?.message) {
      return data.message;
    }
    if (status === 401) {
      return "Phiên đăng nhập không hợp lệ";
    }
    if (status === 403) {
      return "Không có quyền thực hiện hành động này";
    }
  }
  return "Có lỗi xảy ra khi tạo báo cáo";
};