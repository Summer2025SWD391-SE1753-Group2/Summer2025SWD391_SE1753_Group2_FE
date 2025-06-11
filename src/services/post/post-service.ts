import axiosInstance from "@/lib/axios";
import { Post } from "@/types/post";

// Search posts by topic
const searchPostsByTopic = async (topicName: string, skip: number = 0, limit: number = 100): Promise<Post[]> => {
  const response = await axiosInstance.get<Post[]>(`/api/v1/posts/search/by-topic/?topic_name=${encodeURIComponent(topicName)}&skip=${skip}&limit=${limit}`);
  return response.data;
};

// Search posts by tag
const searchPostsByTag = async (tagName: string, skip: number = 0, limit: number = 100): Promise<Post[]> => {
  const response = await axiosInstance.get<Post[]>(`/api/v1/posts/search/by-tag/?tag_name=${encodeURIComponent(tagName)}&skip=${skip}&limit=${limit}`);
  return response.data;
};

// Search posts by title
const searchPostsByTitle = async (title: string, skip: number = 0, limit: number = 100): Promise<Post[]> => {
  const response = await axiosInstance.get<Post[]>(`/api/v1/posts/search/?title=${encodeURIComponent(title)}&skip=${skip}&limit=${limit}`);
  return response.data;
};

export {
  searchPostsByTopic,
  searchPostsByTag,
  searchPostsByTitle,
};