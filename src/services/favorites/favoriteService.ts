import axiosInstance from "@/lib/api/axios";
import { Favorite } from "@/types/favorite";
import { Post } from "@/types/post";

// Get all favorite folders
const getFavoriteFolders = async (
  skip: number = 0,
  limit: number = 50
): Promise<Favorite[]> => {
  const response = await axiosInstance.get<Favorite[]>(
    `/api/v1/favourites/?skip=${skip}&limit=${limit}`
  );
  return response.data;
};

// Create a new favorite folder
const createFavoriteFolder = async (
  data: Pick<Favorite, "favourite_name" | "account_id">
): Promise<Favorite> => {
  const response = await axiosInstance.post<Favorite>(
    "/api/v1/favourites/",
    data
  );
  return response.data;
};

// Update a favorite folder
const updateFavoriteFolder = async (
  favourite_id: string,
  data: Pick<Favorite, "favourite_name">
): Promise<Favorite> => {
  const response = await axiosInstance.put<Favorite>(
    `/api/v1/favourites/${favourite_id}`,
    data
  );
  return response.data;
};

// Delete a favorite folder
const deleteFavoriteFolder = async (favourite_id: string): Promise<void> => {
  await axiosInstance.delete(`/api/v1/favourites/${favourite_id}`);
};

// Get all posts in a favorite folder
const getFavoritePosts = async (
  favourite_id: string,
  skip: number = 0,
  limit: number = 10
): Promise<Post[]> => {
  const response = await axiosInstance.get<Post[]>(
    `/api/v1/favourites/${favourite_id}/posts?skip=${skip}&limit=${limit}`
  );
  return response.data;
};

// Remove a post from a favorite folder
const removeFavoritePost = async (
  favourite_id: string,
  post_id: string
): Promise<void> => {
  await axiosInstance.delete(`/api/v1/favourites/${favourite_id}/posts/${post_id}`);
};

// Add a post to a favorite folder
const addPostToFavorite = async (
  favourite_id: string,
  post_id: string
): Promise<void> => {
  await axiosInstance.post(`/api/v1/favourites/${favourite_id}/posts/${post_id}`);
};

// Add a post to a favorite folder by name
const addPostToFavoriteByName = async (
  favourite_name: string,
  post_id: string
): Promise<void> => {
  await axiosInstance.post(`/api/v1/favourites/name/${favourite_name}/posts/${post_id}`);
};

// Check if a post is in any favorite folder
const checkPostInFavorites = async (post_id: string): Promise<boolean> => {
  try {
    const folders = await getFavoriteFolders();
    for (const folder of folders) {
      const posts = await getFavoritePosts(folder.favourite_id);
      if (posts.some((post) => post.post_id === post_id)) {
        return true;
      }
    }
    return false;
  } catch (err) {
    console.error("Error checking favorite status:", err);
    return false;
  }
};

export {
  getFavoriteFolders,
  createFavoriteFolder,
  updateFavoriteFolder,
  deleteFavoriteFolder,
  getFavoritePosts,
  removeFavoritePost,
  addPostToFavorite,
  addPostToFavoriteByName,
  checkPostInFavorites,
};