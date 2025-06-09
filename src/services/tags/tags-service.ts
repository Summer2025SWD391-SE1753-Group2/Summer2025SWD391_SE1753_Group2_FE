import axiosInstance from "@/lib/axios";
import { Tag } from "@/types/tag";



// Lấy list tất cả tags
const getAllTags = async (): Promise<Tag[]> => {
  const response = await axiosInstance.get<Tag[]>("/api/v1/tags");
  return response.data;
};

// Tạo tag mới
const createTag = async (data: { name: string; status: "active" | "inactive"; created_by: string }): Promise<Tag> => {
  const response = await axiosInstance.post<Tag>("/api/v1/tags", data);
  return response.data;
};

// Cập nhật tag (chỉ cần token là đủ, không cần created_by)
const updateTag = async (tag_id: string, data: Partial<Tag>): Promise<Tag> => {
  const response = await axiosInstance.put<Tag>(`/api/v1/tags/${tag_id}`, data);
  return response.data;
};

// Xoá tag (nếu cần)
const deleteTag = async (tag_id: string): Promise<void> => {
  await axiosInstance.delete(`/api/v1/tags/${tag_id}`);
};

export {
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
};
