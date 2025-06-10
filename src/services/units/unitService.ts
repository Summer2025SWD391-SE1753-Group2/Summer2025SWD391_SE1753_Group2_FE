import { Unit } from "@/types/post";

import { DEFAULT_API_BASE } from "@/config/api";

const API_BASE = DEFAULT_API_BASE;

export const getAllUnits = async (): Promise<Unit[]> => {
  const response = await fetch(`${API_BASE}/units/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Không thể tải danh sách đơn vị");
  }

  return response.json();
};
