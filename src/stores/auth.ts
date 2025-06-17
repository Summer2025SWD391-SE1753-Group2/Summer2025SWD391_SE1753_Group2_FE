import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/auth/authService";
import type { UserInfo, LoginRequest, RegisterRequest } from "@/types/auth";

interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  setUser: (user: UserInfo) => void;
  login: (data: LoginRequest) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,

      // Thiết lập user và trạng thái auth
      setUser: (user: UserInfo) => {
        set({
          user,
          isAuthenticated: true,
          error: null,
        });
      },

      // Đăng nhập
      login: async (data: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(data);
          const userInfo = response.data?.user || authService.getUserInfo();
          if (!userInfo)
            throw new Error("Không lấy được thông tin người dùng.");
          get().setUser(userInfo);
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Đăng nhập thất bại.";
          set({
            user: null,
            isAuthenticated: false,
            error: errorMessage,
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Đăng nhập với Google (chuyển hướng)
      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          await authService.loginWithGoogle(); // redirect flow
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Google login failed";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Đăng ký
      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
          await authService.register(data);
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Đăng ký thất bại";
          set({
            error: errorMessage,
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Đăng xuất
      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
        } catch {
          // ngay cả khi API lỗi, vẫn clear state
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isInitialized: true,
            isLoading: false,
            error: null,
          });
        }
      },

      // Làm mới auth nếu có refresh_token
      refreshAuth: async () => {
        try {
          const refreshToken = await authService.getRefreshToken();
          if (refreshToken) {
            try {
              const userInfo = await authService.getCurrentUserProfile();
              get().setUser(userInfo);
            } catch {
              const userInfo = authService.getUserInfo();
              if (userInfo) get().setUser(userInfo);
              else set({ user: null, isAuthenticated: false });
            }
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },

      // Kiểm tra trạng thái đăng nhập khi app load
      checkAuth: async () => {
        const state = get();
        if (state.isInitialized) return;

        const isAuth = authService.isAuthenticated();
        console.log("CheckAuth - isAuth:", isAuth);

        if (isAuth) {
          try {
            const userInfo = await authService.getCurrentUserProfile();
            console.log("Fetched user info (live):", userInfo);
            get().setUser(userInfo);
          } catch {
            console.warn("Failed to fetch user profile, fallback to cookie");
            const userInfo = authService.getUserInfo();
            if (userInfo) get().setUser(userInfo);
            else set({ user: null, isAuthenticated: false });
          }
        } else {
          set({ user: null, isAuthenticated: false });
        }

        set({ isInitialized: true });
      },

      // Xóa lỗi
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
