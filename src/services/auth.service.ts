import axiosInstance from "@/lib/axios";
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "@/types/api";

export const authService = {
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const params = new URLSearchParams();
    params.append("grant_type", "password");
    params.append("username", data.email || data.username || "");
    params.append("password", data.password);
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      "/api/v1/auth/access-token",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    if (response.data.data?.access_token) {
      localStorage.setItem("token", response.data.data.access_token);
    }
    return response.data;
  },

  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      "/api/v1/auth/register",
      data
    );
    return response.data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem("token");
  },

  getToken(): string | null {
    return localStorage.getItem("token");
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
