// services/topics/topicService.ts

import axiosInstance from "@/lib/api/axios";
import { Topic } from "@/types/topic";

// Interface cho response phân trang
export interface PaginatedResponse {
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
}

// Interface cho topics response
export interface TopicsPaginatedResponse extends PaginatedResponse {
  topics: Topic[];
}

export const getAllTopics = async (
  skip: number = 0,
  limit: number = 20
): Promise<TopicsPaginatedResponse> => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/topics/?skip=${skip}&limit=${limit}`
    );
    return response.data;
  } catch {
    throw new Error("Không thể tải danh sách chủ đề");
  }
};

export const createTopic = async (data: {
  name: string;
  status: "active" | "inactive";
  created_by: string;
}): Promise<Topic> => {
  const response = await axiosInstance.post<Topic>("/api/v1/topics/", data);
  return response.data;
};

export const updateTopic = async (
  topic_id: string,
  data: Partial<Topic>
): Promise<Topic> => {
  const response = await axiosInstance.put<Topic>(
    `/api/v1/topics/${topic_id}`,
    data
  );
  return response.data;
};

export const deleteTopic = async (topic_id: string): Promise<void> => {
  await axiosInstance.delete(`/api/v1/topics/${topic_id}`);
};
