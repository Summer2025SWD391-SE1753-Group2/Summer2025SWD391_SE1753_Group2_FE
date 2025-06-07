import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateField = (field: string, value: string) => {
    const newErrors: { [key: string]: string } = { ...errors };

    if (field === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors.email = "Nhập địa chỉ email hợp lệ.";
      } else {
        delete newErrors.email;
      }
    }
    if (field === "password") {
      if (value.length < 6) {
        newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
      } else {
        delete newErrors.password;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fields = { email, password };
    let isValid = true;

    Object.keys(fields).forEach((field) => {
      const valid = validateField(field, fields[field as keyof typeof fields]);
      if (!valid) isValid = false;
    });

    if (isValid && email && password) {
      console.log("Yêu cầu đặt lại mật khẩu cho:", { email, password });
    } else {
      alert("Vui lòng kiểm tra và điền lại các trường thông tin bị lỗi!");
    }
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 p-6 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-gray-600 dark:border-gray-400 flex items-center justify-center">
            <Lock className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          Đặt lại mật khẩu
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Nhập email hoặc tên đăng nhập và mật khẩu mới của bạn. <br />
          Chúng tôi sẽ gửi một liên kết để xác nhận việc đặt lại mật khẩu.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">
              Email hoặc tên đăng nhập
            </label>
            <Input
              id="email"
              className="rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-0 focus:border-blue-600 dark:focus:border-blue-500"
              type="email"
              placeholder="Nhập email hoặc tên đăng nhập*"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
                validateField("email", e.target.value);
              }}
              required
              aria-label="Email hoặc tên đăng nhập"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">
              Mật khẩu mới (ít nhất 6 ký tự)
            </label>
            <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
              <Input
                id="password"
                className="rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-0 focus:border-blue-600 dark:focus:border-blue-500"
                style={{ paddingRight: "40px" }}
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu mới*"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setPassword(e.target.value);
                  validateField("password", e.target.value);
                }}
                required
                aria-label="Mật khẩu mới"
              />
              <span
                style={{ position: "absolute", right: "8px", cursor: "pointer" }}
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-500 dark:text-gray-400" /> : <Eye className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
              </span>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <Button
            type="submit"
            className="w-full"
            aria-label="Gửi liên kết đặt lại"
          >
            Gửi liên kết đặt lại
          </Button>
        </form>

        <div>
          <Link
            to="/login"
            className="text-primary hover:underline"
            aria-label="Không thể đặt lại mật khẩu?"
          >
            Không thể đặt lại mật khẩu?
          </Link>
        </div>

        <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 text-sm">
          <span className="h-px w-10 bg-gray-300 dark:bg-gray-600"></span>
          <span>HOẶC</span>
          <span className="h-px w-10 bg-gray-300 dark:bg-gray-600"></span>
        </div>

        <div>
          <Link
            to="/auth/register"
            className="text-primary hover:underline"
            aria-label="Tạo tài khoản mới"
          >
            Tạo tài khoản mới
          </Link>
        </div>

        <div className="mt-6">
          <Link
            to="/auth/login"
            className="text-primary hover:underline"
            aria-label="Quay lại đăng nhập"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;