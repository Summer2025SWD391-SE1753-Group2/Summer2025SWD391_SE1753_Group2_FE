import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

// Types
interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

interface PasswordCheck {
  test: boolean;
  label: string;
}

// Mock authService for demo
const authService = {
  resetPassword: async (
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<ApiResponse<null>> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (!token) throw new Error("Token không hợp lệ");
    if (newPassword !== confirmPassword)
      throw new Error("Mật khẩu xác nhận không khớp");
    if (newPassword.length < 8)
      throw new Error("Mật khẩu phải có ít nhất 8 ký tự");

    return {
      data: null,
      message: "Mật khẩu đã được đặt lại thành công",
      status: 200,
    };
  },

  extractErrorMessage: (error: unknown): string => {
    if (error instanceof Error) return error.message;
    return "Có lỗi xảy ra, vui lòng thử lại";
  },
};

const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get URL parameters
  const params = new URLSearchParams(location.search);
  const status = params.get("status");
  const tokenParam = params.get("token");
  const error = params.get("error");

  // Safely handle token
  const token = tokenParam?.trim() || "";

  // Component state
  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(3);

  // Check token validity on mount
  useEffect(() => {
    if (status !== "fail" && !token) {
      navigate("/?error=missing_token");
    }
  }, [token, status, navigate]);

  // Auto redirect for failed status
  useEffect(() => {
    if (status === "fail") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            navigate("/");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, navigate]);

  // Error message mapping
  const getErrorMessage = (errorType: string | null): string => {
    const errorMessages: Record<string, string> = {
      invalid_jwt: "Liên kết không hợp lệ hoặc đã bị thay đổi",
      token_expired: "Liên kết đã hết hạn",
      token_not_found: "Liên kết không tồn tại hoặc đã được sử dụng",
      account_not_found: "Tài khoản không tồn tại",
      invalid_token_type: "Loại token không đúng",
      missing_token: "Thiếu token xác thực",
    };

    return (
      errorMessages[errorType || ""] ||
      "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn"
    );
  };

  // Password validation
  const validatePassword = (password: string): string => {
    const checks = [
      {
        test: password.length >= 8,
        message: "Mật khẩu phải có ít nhất 8 ký tự",
      },
      {
        test: /[A-Z]/.test(password),
        message: "Mật khẩu phải có ít nhất 1 chữ hoa",
      },
      {
        test: /[a-z]/.test(password),
        message: "Mật khẩu phải có ít nhất 1 chữ thường",
      },
      { test: /\d/.test(password), message: "Mật khẩu phải có ít nhất 1 số" },
      {
        test: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        message: "Mật khẩu phải có ít nhất 1 ký tự đặc biệt",
      },
    ];

    for (const check of checks) {
      if (!check.test) return check.message;
    }
    return "";
  };

  // Password strength indicator
  const getPasswordStrength = (password: string): PasswordCheck[] => [
    { test: password.length >= 8, label: "Ít nhất 8 ký tự" },
    { test: /[A-Z]/.test(password), label: "Chữ hoa" },
    { test: /[a-z]/.test(password), label: "Chữ thường" },
    { test: /\d/.test(password), label: "Số" },
    { test: /[!@#$%^&*(),.?":{}|<>]/.test(password), label: "Ký tự đặc biệt" },
  ];

  const passwordChecks = getPasswordStrength(password);
  const allChecksPassed = passwordChecks.every((check) => check.test);

  // Form submission handler
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setFormError("");
    setIsLoading(true);

    try {
      // Validate token
      if (!token) {
        throw new Error("Token không hợp lệ");
      }

      // Validate password
      const passwordError = validatePassword(password);
      if (passwordError) {
        throw new Error(passwordError);
      }

      // Validate confirm password
      if (password !== confirm) {
        throw new Error("Mật khẩu xác nhận không khớp");
      }

      // Call API with correct parameters
      await authService.resetPassword(token, password, confirm);

      setSuccess(true);
      setTimeout(() => navigate("/auth/login"), 3000);
    } catch (err) {
      const errorMsg = authService.extractErrorMessage(err);
      setFormError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Error State Component
  if (status === "fail" || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-red-50 to-pink-50">
        <Card className="shadow-lg w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-pink-600 text-white rounded-full flex items-center justify-center mx-auto my-3">
              <XCircle className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl text-red-600">
              Đặt lại mật khẩu thất bại
            </CardTitle>
            <CardDescription className="text-gray-600">
              {getErrorMessage(error || (!token ? "missing_token" : null))}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {status === "fail" && (
              <Alert className="mb-4 bg-yellow-50 border-yellow-200">
                <AlertDescription className="text-yellow-800">
                  🕒 Tự động chuyển về trang chủ sau{" "}
                  <strong>{countdown}s</strong>
                </AlertDescription>
              </Alert>
            )}
            <Button
              onClick={() => navigate("/")}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Trở về trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success State Component
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-green-50 to-emerald-50">
        <Card className="shadow-lg w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-600 text-white rounded-full flex items-center justify-center mx-auto my-3">
              <CheckCircle className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Đổi mật khẩu thành công!
            </CardTitle>
            <CardDescription className="text-gray-600">
              Đang chuyển về trang đăng nhập...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Main Form Component
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="shadow-lg w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-600 text-white rounded-full flex items-center justify-center mx-auto my-3">
            <Lock className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl">Đặt lại mật khẩu</CardTitle>
          <CardDescription>
            Tạo mật khẩu mạnh để bảo vệ tài khoản của bạn
          </CardDescription>
        </CardHeader>

        <CardContent>
          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                Mật khẩu mới
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu mới"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md border">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Yêu cầu mật khẩu:
                  </p>
                  <div className="space-y-1">
                    {passwordChecks.map((check, index) => (
                      <div key={index} className="flex items-center text-xs">
                        <span
                          className={`mr-2 ${
                            check.test ? "text-green-600" : "text-gray-400"
                          }`}
                        >
                          {check.test ? "✓" : "○"}
                        </span>
                        <span
                          className={
                            check.test ? "text-green-600" : "text-gray-500"
                          }
                        >
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirm"
                className="block text-sm font-medium mb-2"
              >
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={`pr-10 ${
                    confirm && password !== confirm ? "border-red-500" : ""
                  }`}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {confirm && password !== confirm && (
                <p className="text-sm text-red-600 mt-1">
                  Mật khẩu xác nhận không khớp
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !allChecksPassed || password !== confirm}
            >
              {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
            </Button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => navigate("/auth/login")}
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
            >
              Quay lại trang đăng nhập
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
