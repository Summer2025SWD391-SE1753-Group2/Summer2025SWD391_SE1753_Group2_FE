import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import type { LoginRequest, RegisterRequest } from "@/types/api";

export const useAuth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (data: LoginRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.login(data);
      navigate("/");
      return response;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Đăng nhập thất bại";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.register(data);
      navigate("/login");
      return response;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Đăng ký thất bại";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      navigate("/login");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    register,
    logout,
    isLoading,
    error,
    isAuthenticated: authService.isAuthenticated(),
  };
};
