import axiosInstance from "@/lib/api/axios";
import type {
  UserProfile,
  ProfileUpdateData,
  PasswordUpdateData,
  UsernameUpdateData,
  GoogleUserInfo,
} from "@/types/account";

// Account Service
export const accountService = {
  /**
   * Get own profile
   */
  async getOwnProfile(): Promise<UserProfile> {
    try {
      const response = await axiosInstance.get<UserProfile>(
        "/api/v1/accounts/me"
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get own profile:", error);
      throw new Error("Không thể tải thông tin profile");
    }
  },

  /**
   * Get profile by username
   */
  async getProfileByUsername(username: string): Promise<UserProfile> {
    try {
      const response = await axiosInstance.get<UserProfile>(
        `/api/v1/accounts/profiles/${username}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get profile by username:", error);
      throw new Error("Không thể tải thông tin profile");
    }
  },

  /**
   * Update own profile
   */
  async updateOwnProfile(data: ProfileUpdateData): Promise<UserProfile> {
    try {
      const response = await axiosInstance.put<UserProfile>(
        "/api/v1/accounts/me",
        data
      );
      return response.data;
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw new Error("Không thể cập nhật profile");
    }
  },

  /**
   * Update password
   */
  async updatePassword(data: PasswordUpdateData): Promise<UserProfile> {
    try {
      const response = await axiosInstance.post<UserProfile>(
        "/api/v1/accounts/update-password",
        data
      );
      return response.data;
    } catch (error) {
      console.error("Failed to update password:", error);
      throw new Error("Không thể cập nhật mật khẩu");
    }
  },

  /**
   * Update username
   */
  async updateUsername(data: UsernameUpdateData): Promise<UserProfile> {
    try {
      const response = await axiosInstance.post<UserProfile>(
        "/api/v1/accounts/update-username",
        data
      );
      return response.data;
    } catch (error) {
      console.error("Failed to update username:", error);
      throw new Error("Không thể cập nhật tên đăng nhập");
    }
  },

  /**
   * Check if user is Google user
   */
  async isGoogleUser(): Promise<GoogleUserInfo> {
    try {
      const response = await axiosInstance.get<GoogleUserInfo>(
        "/api/v1/accounts/is-google-user"
      );
      return response.data;
    } catch (error) {
      console.error("Failed to check Google user status:", error);
      throw new Error("Không thể kiểm tra trạng thái tài khoản Google");
    }
  },

  /**
   * Search users
   */
  async searchUsers(
    name: string,
    skip: number = 0,
    limit: number = 10
  ): Promise<UserProfile[]> {
    try {
      const response = await axiosInstance.get<UserProfile[]>(
        `/api/v1/accounts/search/?name=${encodeURIComponent(
          name
        )}&skip=${skip}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to search users:", error);
      throw new Error("Không thể tìm kiếm người dùng");
    }
  },
};
