import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [username, setUsername] = useState<string>("");
  const [fullname, setFullname] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [validationStatus, setValidationStatus] = useState<{
    [key: string]: "valid" | "invalid" | "checking" | null;
  }>({
    username: null,
    fullname: null,
    phone: null,
    email: null,
    password: null,
    confirmPassword: null,
  });

  const validateField = (field: string, value: string) => {
    const newErrors: { [key: string]: string } = { ...errors };
    const newStatus: { [key: string]: "valid" | "invalid" | "checking" | null } = { ...validationStatus };

    newStatus[field] = "checking";
    setValidationStatus(newStatus);

    setTimeout(() => {
      if (field === "username") {
        if (value.length < 3) {
          newErrors.username = "Tên người dùng này không khả dụng. Vui lòng thử tên khác.";
          newStatus.username = "invalid";
        } else {
          delete newErrors.username;
          newStatus.username = "valid";
        }
      }
      if (field === "fullname") {
        if (value.length < 2) {
          newErrors.fullname = "Họ và tên phải có ít nhất 2 ký tự.";
          newStatus.fullname = "invalid";
        } else {
          delete newErrors.fullname;
          newStatus.fullname = "valid";
        }
      }
      if (field === "phone") {
        if (!/^\d{10}$/.test(value)) {
          newErrors.phone = "Số điện thoại phải có đúng 10 chữ số.";
          newStatus.phone = "invalid";
        } else {
          delete newErrors.phone;
          newStatus.phone = "valid";
        }
      }
      if (field === "email") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Nhập địa chỉ email hợp lệ.";
          newStatus.email = "invalid";
        } else {
          delete newErrors.email;
          newStatus.email = "valid";
        }
      }
      if (field === "password") {
        if (value.length < 6) {
          newErrors.password = "Tạo mật khẩu dài tối thiểu 6 ký tự.";
          newStatus.password = "invalid";
        } else {
          delete newErrors.password;
          newStatus.password = "valid";
        }
      }
      if (field === "confirmPassword") {
        if (value !== password) {
          newErrors.confirmPassword = "Mật khẩu xác nhận không khớp với mật khẩu.";
          newStatus.confirmPassword = "invalid";
        } else {
          delete newErrors.confirmPassword;
          newStatus.confirmPassword = "valid";
        }
      }

      setErrors(newErrors);
      setValidationStatus(newStatus);
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fields = { username, fullname, phone, email, password, confirmPassword };
    Object.keys(fields).forEach((field) => validateField(field, fields[field as keyof typeof fields]));

    setTimeout(() => {
      if (Object.keys(errors).length === 0) {
        console.log("Đăng ký với:", { username, fullname, phone, email, password });
      } else {
        alert("Vui lòng kiểm tra và điền lại các trường thông tin bị lỗi.");
      }
    }, 600);
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((prev) => !prev);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm space-y-6 bg-white p-6 rounded-lg shadow-md text-center">
        <div className="flex justify-center items-center">
          <h2 className="text-2xl font-bold text-gray-800">Đăng ký</h2>
        </div>

        <Separator />

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Tên đăng nhập (ít nhất 3 ký tự)
            </label>
            <Input
              id="username"
              className="w-full rounded-2xl border-0 bg-gray-50 px-4 py-3 text-gray-700 placeholder-gray-400 focus:ring-0 focus:border-blue-600"
              type="text"
              placeholder="Nhập tên đăng nhập*"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setUsername(e.target.value);
                validateField("username", e.target.value);
              }}
              required
              aria-label="Tên đăng nhập"
            />
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
          </div>

          <div className="relative">
            <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Họ và tên (ít nhất 2 ký tự)
            </label>
            <Input
              id="fullname"
              className="w-full rounded-2xl border-0 bg-gray-50 px-4 py-3 text-gray-700 placeholder-gray-400 focus:ring-0 focus:border-blue-600"
              type="text"
              placeholder="Nhập họ và tên*"
              value={fullname}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFullname(e.target.value);
                validateField("fullname", e.target.value);
              }}
              required
              aria-label="Họ và tên"
            />
            {errors.fullname && <p className="text-red-500 text-sm mt-1">{errors.fullname}</p>}
          </div>

          <div className="relative">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Số điện thoại (10 chữ số)
            </label>
            <Input
              id="phone"
              className="w-full rounded-2xl border-0 bg-gray-50 px-4 py-3 text-gray-700 placeholder-gray-400 focus:ring-0 focus:border-blue-600"
              type="tel"
              placeholder="Nhập số điện thoại*"
              value={phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPhone(e.target.value);
                validateField("phone", e.target.value);
              }}
              required
              aria-label="Số điện thoại"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

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
                  if (confirmPassword) validateField("confirmPassword", confirmPassword);
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

          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Xác nhận mật khẩu (phải khớp với mật khẩu)
            </label>
            <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
              <Input
                id="confirmPassword"
                className="w-full rounded-2xl border-0 bg-gray-50 px-4 py-3 text-gray-700 placeholder-gray-400 focus:ring-0 focus:border-blue-600"
                style={{ paddingRight: "40px" }} // Chừa chỗ cho icon
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu*"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setConfirmPassword(e.target.value);
                  validateField("confirmPassword", e.target.value);
                }}
                required
                aria-label="Xác nhận mật khẩu"
              />
              <span
                style={{ position: "absolute", right: "8px", cursor: "pointer" }}
                onClick={toggleConfirmPasswordVisibility}
                aria-label={showConfirmPassword ? "Ẩn xác nhận mật khẩu" : "Hiện xác nhận mật khẩu"}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
              </span>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <div className="flex justify-center">
            <Link
              to="/login"
              className="text-sm text-gray-800 hover:text-blue-600 hover:underline"
              aria-label="Đã có tài khoản? Đăng nhập"
            >
              Đã có tài khoản? Đăng nhập
            </Link>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              type="submit"
              className="w-1/2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 transition-colors"
              aria-label="Tạo tài khoản"
            >
              Tạo tài khoản
            </Button>
            <Button
              asChild
              className="w-1/2 rounded-2xl bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 transition-colors"
              aria-label="Quay lại đăng nhập"
            >
              <Link to="/login">Đăng nhập</Link>
            </Button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-500">
          Hoặc đăng ký bằng:
        </div>

        <div className="space-y-3 flex flex-col items-center">
          <Button
            className="w-full rounded-2xl bg-[#db4437] hover:bg-[#c1352a] text-white px-4 py-3 transition-colors"
            aria-label="Đăng ký bằng Google"
          >
            GOOGLE
          </Button>
        </div>
      </div>
    </div>
  );
}