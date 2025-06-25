import axiosInstance from "@/lib/api/axios";
import type { Post, CreatePostRequest } from "@/types/post";

export const createPost = async (data: CreatePostRequest): Promise<void> => {
  try {
    const response = await axiosInstance.post("/api/v1/posts", data);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response: {
          status: number;
          data?: {
            message?: string;
            detail?: string;
            errors?: unknown;
          };
        };
      };

      if (axiosError.response?.status === 401) {
        throw new Error("Không tìm thấy token đăng nhập");
      }

      if (axiosError.response?.status === 400) {
        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.detail ||
          "Dữ liệu không hợp lệ";
        throw new Error(`Lỗi validation: ${errorMessage}`);
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

// Moderate post (approve or reject)
export interface PostModerationRequest {
  status: "approved" | "rejected";
  rejection_reason?: string;
  approved_by: string;
}

export const moderatePost = async (
  postId: string,
  data: PostModerationRequest
): Promise<Post> => {
  try {
    const response = await axiosInstance.put(
      `/api/v1/posts/${postId}/review`,
      data
    );
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response: { status: number; data?: { message?: string } };
      };
      if (axiosError.response?.status === 401) {
        throw new Error("Không tìm thấy token đăng nhập");
      }
      if (axiosError.response?.status === 403) {
        throw new Error("Bạn không có quyền duyệt bài viết này");
      }
      if (axiosError.response?.status === 404) {
        throw new Error("Không tìm thấy bài viết");
      }
      throw new Error(
        axiosError.response?.data?.message || "Không thể duyệt bài viết"
      );
    }
    throw new Error("Không thể duyệt bài viết");
  }
};

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  tag_ids?: string[];
  topic_ids?: string[];
  materials?: {
    material_id: string;
    quantity: number;
  }[];
  images?: string[];
  steps?: {
    order_number: number;
    content: string;
  }[];
}

export const updatePost = async (
  postId: string,
  data: UpdatePostRequest
): Promise<Post> => {
  try {
    const response = await axiosInstance.put(`/api/v1/posts/${postId}`, data);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response: { status: number; data?: { message?: string } };
      };
      if (axiosError.response?.status === 401) {
        throw new Error("Không tìm thấy token đăng nhập");
      }
      if (axiosError.response?.status === 403) {
        throw new Error("Bạn không có quyền chỉnh sửa bài viết này");
      }
      if (axiosError.response?.status === 404) {
        throw new Error("Không tìm thấy bài viết");
      }
      throw new Error(
        axiosError.response?.data?.message || "Không thể cập nhật bài viết"
      );
    }
    throw new Error("Không thể cập nhật bài viết");
  }
};

// Get approved posts only
export const getApprovedPosts = async (
  skip: number = 0,
  limit: number = 10
): Promise<Post[]> => {
  try {
    const response = await axiosInstance.get("/api/v1/posts/approved/", {
      params: { skip, limit },
    });
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response: { status: number; data?: { message?: string } };
      };
      throw new Error(
        axiosError.response?.data?.message ||
          "Không thể tải danh sách bài viết đã duyệt"
      );
    }
    throw new Error("Không thể tải danh sách bài viết đã duyệt");
  }
};

// Get current user's posts
export const getMyPosts = async (
  skip: number = 0,
  limit: number = 10
): Promise<Post[]> => {
  try {
    const response = await axiosInstance.get("/api/v1/posts/my-posts/", {
      params: { skip, limit },
    });
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
        axiosError.response?.data?.message || "Không thể tải bài viết của bạn"
      );
    }
    throw new Error("Không thể tải bài viết của bạn");
  }
};
