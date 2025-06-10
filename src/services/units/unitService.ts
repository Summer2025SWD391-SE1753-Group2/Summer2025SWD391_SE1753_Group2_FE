import { Unit } from "@/types/post";
import axiosInstance from "@/lib/axios";

export const getAllUnits = async (): Promise<Unit[]> => {
  try {
    const response = await axiosInstance.get("/api/v1/units/");
    return response.data;
  } catch {
    throw new Error("Không thể tải danh sách đơn vị");
  }
};
