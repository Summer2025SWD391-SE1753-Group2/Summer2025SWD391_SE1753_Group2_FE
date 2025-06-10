import { Topic } from "@/types/post";
import axiosInstance from "@/lib/axios";

export const getAllTopics = async (): Promise<Topic[]> => {
  try {
    const response = await axiosInstance.get("/api/v1/topics/");
    return response.data;
  } catch {
    throw new Error("Không thể tải danh sách chủ đề");
  }
};
