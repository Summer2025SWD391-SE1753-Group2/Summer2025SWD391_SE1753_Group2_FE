import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
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
import { Eye, EyeOff, Pizza, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth";
import { getDefaultRouteByRole } from "@/utils/constant/path";
import type { LoginRequest } from "@/types/auth";

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Validation utilities
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

const validateLoginForm = (data: LoginRequest): ValidationResult => {
  const errors: Record<string, string> = {};

  // Validate email or username
  const loginValue = data.email || data.username || "";
  if (!loginValue.trim()) {
    errors.email = "Vui lòng nhập email hoặc tên đăng nhập";
  } else if (loginValue.includes("@")) {
    // Nếu có @ thì validate email
    if (!isValidEmail(loginValue)) {
      errors.email = "Email không hợp lệ";
    }
  } else {
    // Nếu không có @ thì validate username
    if (!isValidUsername(loginValue)) {
      errors.email =
        "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới (3-20 ký tự)";
    }
  }

  // Validate password
  if (!data.password.trim()) {
    errors.password = "Vui lòng nhập mật khẩu";
  } else if (data.password.length < 6) {
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    login,
    loginWithGoogle,
    user,
    isAuthenticated,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  const [formData, setFormData] = useState<LoginRequest>({
    email: "", // This field will contain either email or username
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const from = location.state?.from?.pathname || "/";

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Handle errors from location state (e.g., from Google callback)
  useEffect(() => {
    if (location.state?.error) {
      toast.error(location.state.error);
      // Clear the error from location state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  // Validate form whenever formData changes
  const validateForm = useCallback(() => {
    const validation = validateLoginForm(formData);
    setValidationErrors(validation.errors);
    setIsFormValid(validation.isValid);
  }, [formData]);

  useEffect(() => {
    validateForm();
  }, [validateForm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific field error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error("Vui lòng kiểm tra lại thông tin đã nhập");
      return;
    }

    try {
      await login(formData);
      toast.success("Đăng nhập thành công!");
    } catch (loginError) {
      // Error is already handled by auth store
      console.error("Login failed:", loginError);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      await loginWithGoogle();
    } catch (googleError) {
      console.error("Google login failed:", googleError);
      toast.error("Đăng nhập Google thất bại. Vui lòng thử lại.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Auto redirect after successful login
  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user.role?.role_name || "user";
      const redirectTo = getDefaultRouteByRole(role);
      navigate(redirectTo || from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="shadow-lg w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r text-indigo-50 from-orange-400 to-rose-600 rounded-full flex items-center justify-center mx-auto my-4">
            <Pizza className="w-10 h-10" />
          </div>
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription>
            Đăng nhập vào tài khoản Food Forum của bạn
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email hoặc Tên đăng nhập
              </label>
              <Input
                id="email"
                name="email"
                type="text"
                placeholder="example@email.com hoặc username"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                className={validationErrors.email ? "border-red-500" : ""}
              />
              {/* Reserved space để tránh UI jumping */}
              <div className="h-5 mt-1">
                {validationErrors.email && (
                  <p className="text-sm text-red-600">
                    {validationErrors.email}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className={validationErrors.password ? "border-red-500" : ""}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={togglePasswordVisibility}
                  tabIndex={-1}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {/* Reserved space để tránh UI jumping */}
              <div className="h-5 mt-1">
                {validationErrors.password && (
                  <p className="text-sm text-red-600">
                    {validationErrors.password}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <Link
                to="/forgot-password"
                className="text-primary hover:underline transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Hoặc
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
              onClick={handleGoogleLogin}
              disabled={isLoading || isGoogleLoading}
            >
              {isGoogleLoading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                  Đang chuyển hướng...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Đăng nhập với Google
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Chưa có tài khoản? </span>
            <Link
              to="/auth/register"
              className="text-primary hover:underline font-medium transition-colors"
            >
              Đăng ký ngay
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
