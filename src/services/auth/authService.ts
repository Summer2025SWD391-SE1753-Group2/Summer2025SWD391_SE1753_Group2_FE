import axiosInstance from "@/lib/api/axios";
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserInfo,
  ErrorResponse,
} from "@/types/auth";

/**
 * Cookie utility functions với better security
 */
const setCookie = (name: string, value: string, days: number = 7): void => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const isSecure = location.protocol === "https:";
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/; SameSite=Strict${isSecure ? "; Secure" : ""}`;
};

const getCookie = (name: string): string | null => {
  const value = document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, "");
  return value || null;
};

const deleteCookie = (name: string): void => {
  setCookie(name, "", -1);
};

/**
 * Validation functions
 */
const validateLoginData = (data: LoginRequest): void => {
  if (!data.password || data.password.length < 6) {
    throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
  }

  const loginValue = data.email || data.username || "";
  if (!loginValue.trim()) {
    throw new Error("Vui lòng nhập email hoặc tên đăng nhập");
  }

  // Kiểm tra định dạng - nếu có @ thì phải là email hợp lệ
  if (loginValue.includes("@")) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginValue)) {
      throw new Error("Email không hợp lệ");
    }
  } else {
    // Nếu không có @ thì phải là username hợp lệ
    if (loginValue.length < 3 || loginValue.length > 20) {
      throw new Error("Tên đăng nhập phải có từ 3-20 ký tự");
    }
  }
};

const validateRegisterData = (data: RegisterRequest): void => {
  if (!data.username || data.username.length < 3) {
    throw new Error("Tên đăng nhập phải có ít nhất 3 ký tự");
  }

  if (!data.email || !data.email.includes("@")) {
    throw new Error("Email không hợp lệ");
  }

  if (!data.password || data.password.length < 8) {
    throw new Error("Mật khẩu phải có ít nhất 8 ký tự");
  }

  if (!data.full_name || data.full_name.trim().length < 2) {
    throw new Error("Họ tên phải có ít nhất 2 ký tự");
  }

  if (!data.date_of_birth) {
    throw new Error("Vui lòng nhập ngày sinh");
  }

  // Validate age (must be at least 13 years old)
  const birthDate = new Date(data.date_of_birth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  if (age < 13) {
    throw new Error("Bạn phải ít nhất 13 tuổi để đăng ký");
  }
};

/**
 * Auth Service với improved error handling
 */
export const authService = {
  /**
   * Get current user profile
   */
  async getCurrentUserProfile(): Promise<UserInfo> {
    try {
      const res = await axiosInstance.get<UserInfo>("/api/v1/accounts/me");
      return res.data;
    } catch (error) {
      console.error("Failed to get current user profile:", error);
      throw new Error("Không thể lấy thông tin người dùng");
    }
  },

  /**
   * Get user profile by username
   */
  async getUserProfile(username: string): Promise<UserInfo> {
    if (!username || username.trim().length === 0) {
      throw new Error("Tên người dùng không hợp lệ");
    }

    try {
      const res = await axiosInstance.get<UserInfo>(
        `/api/v1/accounts/profiles/${username}`
      );
      return res.data;
    } catch (error) {
      console.error("Failed to get user profile:", error);
      throw new Error("Không thể lấy thông tin người dùng");
    }
  },

  /**
   * Login with enhanced validation and error handling
   */
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    validateLoginData(data);

    const loginValue = data.email || data.username || "";
    const params = new URLSearchParams();
    params.append("grant_type", "password");
    params.append("username", loginValue);
    params.append("password", data.password);
    params.append("scope", "");

    console.log("Login attempt:", { loginValue, password: "***" });

    try {
      const res = await axiosInstance.post<AuthResponse>(
        "/api/v1/auth/access-token",
        params,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      if (!res.data.access_token) {
        throw new Error("Không nhận được token xác thực");
      }

      // Store tokens
      setCookie("access_token", res.data.access_token, 1);
      if (res.data.refresh_token) {
        setCookie("refresh_token", res.data.refresh_token, 7);
      }

      // Get and store user profile
      try {
        const profile = await this.getCurrentUserProfile();
        setCookie("user_info", JSON.stringify(profile), 7);
        res.data.user = profile;
      } catch (profileError) {
        console.warn("User profile fetch failed:", profileError);
        // Don't fail login if profile fetch fails
      }

      return {
        data: res.data,
        message: "Đăng nhập thành công",
        status: 200,
      };
    } catch (error) {
      console.error("Login failed:", error);
      const errorMsg = this.extractErrorMessage(error);
      throw new Error(errorMsg);
    }
  },

  /**
   * Register with enhanced validation
   */
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    validateRegisterData(data);

    try {
      const res = await axiosInstance.post<AuthResponse>(
        "/api/v1/auth/register",
        data,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      return {
        data: res.data,
        message: "Đăng ký thành công",
        status: 200,
      };
    } catch (error) {
      console.error("Registration failed:", error);
      const errorMsg = this.extractErrorMessage(error);
      throw new Error(errorMsg);
    }
  },

  /**
   * Refresh token with better error handling
   */
  async refreshToken(): Promise<string | null> {
    const refreshToken = getCookie("refresh_token");
    if (!refreshToken) {
      console.warn("No refresh token available");
      return null;
    }

    try {
      const res = await axiosInstance.post<{ access_token: string }>(
        "/api/v1/auth/refresh-token",
        { refresh_token: refreshToken }
      );

      if (res.data.access_token) {
        setCookie("access_token", res.data.access_token, 1);
        return res.data.access_token;
      }

      throw new Error("Invalid refresh token response");
    } catch (error) {
      console.error("Refresh token failed:", error);
      // Clear invalid tokens
      this.clearTokens();
      return null;
    }
  },

  /**
   * Logout with cleanup
   */
  async logout(): Promise<void> {
    try {
      await axiosInstance.post("/api/v1/auth/logout");
    } catch (error) {
      console.warn("Logout API error:", error);
      // Continue with cleanup even if API fails
    } finally {
      this.clearTokens();
    }
  },

  /**
   * Google login redirect
   */
  async loginWithGoogle(): Promise<void> {
    const baseUrl = import.meta.env.VITE_API_URL;
    window.location.href = `${baseUrl}/api/v1/auth/google/login`;
  },

  /**
   * Token management
   */
  getToken(): string | null {
    return getCookie("access_token");
  },

  getRefreshToken(): string | null {
    return getCookie("refresh_token");
  },

  getUserInfo(): UserInfo | null {
    try {
      const userInfo = getCookie("user_info");
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error("Failed to parse user info:", error);
      deleteCookie("user_info");
      return null;
    }
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && token.length > 0;
  },

  hasRole(role: string): boolean {
    const info = this.getUserInfo();
    return info?.role?.role_name === role;
  },

  /**
   * Clear all tokens and user data
   */
  clearTokens(): void {
    deleteCookie("access_token");
    deleteCookie("refresh_token");
    deleteCookie("user_info");
  },

  /**
   * Extract meaningful error message from API response
   */
  extractErrorMessage(error: unknown): string {
    if (typeof error === "object" && error !== null) {
      const apiError = error as {
        response?: {
          data?: ErrorResponse | { detail?: string; message?: string };
          status?: number;
        };
        message?: string;
      };

      // Check for API error response
      if (apiError.response?.data) {
        const data = apiError.response.data;

        // Handle ErrorResponse type
        if ("detail" in data && data.detail) {
          return data.detail;
        }

        // Handle generic error message
        if ("message" in data && data.message) {
          return data.message;
        }
      }

      // Handle HTTP status codes
      if (apiError.response?.status) {
        switch (apiError.response.status) {
          case 401:
            return "Tài khoản hoặc mật khẩu không chính xác";
          case 403:
            return "Tài khoản đã bị khóa hoặc chưa được xác thực";
          case 404:
            return "Không tìm thấy tài khoản";
          case 429:
            return "Quá nhiều lần thử. Vui lòng thử lại sau";
          case 500:
            return "Lỗi hệ thống. Vui lòng thử lại sau";
          default:
            return "Có lỗi xảy ra. Vui lòng thử lại";
        }
      }

      // Handle generic error message
      if (apiError.message) {
        return apiError.message;
      }
    }

    // Fallback error message
    return "Có lỗi không xác định xảy ra";
  },

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    new_password: string,
    confirm_password: string
  ): Promise<ApiResponse<null>> {
    if (!token || token.trim().length === 0) {
      throw new Error("Token không hợp lệ");
    }
    if (!new_password || new_password.length < 6) {
      throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
    }
    if (new_password !== confirm_password) {
      throw new Error("Mật khẩu xác nhận không khớp");
    }

    try {
      const res = await axiosInstance.post<{ message?: string }>(
        "/api/v1/auth/reset-password",
        { token, new_password, confirm_password },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      return {
        data: null,
        message: res.data?.message || "Mật khẩu đã được đặt lại thành công",
        status: 200,
      };
    } catch (error) {
      console.error("Reset password failed:", error);
      const errorMsg = this.extractErrorMessage(error);
      throw new Error(errorMsg);
    }
  },

  /**
   * Request password reset
   */
  async forgotPassword(username: string): Promise<ApiResponse<null>> {
    if (!username || username.trim().length === 0) {
      throw new Error("Vui lòng nhập email hoặc tên đăng nhập");
    }

    try {
      const res = await axiosInstance.post<{
        message: string;
        method?: string;
        username?: string;
      }>(
        "/api/v1/auth/forgot-password",
        { username },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return {
        data: null,
        message: res.data.message || "Hướng dẫn đặt lại mật khẩu đã được gửi.",
        status: 200,
      };
    } catch (error) {
      console.error("Forgot password failed:", error);
      const errorMsg = this.extractErrorMessage(error);
      throw new Error(errorMsg);
    }
  },
};
