import { Material } from "@/types/post";
import axiosInstance from "@/lib/axios";

export const getAllMaterials = async (): Promise<Material[]> => {
  try {
    const response = await axiosInstance.get("/api/v1/materials/");
    return response.data;
  } catch {
    throw new Error("Không thể tải danh sách nguyên liệu");
  }
};
