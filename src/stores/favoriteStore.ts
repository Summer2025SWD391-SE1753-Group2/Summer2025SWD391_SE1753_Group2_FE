import { create } from "zustand";
import {
  getFavoriteFolders,
  getFavoritePosts,
  addPostToFavorite,
  removeFavoritePost,
  createFavoriteFolder,
} from "@/services/favorites/favoriteService";
import { Favorite } from "@/types/favorite";
// import { Post } from "@/types/post";
import { toast } from "sonner";

interface FavoriteState {
  folders: Favorite[];
  savedPosts: Map<string, Set<string>>; // Map<favourite_id, Set<post_id>>
  isLoading: boolean;
  initializeFavorites: (forceRefresh?: boolean) => Promise<void>;
  addPost: (
    favourite_id: string,
    post_id: string,
    favourite_name: string
  ) => Promise<void>;
  removePost: (
    favourite_id: string,
    post_id: string,
    favourite_name: string
  ) => Promise<void>;
  createFolder: (name: string, post_id?: string) => Promise<void>;
  isPostSaved: (post_id: string) => boolean;
  getSavedFoldersForPost: (post_id: string) => Set<string>;
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  folders: [],
  savedPosts: new Map(),
  isLoading: false,
  initializeFavorites: async (forceRefresh = false) => {
    if (!forceRefresh && get().folders.length > 0) return;
    try {
      set({ isLoading: true });
      const folders = await getFavoriteFolders();
      const postsPromises = folders.map((folder) =>
        getFavoritePosts(folder.favourite_id).then((posts) => ({
          favourite_id: folder.favourite_id,
          postIds: new Set(posts.map((post) => post.post_id)),
        }))
      );
      const postsResults = await Promise.all(postsPromises);
      const savedPosts = new Map<string, Set<string>>();
      postsResults.forEach(({ favourite_id, postIds }) => {
        savedPosts.set(favourite_id, postIds);
      });
      set({ folders, savedPosts });
    } catch (error) {
      console.error("Error initializing favorites:", error);
      toast.error("Không thể tải danh sách thư mục");
    } finally {
      set({ isLoading: false });
    }
  },
  addPost: async (favourite_id, post_id, favourite_name) => {
    const state = get();
    const posts = state.savedPosts.get(favourite_id) || new Set();
    if (posts.has(post_id)) {
      console.log(`Post ${post_id} already in ${favourite_id}, skipping POST`);
      return;
    }
    console.log(`Calling POST to add post ${post_id} to ${favourite_id}`);
    try {
      await addPostToFavorite(favourite_id, post_id);
      set((state) => {
        const savedPosts = new Map(state.savedPosts);
        posts.add(post_id);
        savedPosts.set(favourite_id, posts);
        const folders = state.folders.map((folder) =>
          folder.favourite_id === favourite_id
            ? { ...folder, post_count: (folder.post_count || 0) + 1 }
            : folder
        );
        return { savedPosts, folders };
      });
      toast.success(`Đã thêm bài viết vào "${favourite_name}"`);
    } catch (error) {
      console.error("Error adding post:", error);
      toast.error("Không thể thêm bài viết vào thư mục");
    }
  },
  removePost: async (favourite_id, post_id, favourite_name) => {
    const state = get();
    const posts = state.savedPosts.get(favourite_id) || new Set();
    if (!posts.has(post_id)) {
      console.log(`Post ${post_id} not in ${favourite_id}, skipping POST`);
      return;
    }
    console.log(`Calling POST to remove post ${post_id} from ${favourite_id}`);
    try {
      await removeFavoritePost(favourite_id, post_id);
      set((state) => {
        const savedPosts = new Map(state.savedPosts);
        posts.delete(post_id);
        savedPosts.set(favourite_id, posts);
        const folders = state.folders.map((folder) =>
          folder.favourite_id === favourite_id
            ? {
                ...folder,
                post_count: Math.max(0, (folder.post_count || 0) - 1),
              }
            : folder
        );
        return { savedPosts, folders };
      });
      toast.success(`Đã xóa bài viết khỏi "${favourite_name}"`);
    } catch (error) {
      console.error("Error removing post:", error);
      toast.error("Không thể xóa bài viết khỏi thư mục");
    }
  },
  createFolder: async (name, post_id) => {
    console.log(`Calling POST to create folder ${name}`);
    try {
      const newFolder = await createFavoriteFolder({
        favourite_name: name,
        account_id: "",
      });
      set((state) => {
        const folders = [...state.folders, { ...newFolder, post_count: 0 }]; // Ensure post_count is set
        const savedPosts = new Map(state.savedPosts);
        savedPosts.set(newFolder.favourite_id, new Set());
        return { folders, savedPosts };
      });
      if (post_id) {
        await get().addPost(newFolder.favourite_id, post_id, name);
      }
      toast.success(
        `Đã tạo thư mục "${name}"${post_id ? " và thêm bài viết" : ""}`
      );
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Không thể tạo thư mục mới");
    }
  },
  isPostSaved: (post_id) => {
    const savedPosts = get().savedPosts;
    for (const posts of savedPosts.values()) {
      if (posts.has(post_id)) return true;
    }
    return false;
  },
  getSavedFoldersForPost: (post_id) => {
    const savedPosts = get().savedPosts;
    const savedFolders = new Set<string>();
    for (const [favourite_id, posts] of savedPosts) {
      if (posts.has(post_id)) savedFolders.add(favourite_id);
    }
    return savedFolders;
  },
}));
