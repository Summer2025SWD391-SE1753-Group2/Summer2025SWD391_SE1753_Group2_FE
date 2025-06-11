import axiosInstance from "@/lib/axios";
import { Tag } from "@/types/post";

export const getAllTags = async (): Promise<Tag[]> => {
  try {
    const response = await axiosInstance.get("/api/v1/tags/");
    return response.data;
  } catch {
    throw new Error("Không thể tải danh sách tags");
  }
};

const createTag = async (data: {
  name: string;
  status: "active" | "inactive";
  created_by: string;
}): Promise<Tag> => {
  const response = await axiosInstance.post<Tag>("/api/v1/tags", data);
  return response.data;
};

const updateTag = async (tag_id: string, data: Partial<Tag>): Promise<Tag> => {
  const response = await axiosInstance.put<Tag>(`/api/v1/tags/${tag_id}`, data);
  return response.data;
};

const deleteTag = async (tag_id: string): Promise<void> => {
  await axiosInstance.delete(`/api/v1/tags/${tag_id}`);
};

export { createTag, updateTag, deleteTag };
