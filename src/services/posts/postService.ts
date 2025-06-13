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

// Search posts by topic
const searchPostsByTopic = async (
  topicName: string,
  skip: number = 0,
  limit: number = 100
): Promise<Post[]> => {
  const response = await axiosInstance.get<Post[]>(
    `/api/v1/posts/search/by-topic/?topic_name=${encodeURIComponent(
      topicName
    )}&skip=${skip}&limit=${limit}`
  );
  return response.data;
};

// Search posts by tag
const searchPostsByTag = async (
  tagName: string,
  skip: number = 0,
  limit: number = 100
): Promise<Post[]> => {
  const response = await axiosInstance.get<Post[]>(
    `/api/v1/posts/search/by-tag/?tag_name=${encodeURIComponent(
      tagName
    )}&skip=${skip}&limit=${limit}`
  );
  return response.data;
};

// Search posts by title
const searchPostsByTitle = async (
  title: string,
  skip: number = 0,
  limit: number = 100
): Promise<Post[]> => {
  const response = await axiosInstance.get<Post[]>(
    `/api/v1/posts/search/?title=${encodeURIComponent(
      title
    )}&skip=${skip}&limit=${limit}`
  );
  return response.data;
};

export { searchPostsByTopic, searchPostsByTag, searchPostsByTitle };
export interface ModeratePostPayload {
  status: "approved" | "rejected";
  rejection_reason?: string;
  approved_by: string;
}

export const moderatePost = async (
  post_id: string,
  data: ModeratePostPayload
): Promise<Post> => {
  const response = await axiosInstance.put<Post>(
    `/api/v1/posts/${post_id}/moderate`,
    data
  );
  return response.data;
};
