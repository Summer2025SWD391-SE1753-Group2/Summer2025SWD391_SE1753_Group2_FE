import axiosInstance from "@/lib/api/axios";
import type { Comment, CommentCreate, CommentUpdate } from "@/types/comment";

export const createComment = async (data: CommentCreate): Promise<Comment> => {
  try {
    const response = await axiosInstance.post("/api/v1/comments/", data);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response: {
          status: number;
          data?: { detail?: string; message?: string };
        };
      };
      if (axiosError.response?.status === 401) {
        throw new Error("Bạn cần đăng nhập để bình luận");
      }
      if (axiosError.response?.status === 403) {
        throw new Error("Bạn không có quyền bình luận");
      }
      if (axiosError.response?.status === 404) {
        throw new Error("Không tìm thấy bài viết hoặc bình luận cha");
      }
      throw new Error(
        axiosError.response?.data?.detail ||
          axiosError.response?.data?.message ||
          "Không thể tạo bình luận"
      );
    }
    throw new Error("Không thể tạo bình luận");
  }
};

export const getCommentById = async (commentId: string): Promise<Comment> => {
  try {
    const response = await axiosInstance.get(`/api/v1/comments/${commentId}`);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response: {
          status: number;
          data?: { detail?: string; message?: string };
        };
      };
      if (axiosError.response?.status === 404) {
        throw new Error("Không tìm thấy bình luận");
      }
      throw new Error(
        axiosError.response?.data?.detail ||
          axiosError.response?.data?.message ||
          "Không thể tải bình luận"
      );
    }
    throw new Error("Không thể tải bình luận");
  }
};

export const getCommentsByPost = async (postId: string): Promise<Comment[]> => {
  try {
    // Use the nested endpoint for better structure
    const response = await axiosInstance.get(
      `/api/v1/comments/post/${postId}/nested`
    );
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response: {
          status: number;
          data?: { detail?: string; message?: string };
        };
      };
      if (axiosError.response?.status === 404) {
        throw new Error("Không tìm thấy bài viết");
      }
      throw new Error(
        axiosError.response?.data?.detail ||
          axiosError.response?.data?.message ||
          "Không thể tải bình luận"
      );
    }
    throw new Error("Không thể tải bình luận");
  }
};

export const updateComment = async (
  commentId: string,
  data: CommentUpdate
): Promise<Comment> => {
  try {
    const response = await axiosInstance.put(
      `/api/v1/comments/${commentId}`,
      data
    );
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response: {
          status: number;
          data?: { detail?: string; message?: string };
        };
      };
      if (axiosError.response?.status === 401) {
        throw new Error("Bạn cần đăng nhập để chỉnh sửa bình luận");
      }
      if (axiosError.response?.status === 403) {
        throw new Error("Bạn không có quyền chỉnh sửa bình luận này");
      }
      if (axiosError.response?.status === 404) {
        throw new Error("Không tìm thấy bình luận");
      }
      throw new Error(
        axiosError.response?.data?.detail ||
          axiosError.response?.data?.message ||
          "Không thể cập nhật bình luận"
      );
    }
    throw new Error("Không thể cập nhật bình luận");
  }
};

export const deleteComment = async (commentId: string): Promise<Comment> => {
  try {
    const response = await axiosInstance.delete(
      `/api/v1/comments/${commentId}`
    );
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response: {
          status: number;
          data?: { detail?: string; message?: string };
        };
      };
      if (axiosError.response?.status === 401) {
        throw new Error("Bạn cần đăng nhập để xóa bình luận");
      }
      if (axiosError.response?.status === 403) {
        throw new Error("Bạn không có quyền xóa bình luận này");
      }
      if (axiosError.response?.status === 404) {
        throw new Error("Không tìm thấy bình luận");
      }
      throw new Error(
        axiosError.response?.data?.detail ||
          axiosError.response?.data?.message ||
          "Không thể xóa bình luận"
      );
    }
    throw new Error("Không thể xóa bình luận");
  }
};
