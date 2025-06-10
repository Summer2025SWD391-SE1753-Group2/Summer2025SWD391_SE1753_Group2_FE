import { Topic } from "@/types/post";

import { DEFAULT_API_BASE } from "@/config/api";

const API_BASE = DEFAULT_API_BASE;

export const getAllTopics = async (): Promise<Topic[]> => {
  const response = await fetch(`${API_BASE}/topics/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Không thể tải danh sách chủ đề");
  }

  return response.json();
};
