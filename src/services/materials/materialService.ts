import { Material } from "@/types/post";

import { DEFAULT_API_BASE } from "@/config/api";

const API_BASE = DEFAULT_API_BASE;

export const getAllMaterials = async (): Promise<Material[]> => {
  const response = await fetch(`${API_BASE}/materials/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Không thể tải danh sách nguyên liệu");
  }

  return response.json();
};
