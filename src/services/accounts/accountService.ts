import axiosInstance from "@/lib/api/axios";
import type {
  UserProfile,
  PasswordUpdateData,
  UsernameUpdateData,
  GoogleUserInfo,
} from "@/types/account";

// View own profile
const getOwnProfile = async (): Promise<UserProfile> => {
  const response = await axiosInstance.get<UserProfile>("/api/v1/accounts/me");
  return response.data;
};

// Update own profile
const updateOwnProfile = async (
  data: Partial<UserProfile>
): Promise<UserProfile> => {
  const response = await axiosInstance.put<UserProfile>(
    "/api/v1/accounts/me",
    data
  );
  return response.data;
};

// View profile by username
const getProfileByUsername = async (username: string): Promise<UserProfile> => {
  const response = await axiosInstance.get<UserProfile>(
    `/api/v1/accounts/profiles/${username}`
  );
  return response.data;
};

// Search users by username
const searchUsersByUsername = async (
  name: string,
  skip: number = 0,
  limit: number = 100
): Promise<UserProfile[]> => {
  const response = await axiosInstance.get<UserProfile[]>(
    `/api/v1/accounts/search/?name=${encodeURIComponent(
      name
    )}&skip=${skip}&limit=${limit}`
  );
  return response.data;
};

// Check if user is Google user
const isGoogleUser = async (): Promise<GoogleUserInfo> => {
  const response = await axiosInstance.get<GoogleUserInfo>(
    "/api/v1/accounts/is-google-user"
  );
  return response.data;
};

// Update username
const updateUsername = async (data: UsernameUpdateData): Promise<void> => {
  await axiosInstance.put("/api/v1/accounts/username", data);
};

// Update password
const updatePassword = async (data: PasswordUpdateData): Promise<void> => {
  await axiosInstance.put("/api/v1/accounts/password", data);
};

// Create accountService object for default export
const accountService = {
  getOwnProfile,
  updateOwnProfile,
  getProfileByUsername,
  searchUsersByUsername,
  isGoogleUser,
  updateUsername,
  updatePassword,
};

// Named exports for backward compatibility
export {
  getOwnProfile,
  updateOwnProfile,
  getProfileByUsername,
  searchUsersByUsername,
  isGoogleUser,
  updateUsername,
  updatePassword,
};

// Default export
export default accountService;
