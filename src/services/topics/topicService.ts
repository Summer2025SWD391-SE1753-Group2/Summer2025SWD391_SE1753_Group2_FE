// services/topics/topicService.ts

import axiosInstance from "@/lib/api/axios";
import { Topic } from "@/types/topic";


export const getAllTopics = async (): Promise<Topic[]> => {
  try {
    const response = await axiosInstance.get("/api/v1/topics/");
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
