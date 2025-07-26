import axiosInstance from "@/lib/api/axios";
import { Tag } from "@/types/tag";

// Interface cho response phân trang
export interface PaginatedResponse {
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
}

// Interface cho tags response
export interface TagsPaginatedResponse extends PaginatedResponse {
  tags: Tag[];
}

export const getAllTags = async (
  skip: number = 0,
  limit: number = 20
): Promise<TagsPaginatedResponse> => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/tags/?skip=${skip}&limit=${limit}`
    );
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
  const response = await axiosInstance.post<Tag>("/api/v1/tags/", data);
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
