import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

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
      console.log("Đăng nhập thành công với:", { email, password });
      navigate("/home");
    } else {
      alert("Vui lòng kiểm tra và điền lại các trường thông tin bị lỗi!");
    }
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm space-y-6 bg-white p-6 rounded-lg shadow-md text-center">
        <div className="flex justify-center items-center">
          <h2 className="text-2xl font-bold text-gray-800">Đăng nhập</h2>
        </div>

        <Separator />

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Địa chỉ email (ví dụ: example@domain.com)
            </label>
            <Input
              id="email"
              className="w-full rounded-2xl border-0 bg-gray-50 px-4 py-3 text-gray-700 placeholder-gray-400 focus:ring-0 focus:border-blue-600"
              type="email"
              placeholder="Nhập email*"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
                validateField("email", e.target.value);
              }}
              required
              aria-label="Địa chỉ email"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Mật khẩu (ít nhất 6 ký tự)
            </label>
            <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
              <Input
                id="password"
                className="w-full rounded-2xl border-0 bg-gray-50 px-4 py-3 text-gray-700 placeholder-gray-400 focus:ring-0 focus:border-blue-600"
                style={{ paddingRight: "40px" }} // Chừa chỗ cho icon
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu*"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setPassword(e.target.value);
                  validateField("password", e.target.value);
                }}
                required
                aria-label="Mật khẩu"
              />
              <span
                style={{ position: "absolute", right: "8px", cursor: "pointer" }}
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
              </span>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div className="flex justify-center">
            <Link
              to="/forgot-password"
              className="text-sm text-gray-800 hover:text-blue-600 hover:underline"
              aria-label="Quên mật khẩu?"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              type="submit"
              className="w-1/2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 transition-colors"
              aria-label="Đăng nhập"
            >
              Đăng nhập
            </Button>
            <Button
              asChild
              className="w-1/2 rounded-2xl bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 transition-colors"
              aria-label="Tạo tài khoản"
            >
              <Link to="/register">Tạo tài khoản</Link>
            </Button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-500">
          Hoặc đăng nhập bằng:
        </div>

        <div className="space-y-3 flex flex-col items-center">
          <Button
            className="w-full rounded-2xl bg-[#db4437] hover:bg-[#c1352a] text-white px-4 py-3 transition-colors"
            aria-label="Đăng nhập bằng Google"
          >
            GOOGLE
          </Button>
        </div>
      </div>
    </div>
  );
}