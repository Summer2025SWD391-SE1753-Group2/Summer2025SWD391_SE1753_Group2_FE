import axiosInstance from "@/lib/api/axios";
import type { Unit } from "@/types/unit";

// Interface cho response phân trang
export interface PaginatedResponse {
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
}

// Interface cho units response
export interface UnitsPaginatedResponse extends PaginatedResponse {
  units: Unit[];
}

// Lấy tất cả đơn vị
export const getAllUnits = async (
  skip: number = 0,
  limit: number = 20
): Promise<UnitsPaginatedResponse> => {
  try {
    const response = await axiosInstance.get<UnitsPaginatedResponse>(
      `/api/v1/units/?skip=${skip}&limit=${limit}`
    );
    return response.data;
  } catch {
    throw new Error("Không thể tải danh sách đơn vị");
  }
};

// Lấy đơn vị theo ID
export const getUnitById = async (unit_id: string): Promise<Unit> => {
  try {
    const response = await axiosInstance.get<Unit>(`/api/v1/units/${unit_id}`);
    return response.data;
  } catch {
    throw new Error("Không thể tải đơn vị");
  }
};

// Tìm kiếm đơn vị theo tên
export const searchUnits = async (name: string): Promise<Unit[]> => {
  try {
    const response = await axiosInstance.get<Unit[]>(
      `/api/v1/units/search/?name=${encodeURIComponent(name)}`
    );
    return response.data;
  } catch {
    throw new Error("Không thể tìm kiếm đơn vị");
  }
};

// Tạo đơn vị mới
export const createUnit = async (data: {
  name: string;
  description?: string;
  status: "active" | "inactive";
  created_by: string;
}): Promise<Unit> => {
  try {
    const response = await axiosInstance.post<Unit>("/api/v1/units/", data);
    return response.data;
  } catch {
    throw new Error("Không thể tạo đơn vị");
  }
};

// Cập nhật đơn vị
export const updateUnit = async (
  unit_id: string,
  data: Partial<Pick<Unit, "name" | "description" | "status" | "updated_by">>
): Promise<Unit> => {
  try {
    const response = await axiosInstance.put<Unit>(
      `/api/v1/units/${unit_id}`,
      data
    );
    return response.data;
  } catch {
    throw new Error("Không thể cập nhật đơn vị");
  }
};

// Xoá đơn vị
export const deleteUnit = async (unit_id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/v1/units/${unit_id}`);
  } catch {
    throw new Error("Không thể xoá đơn vị");
  }
};
