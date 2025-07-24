import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "@/services/auth/authService";
import { toast } from "sonner";
import { Eye, EyeOff, Pizza, CheckCircle } from "lucide-react";
import type { ErrorResponse, RegisterRequest } from "@/types/auth";

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Validation utilities
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-/=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;
  return passwordRegex.test(password) && !/\s/.test(password);
};

const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_.-]{3,20}$/;
  return usernameRegex.test(username);
};

const isValidFullName = (fullName: string): boolean => {
  const nameRegex = /^[a-zA-ZÀ-ỹ\s]{2,50}$/;
  return nameRegex.test(fullName) && fullName.trim() === fullName;
};

const isValidDateOfBirth = (dateOfBirth: string): boolean => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);

  if (isNaN(birthDate.getTime())) return false;
  if (birthDate >= today) return false;

  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    return age - 1 >= 13 && age - 1 <= 100;
  }

  return age >= 13 && age <= 100;
};

const validateRegisterForm = (data: RegisterRequest): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.full_name) {
    errors.full_name = "Vui lòng nhập họ và tên";
  } else if (!isValidFullName(data.full_name)) {
    errors.full_name = "Họ tên phải có ít nhất 2 ký tự, chỉ chứa chữ cái và không có khoảng trắng đầu cuối";
  }

  if (!data.username) {
    errors.username = "Vui lòng nhập tên đăng nhập";
  } else if (!isValidUsername(data.username)) {
    errors.username =
      "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới (3-20 ký tự)";
  }

  if (!data.email) {
    errors.email = "Vui lòng nhập email";
  } else if (!isValidEmail(data.email)) {
    errors.email = "Email không hợp lệ";
  }

  if (!data.password) {
    errors.password = "Vui lòng nhập mật khẩu";
  } else if (!isValidPassword(data.password)) {
    errors.password =
      "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số, ký tự đặc biệt và không chứa khoảng trắng";
  }

  if (!data.date_of_birth) {
    errors.date_of_birth = "Vui lòng nhập ngày sinh";
  } else if (!isValidDateOfBirth(data.date_of_birth)) {
    errors.date_of_birth = "Ngày sinh không hợp lệ, tuổi phải từ 13 đến 100";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

const getPasswordStrength = (
  password: string
): {
  score: number;
  label: string;
  color: string;
} => {
  if (!password) {
    return { score: 0, label: "Rất yếu", color: "bg-red-500" };
  }

  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  const indicators = [
    { score: 0, label: "Rất yếu", color: "bg-red-500" },
    { score: 1, label: "Yếu", color: "bg-red-400" },
    { score: 2, label: "Trung bình", color: "bg-yellow-500" },
    { score: 3, label: "Mạnh", color: "bg-blue-500" },
    { score: 4, label: "Rất mạnh", color: "bg-green-500" },
    { score: 5, label: "Xuất sắc", color: "bg-green-600" },
  ];

  return indicators[Math.min(score, 5)];
};

const debounce = (func: (value: string) => Promise<void>, wait: number) => {
  let timeout: NodeJS.Timeout;

  return (value: string) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(value), wait);
  };
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterRequest>({
    full_name: "",
    username: "",
    email: "",
    password: "",
    date_of_birth: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(
    getPasswordStrength("")
  );
  const [isUsernameChecking, setIsUsernameChecking] = useState(false);
  const [isEmailChecking, setIsEmailChecking] = useState(false);

  // Validate form whenever formData changes
  const validateForm = useCallback(() => {
    const validation = validateRegisterForm(formData);
    setValidationErrors(validation.errors);
    setIsFormValid(validation.isValid);
  }, [formData]);

  useEffect(() => {
    validateForm();
  }, [validateForm]);

  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength(getPasswordStrength(formData.password));
  }, [formData.password]);

  // Debounced username availability check
  const checkUsernameAvailability = useCallback(
    debounce(async (username: string) => {
      if (username.length >= 3) {
        setIsUsernameChecking(true);
        try {
          // This would be an API call to check username availability
          // For now, we'll just simulate it
          await new Promise((resolve) => setTimeout(resolve, 500));
          setIsUsernameChecking(false);
        } catch {
          setIsUsernameChecking(false);
        }
      }
    }, 500),
    []
  );

  // Debounced email availability check
  const checkEmailAvailability = useCallback(
    debounce(async (email: string) => {
      if (email.includes("@")) {
        setIsEmailChecking(true);
        try {
          // This would be an API call to check email availability
          // For now, we'll just simulate it
          await new Promise((resolve) => setTimeout(resolve, 500));
          setIsEmailChecking(false);
        } catch {
          setIsEmailChecking(false);
        }
      }
    }, 500),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear specific field error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Trigger availability checks
    if (name === "username" && value.length >= 3) {
      checkUsernameAvailability(value);
    }
    if (name === "email" && value.includes("@")) {
      checkEmailAvailability(value);
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

    setLoading(true);

    try {
      console.log("📤 Sending data to register:", formData);
      await authService.register(formData);
      toast.success("Đăng ký thành công! Vui lòng xác nhận Email và đăng nhập.");
      navigate("/auth/login");
    } catch (error: unknown) {
      const errorData = error as { response?: { data?: ErrorResponse } };
      console.error("❌ Register error:", errorData?.response?.data || error);

      if (errorData?.response?.data?.detail) {
        toast.error(`Đăng ký thất bại: ${errorData.response.data.detail}`);
      } else {
        toast.error("Đăng ký thất bại. Tên người dùng hoặc email đã tồn tại!");
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate maximum date (must be at least 13 years old)
  const getMaxDate = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 13);
    return today.toISOString().split("T")[0];
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="shadow-lg w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r text-indigo-50 from-orange-400 to-rose-600 rounded-full flex items-center justify-center mx-auto my-4">
            <Pizza className="w-10 h-10" />
          </div>
          <CardTitle className="text-2xl">Đăng ký tài khoản</CardTitle>
          <CardDescription>
            Tạo tài khoản Food Forum để tham gia cộng đồng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-medium mb-1"
              >
                Họ và tên
              </label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Nguyễn Văn A"
                value={formData.full_name}
                onChange={handleChange}
                required
                disabled={loading}
                className={validationErrors.full_name ? "border-red-500" : ""}
              />
              <div className="h-5 mt-1">
                {validationErrors.full_name && (
                  <p className="text-sm text-red-600">
                    {validationErrors.full_name}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium mb-1"
              >
                Tên người dùng
              </label>
              <div className="relative">
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="nguyenvana"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className={validationErrors.username ? "border-red-500" : ""}
                />
                {isUsernameChecking && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                  </div>
                )}
                {!isUsernameChecking &&
                  formData.username.length >= 3 &&
                  !validationErrors.username && (
                    <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                  )}
              </div>
              <div className="h-5 mt-1">
                {validationErrors.username && (
                  <p className="text-sm text-red-600">
                    {validationErrors.username}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1"
              >
                Email
              </label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className={validationErrors.email ? "border-red-500" : ""}
                />
                {isEmailChecking && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                  </div>
                )}
                {!isEmailChecking &&
                  formData.email.includes("@") &&
                  !validationErrors.email && (
                    <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                  )}
              </div>
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
                  disabled={loading}
                  className={validationErrors.password ? "border-red-500" : ""}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={togglePasswordVisibility}
                  tabIndex={-1}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Độ mạnh mật khẩu:
                    </span>
                    <span
                      className={`font-medium ${
                        passwordStrength.score >= 3
                          ? "text-green-600"
                          : passwordStrength.score >= 2
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{
                        width: `${(passwordStrength.score / 5) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
              <div className="h-5 mt-1">
                {validationErrors.password && (
                  <p className="text-sm text-red-600">
                    {validationErrors.password}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="date_of_birth"
                className="block text-sm font-medium mb-1"
              >
                Ngày sinh
              </label>
              <Input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
                required
                disabled={loading}
                max={getMaxDate()}
                className={
                  validationErrors.date_of_birth ? "border-red-500" : ""
                }
              />
              <div className="h-5 mt-1">
                {validationErrors.date_of_birth && (
                  <p className="text-sm text-red-600">
                    {validationErrors.date_of_birth}
                  </p>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Bạn phải ít nhất 13 tuổi để đăng ký
              </p>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !isFormValid}
            >
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Đã có tài khoản? </span>
            <Link
              to="/auth/login"
              className="text-primary hover:underline font-medium transition-colors"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
