import axiosInstance from "@/lib/api/axios";
import { Material } from "@/types/material";


// Lấy tất cả nguyên liệu
export const getAllMaterials = async (): Promise<Material[]> => {
  try {
    const response = await axiosInstance.get("/api/v1/materials/");
    return response.data;
  } catch {
    throw new Error("Không thể tải danh sách nguyên liệu");
  }
};

// Lấy theo ID
export const getMaterialById = async (
  material_id: string
): Promise<Material> => {
  try {
    const response = await axiosInstance.get(`/api/v1/materials/${material_id}`);
    return response.data;
  } catch {
    throw new Error("Không thể tải nguyên liệu");
  }
};

// Tạo mới
export const createMaterial = async (data: {
  name: string;
  status: "active" | "inactive";
  image_url: string;
  created_by: string;
}): Promise<Material> => {
  const response = await axiosInstance.post("/api/v1/materials/", data);
  return response.data;
};

// Cập nhật
export const updateMaterial = async (
  material_id: string,
  data: Partial<Pick<Material, "name" | "status" | "image_url" | "updated_by">>
): Promise<Material> => {
  const response = await axiosInstance.put(`/api/v1/materials/${material_id}`, data);
  return response.data;
};

// Xoá
export const deleteMaterial = async (material_id: string): Promise<void> => {
  await axiosInstance.delete(`/api/v1/materials/${material_id}`);
};
