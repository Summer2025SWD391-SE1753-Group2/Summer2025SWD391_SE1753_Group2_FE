import axiosInstance from "@/lib/axios";
import { UserProfile } from "@/types/user";



// View own profile
const getOwnProfile = async (): Promise<UserProfile> => {
  const response = await axiosInstance.get<UserProfile>("/api/v1/accounts/me");
  return response.data;
};

// Update own profile
const updateOwnProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await axiosInstance.put<UserProfile>("/api/v1/accounts/me", data);
  return response.data;
};

// View profile by username
const getProfileByUsername = async (username: string): Promise<UserProfile> => {
  const response = await axiosInstance.get<UserProfile>(`/api/v1/accounts/profiles/${username}`);
  return response.data;
};

// Search users by username
const searchUsersByUsername = async (name: string, skip: number = 0, limit: number = 100): Promise<UserProfile[]> => {
  const response = await axiosInstance.get<UserProfile[]>(`/api/v1/accounts/search/?name=${name}&skip=${skip}&limit=${limit}`);
  return response.data;
};

export {
  getOwnProfile,
  updateOwnProfile,
  getProfileByUsername,
  searchUsersByUsername,
};
