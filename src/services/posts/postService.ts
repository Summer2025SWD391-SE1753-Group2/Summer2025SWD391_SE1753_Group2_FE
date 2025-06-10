import axiosInstance from "@/lib/axios";

export interface CreatePostApiRequest {
  title: string;
  content: string;
  images: string[]; // Firebase URLs
  tag_ids: string[];
  topic_ids: string[];
  materials: {
    material_id: string;
    quantity: number;
  }[];
}

export const createPost = async (data: CreatePostApiRequest): Promise<void> => {
  try {
    const response = await axiosInstance.post("/api/v1/posts", data);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response: { status: number; data?: { message?: string } };
      };
      if (axiosError.response?.status === 401) {
        throw new Error("Không tìm thấy token đăng nhập");
      }
      throw new Error(
        axiosError.response?.data?.message || "Không thể tạo bài viết"
      );
    }
    throw new Error("Không thể tạo bài viết");
  }
};
