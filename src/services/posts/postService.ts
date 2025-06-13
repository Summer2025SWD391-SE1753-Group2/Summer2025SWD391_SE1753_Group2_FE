import axiosInstance from "@/lib/api/axios";
import type { Post } from "@/types/post";

export interface CreatePostApiRequest {
  title: string;
  content: string;
  images: string[];
  tag_ids: string[];
  topic_ids: string[];
  materials: {
    material_id: string;
    quantity: number;
  }[];
  steps: {
    order_number: number;
    content: string;
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

export const getAllPosts = async (
  skip: number = 0,
  limit: number = 10
): Promise<Post[]> => {
  try {
    const response = await axiosInstance.get("/api/v1/posts/", {
      params: { skip, limit },
    });

    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response: { status: number; data?: { message?: string } };
      };
      throw new Error(
        axiosError.response?.data?.message || "Không thể tải danh sách bài viết"
      );
    }
    throw new Error("Không thể tải danh sách bài viết");
  }
};

export const getPostById = async (postId: string): Promise<Post> => {
  try {
    const response = await axiosInstance.get(`/api/v1/posts/${postId}`);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response: { status: number; data?: { message?: string } };
      };
      if (axiosError.response?.status === 404) {
        throw new Error("Không tìm thấy bài viết");
      }
      throw new Error(
        axiosError.response?.data?.message || "Không thể tải bài viết"
      );
    }
    throw new Error("Không thể tải bài viết");
  }
};
