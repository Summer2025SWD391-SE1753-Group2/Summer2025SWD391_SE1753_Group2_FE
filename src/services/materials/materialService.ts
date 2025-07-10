import axiosInstance from "@/lib/api/axios";
import type { Material } from "@/types/material";

// Interface cho response phân trang
export interface PaginatedResponse {
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
}

// Interface cho materials response
export interface MaterialsPaginatedResponse extends PaginatedResponse {
  materials: Material[];
}

// Lấy tất cả nguyên liệu
export const getAllMaterials = async (
  skip: number = 0,
  limit: number = 20
): Promise<MaterialsPaginatedResponse> => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/materials/?skip=${skip}&limit=${limit}`
    );
    return response.data;
  } catch {
    throw new Error("Không thể tải danh sách nguyên liệu");
  }
};

// Lấy nguyên liệu theo ID
export const getMaterialById = async (
  material_id: string
): Promise<Material> => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/materials/${material_id}`
    );
    return response.data;
  } catch {
    throw new Error("Không thể tải nguyên liệu");
  }
};

// Tạo nguyên liệu mới
export const createMaterial = async (data: {
  name: string;
  unit_id: string;
  status: "active" | "inactive";
  image_url: string;
}): Promise<Material> => {
  try {
    const response = await axiosInstance.post("/api/v1/materials/", data);
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status: number; data?: { detail?: string } };
    };

    if (axiosError.response?.status === 400) {
      const detail = axiosError.response.data?.detail || "";
      if (
        detail.includes("duplicate key") ||
        detail.includes("UniqueViolation")
      ) {
        throw new Error("Tên nguyên liệu đã tồn tại trong hệ thống");
      } else if (detail.includes("Unit with ID")) {
        throw new Error("Đơn vị không tồn tại");
      } else {
        throw new Error(detail || "Dữ liệu không hợp lệ");
      }
    } else if (axiosError.response?.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn");
    } else if (axiosError.response?.status === 403) {
      throw new Error("Bạn không có quyền tạo nguyên liệu");
    } else {
      throw new Error("Không thể tạo nguyên liệu");
    }
  }
};

// Cập nhật nguyên liệu
export const updateMaterial = async (
  material_id: string,
  data: Partial<Pick<Material, "name" | "unit_id" | "status" | "image_url">>
): Promise<Material> => {
  try {
    const response = await axiosInstance.put(
      `/api/v1/materials/${material_id}`,
      data
    );
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status: number; data?: { detail?: string } };
    };

    if (axiosError.response?.status === 400) {
      const detail = axiosError.response.data?.detail || "";
      if (
        detail.includes("duplicate key") ||
        detail.includes("UniqueViolation")
      ) {
        throw new Error("Tên nguyên liệu đã tồn tại trong hệ thống");
      } else if (detail.includes("Unit with ID")) {
        throw new Error("Đơn vị không tồn tại");
      } else {
        throw new Error(detail || "Dữ liệu không hợp lệ");
      }
    } else if (axiosError.response?.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn");
    } else if (axiosError.response?.status === 403) {
      throw new Error("Bạn không có quyền cập nhật nguyên liệu");
    } else if (axiosError.response?.status === 404) {
      throw new Error("Không tìm thấy nguyên liệu");
    } else {
      throw new Error("Không thể cập nhật nguyên liệu");
    }
  }
};

// Xoá nguyên liệu
export const deleteMaterial = async (material_id: string): Promise<void> => {
  await axiosInstance.delete(`/api/v1/materials/${material_id}`);
};
