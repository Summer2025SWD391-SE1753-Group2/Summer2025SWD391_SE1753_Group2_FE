import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

import type { ApiResponse } from "@/types/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { authService } from "@/services/auth/authService";

const ChangePasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || ""; // Use token from URL directly
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validateForm = (): string | null => {
    if (!token) return "Liên kết không hợp lệ. Vui lòng kiểm tra token.";
    if (password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự.";
    if (password !== confirmPassword) return "Mật khẩu xác nhận không khớp.";
    return null;
  };

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError("");
  setSuccess("");
  setIsLoading(true);

  const validationError = validateForm();
  if (validationError) {
    setError(validationError);
    setIsLoading(false);
    return;
  }

  try {
    console.log("Submitting reset password with token:", token);
    const response: ApiResponse<null> = await authService.resetPassword(
      token,
      password,
      confirmPassword
    );
    setSuccess(response.message);
    toast.success(response.message);
    setPassword("");
    setConfirmPassword("");
    setTimeout(() => navigate("/auth/login"), 3000);
  } catch (err: any) {
    const errorMessage = authService.extractErrorMessage(err);
    console.error("Reset password error:", {
      errorMessage,
      rawError: err,
      token,
    });
    setError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    if (!token) {
      setError("Liên kết không hợp lệ. Vui lòng kiểm tra token.");
    }
  }, [token]);

  useEffect(() => {
    if (error.includes("hết hạn") || error.includes("hợp lệ")) {
      const timer = setTimeout(() => {
        navigate("/auth/forgot-password");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, navigate]);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="shadow-lg w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-rose-600 text-indigo-50 rounded-full flex items-center justify-center mx-auto my-3">
            <Lock className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl">Đặt lại mật khẩu</CardTitle>
          <CardDescription>
            Nhập mật khẩu mới và xác nhận để hoàn tất việc đặt lại mật khẩu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-3">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="default" className="mb-3 bg-green-50 text-green-700">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Mật khẩu mới (ít nhất 6 ký tự)
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu mới*"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className={error && error.includes("Mật khẩu") ? "border-red-500" : ""}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={togglePasswordVisibility}
                  tabIndex={-1}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="h-4 mt-1">
                {error && error.includes("Mật khẩu") && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Xác nhận mật khẩu mới*"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className={error && error.includes("khớp") ? "border-red-500" : ""}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={togglePasswordVisibility}
                  tabIndex={-1}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="h-4 mt-1">
                {error && error.includes("khớp") && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !token}
              aria-label="Đặt lại mật khẩu"
            >
              {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link
              to="/auth/login"
              className="text-primary hover:underline font-medium transition-colors"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePasswordPage;