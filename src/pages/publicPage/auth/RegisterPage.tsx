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
import { toast } from "sonner";
import { Eye, EyeOff, Pizza, CheckCircle } from "lucide-react";

// Define interfaces
interface RegisterFormData {
  full_name: string;
  username: string;
  email: string;
  password: string;
  date_of_birth: string;
}

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
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-/=\[\]{};':"\\|,.<>?]).{8,}$/;
  return passwordRegex.test(password);
};

const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_.-]{3,20}$/;
  return usernameRegex.test(username);
};

const isValidFullName = (fullName: string): { isValid: boolean; error?: string } => {
  if (fullName !== fullName.trim()) {
    return { isValid: false, error: "Họ tên không được chứa khoảng trắng ở đầu hoặc cuối" };
  }

  const nameParts = fullName.trim().split(/\s+/);
  const nameRegex = /^[a-zA-ZÀ-ỹ\s]{2,50}$/;
  if (!nameRegex.test(fullName.trim())) {
    return { isValid: false, error: "Họ tên chỉ chứa chữ cái và khoảng trắng" };
  }
  if (nameParts.length < 2 || nameParts.some(part => part.length < 1)) {
    return { isValid: false, error: "Họ tên phải có ít nhất 2 phần (họ và tên)" };
  }

  return { isValid: true };
};

const isValidDateOfBirth = (dateOfBirth: string): { isValid: boolean; error?: string } => {
  if (!dateOfBirth) {
    return { isValid: false, error: "Vui lòng nhập ngày sinh" };
  }

  const [year, month, day] = dateOfBirth.split("-").map(Number);
  
  if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) {
    return { isValid: false, error: "Định dạng ngày sinh không hợp lệ" };
  }

  if (month < 1 || month > 12) {
    return { isValid: false, error: "Tháng phải từ 1 đến 12" };
  }

  const daysInMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day < 1 || day > daysInMonth[month - 1]) {
    return { isValid: false, error: `Ngày không hợp lệ cho tháng ${month}` };
  }

  const birthDate = new Date(year, month - 1, day);
  const today = new Date();

  if (
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day
  ) {
    return { isValid: false, error: "Ngày sinh không hợp lệ" };
  }

  if (birthDate >= today) {
    return { isValid: false, error: "Ngày sinh không được ở tương lai" };
  }

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 13) {
    return { isValid: false, error: "Bạn phải ít nhất 13 tuổi để đăng ký" };
  }
  if (age >= 100) {
    return { isValid: false, error: "Bạn phải dưới 100 tuổi để đăng ký" };
  }

  return { isValid: true };
};

const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

const validateRegisterForm = (data: RegisterFormData): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.username) {
    errors.username = "Vui lòng nhập tên đăng nhập";
  } else if (!isValidUsername(data.username)) {
    errors.username = "Tên đăng nhập chỉ chứa chữ cái, số, . hoặc - (3-20 ký tự)";
  }

  if (!data.email) {
    errors.email = "Vui lòng nhập email";
  } else if (!isValidEmail(data.email)) {
    errors.email = "Email không hợp lệ";
  }

  if (!data.password) {
    errors.password = "Vui lòng nhập mật khẩu";
  } else if (!isValidPassword(data.password)) {
    errors.password = "Mật khẩu phải có ít nhất 8 ký tự, chứa chữ hoa, chữ thường, số và ký tự đặc biệt";
  }

  if (!data.full_name) {
    errors.full_name = "Vui lòng nhập họ và tên";
  } else {
    const fullNameValidation = isValidFullName(data.full_name);
    if (!fullNameValidation.isValid) {
      errors.full_name = fullNameValidation.error || "Họ tên không hợp lệ";
    }
  }

  const dateValidation = isValidDateOfBirth(data.date_of_birth);
  if (!dateValidation.isValid) {
    errors.date_of_birth = dateValidation.error || "Ngày sinh không hợp lệ";
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
  if (/[!@#$%^&*()_+\-/=\[\]{};':"\\|,.<>?]/.test(password)) score++;

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
  const [formData, setFormData] = useState<RegisterFormData>({
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

  // Debounced username availability check (mock)
  const checkUsernameAvailability = useCallback(
    debounce(async (username: string) => {
      if (username.length >= 3 && isValidUsername(username)) {
        setIsUsernameChecking(true);
        try {
          // Mock API call for username availability
          await new Promise((resolve) => setTimeout(resolve, 500));
          // Simulate a check (e.g., username is always available for demo)
          setIsUsernameChecking(false);
        } catch {
          setIsUsernameChecking(false);
          setValidationErrors((prev) => ({
            ...prev,
            username: "Tên đăng nhập không khả dụng",
          }));
        }
      }
    }, 500),
    []
  );

  // Debounced email availability check (mock)
  const checkEmailAvailability = useCallback(
    debounce(async (email: string) => {
      if (email.includes("@") && isValidEmail(email)) {
        setIsEmailChecking(true);
        try {
          // Mock API call for email availability
          await new Promise((resolve) => setTimeout(resolve, 500));
          // Simulate a check (e.g., email is always available for demo)
          setIsEmailChecking(false);
        } catch {
          setIsEmailChecking(false);
          setValidationErrors((prev) => ({
            ...prev,
            email: "Email đã được sử dụng",
          }));
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

    // Validate form before submission
    const validation = validateRegisterForm(formData);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError, {
        duration: 3000,
        position: "top-right",
      });
      return;
    }

    setLoading(true);

    try {
      // Mock API call for registration
      console.log("📤 Sending data to register:", formData);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
      toast.success("Đăng ký thành công! Vui lòng xác nhận Email của bạn.", {
        duration: 3000,
        position: "top-right",
      });
      navigate("/auth/login");
    } catch (error) {
      console.error("❌ Register error:", error);
      toast.error("Đã có lỗi xảy ra khi đăng ký. Vui lòng thử lại.", {
        duration: 3000,
        position: "top-right",
      });
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
              <label htmlFor="email" className="block text-sm font-medium mb-1">
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
                      className={`font-medium ${passwordStrength.score >= 3
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