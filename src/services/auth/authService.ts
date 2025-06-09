import axiosInstance from "@/lib/axios";
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserInfo,
} from "@/types/api";

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
  async getCurrentUserProfile(): Promise<UserInfo> {
    const res = await axiosInstance.get<UserInfo>("/api/v1/accounts/me");
    return res.data;
  },

  async getUserProfile(username: string): Promise<UserInfo> {
    const res = await axiosInstance.get<UserInfo>(
      `/api/v1/accounts/profiles/${username}`
    );
    return res.data;
  },

  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const params = new URLSearchParams();
    params.append("grant_type", "password");
    params.append("username", data.email || data.username || "");
    params.append("password", data.password);

    const res = await axiosInstance.post<AuthResponse>(
      "/api/v1/auth/access-token",
      params,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    if (res.data.access_token) {
      setCookie("access_token", res.data.access_token, 1);
      if (res.data.refresh_token)
        setCookie("refresh_token", res.data.refresh_token, 7);

      try {
        const profile = await this.getCurrentUserProfile();
        setCookie("user_info", JSON.stringify(profile), 7);
        res.data.user = profile;
      } catch (err) {
        console.warn("User profile fetch failed:", err);
      }
    }

    return { data: res.data, message: "Login successful", status: 200 };
  },

  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const res = await axiosInstance.post<AuthResponse>(
      "/api/v1/auth/register",
      data,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return { data: res.data, message: "Registration successful", status: 200 };
  },

  async refreshToken(): Promise<string | null> {
    const refreshToken = getCookie("refresh_token");
    if (!refreshToken) return null;

    try {
      const res = await axiosInstance.post<{ access_token: string }>(
        "/api/v1/auth/refresh-token",
        {
          refresh_token: refreshToken,
        }
      );

      if (res.data.access_token) {
        setCookie("access_token", res.data.access_token, 1);
        return res.data.access_token;
      }
    } catch (err) {
      console.error("Refresh token failed", err);
    }
    return null;
  },

  async logout(): Promise<void> {
    deleteCookie("access_token");
    deleteCookie("refresh_token");
    deleteCookie("user_info");
    try {
      await axiosInstance.post("/api/v1/auth/logout");
    } catch (err) {
      console.warn("Logout API error:", err);
    }
  },

  async loginWithGoogle(): Promise<void> {
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    window.location.href = `${baseUrl}/api/v1/auth/google/login`;
  },

  async handleGoogleCallback(code: string): Promise<ApiResponse<AuthResponse>> {
    const res = await axiosInstance.post<AuthResponse>(
      "/api/v1/auth/google/callback",
      { code }
    );

    if (res.data.access_token) {
      setCookie("access_token", res.data.access_token, 1);
      if (res.data.refresh_token)
        setCookie("refresh_token", res.data.refresh_token, 7);

      try {
        const profile = await this.getCurrentUserProfile();
        setCookie("user_info", JSON.stringify(profile), 7);
        res.data.user = profile;
      } catch (err) {
        console.warn("Google user profile fetch failed:", err);
        if (res.data.user)
          setCookie("user_info", JSON.stringify(res.data.user), 7);
      }
    }

    return { data: res.data, message: "Google login successful", status: 200 };
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
    const info = this.getUserInfo();
    return info?.role?.role_name === role;
  },
};
