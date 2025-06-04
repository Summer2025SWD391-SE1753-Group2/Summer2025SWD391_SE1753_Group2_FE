import axiosInstance from "@/lib/axios";
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserInfo,
} from "@/types/api";

// Cookie utilities
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/; SameSite=Strict; Secure=${
    location.protocol === "https:"
  }`;
};

const getCookie = (name: string): string | null => {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, "");
};

const deleteCookie = (name: string) => {
  setCookie(name, "", -1);
};

export const authService = {
  async getUserProfile(username: string): Promise<UserInfo> {
    const response = await axiosInstance.get<UserInfo>(
      `/api/v1/accounts/profiles/${username}`
    );
    return response.data;
  },

  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const params = new URLSearchParams();
    params.append("grant_type", "password");
    params.append("username", data.email || data.username || "");
    params.append("password", data.password);

    const response = await axiosInstance.post<AuthResponse>(
      "/api/v1/auth/access-token",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Store tokens in cookies (more secure than localStorage)
    if (response.data.access_token) {
      setCookie("access_token", response.data.access_token, 1); // 1 day
      if (response.data.refresh_token) {
        setCookie("refresh_token", response.data.refresh_token, 7); // 7 days
      }

      // Get user profile using the username from login data
      const username = data.username || data.email || "";
      try {
        const userProfile = await this.getUserProfile(username);
        setCookie("user_info", JSON.stringify(userProfile), 7);

        // Update response to include user info
        response.data.user = userProfile;
      } catch (profileError) {
        console.warn("Failed to fetch user profile:", profileError);
        // Continue with login even if profile fetch fails
      }
    }

    return {
      data: response.data,
      message: "Login successful",
      status: 200,
    };
  },

  async loginWithGoogle(): Promise<void> {
    // Redirect to Google OAuth login endpoint
    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    window.location.href = `${apiBaseUrl}/api/v1/auth/google/login`;
  },

  async handleGoogleCallback(
    authorizationCode: string
  ): Promise<ApiResponse<AuthResponse>> {
    const response = await axiosInstance.post<AuthResponse>(
      "/api/v1/auth/google/callback",
      { code: authorizationCode },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Store tokens in cookies
    if (response.data.access_token) {
      setCookie("access_token", response.data.access_token, 1); // 1 day
      if (response.data.refresh_token) {
        setCookie("refresh_token", response.data.refresh_token, 7); // 7 days
      }

      // Store user info
      if (response.data.user) {
        setCookie("user_info", JSON.stringify(response.data.user), 7);
      }
    }

    return {
      data: response.data,
      message: "Google login successful",
      status: 200,
    };
  },

  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    console.log("Register request data:", data);

    try {
      const response = await axiosInstance.post<AuthResponse>(
        "/api/v1/auth/register",
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Register response:", response.data);

      return {
        data: response.data,
        message: "Registration successful",
        status: 200,
      };
    } catch (error: unknown) {
      console.error("Register error:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: unknown; status?: number };
        };
        console.error("Register error response:", axiosError.response?.data);
        console.error("Register error status:", axiosError.response?.status);

        // Log detail array if exists
        if (
          axiosError.response?.data &&
          typeof axiosError.response.data === "object" &&
          "detail" in axiosError.response.data
        ) {
          const detail = (axiosError.response.data as { detail: unknown })
            .detail;
          console.error("Validation errors:", detail);
        }
      }
      throw error;
    }
  },

  async refreshToken(): Promise<string | null> {
    const refreshToken = getCookie("refresh_token");
    if (!refreshToken) return null;

    try {
      const response = await axiosInstance.post<{
        access_token: string;
        token_type: string;
      }>("/api/v1/auth/refresh-token", { refresh_token: refreshToken });

      if (response.data.access_token) {
        setCookie("access_token", response.data.access_token, 1);
        return response.data.access_token;
      }
    } catch (error) {
      // If refresh fails, clear all auth data
      console.log(error);
    }
    return null;
  },

  async logout(): Promise<void> {
    // Clear cookies
    deleteCookie("access_token");
    deleteCookie("refresh_token");
    deleteCookie("user_info");

    // Optional: Call logout API if BE has logout endpoint
    try {
      await axiosInstance.post("/api/v1/auth/logout");
    } catch (error) {
      console.log(error);
    }
  },

  getToken(): string | null {
    return getCookie("access_token");
  },

  getRefreshToken(): string | null {
    return getCookie("refresh_token");
  },

  getUserInfo(): UserInfo | null {
    const userInfo = getCookie("user_info");
    return userInfo ? JSON.parse(userInfo) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  hasRole(role: string): boolean {
    const userInfo = this.getUserInfo();
    return userInfo?.role?.role_name === role;
  },

  isPhoneVerified(): boolean {
    const userInfo = this.getUserInfo();
    return userInfo?.phone_verified === true;
  },
};
