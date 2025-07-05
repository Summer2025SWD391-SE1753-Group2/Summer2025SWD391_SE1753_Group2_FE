// src/pages/auth/ForgotPasswordPage.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Lock } from "lucide-react";

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

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError("");
  setSuccess("");
  setIsLoading(true);

  if (!username) {
    setError("Vui lòng nhập tên đăng nhập.");
    setIsLoading(false);
    return;
  }

  try {
    const response: ApiResponse<null> = await authService.forgotPassword(username);
    setSuccess(response.message);
    toast.success(response.message);
    setUsername("");
  } catch (err) {
    setError(authService.extractErrorMessage(err));
    toast.error(authService.extractErrorMessage(err));
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="shadow-lg w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-rose-600 text-indigo-50 rounded-full flex items-center justify-center mx-auto my-3">
            <Lock className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl">Đặt lại mật khẩu</CardTitle>
          <CardDescription>
            Nhập tên đăng nhập của bạn. Chúng tôi sẽ gửi một liên kết để xác nhận.
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
              <label htmlFor="username" className="block text-sm font-medium mb-1">
                Tên đăng nhập
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Nhập tên đăng nhập*"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                className={error && error.includes("nhập") ? "border-red-500" : ""}
              />
              <div className="h-4 mt-1">
                {error && error.includes("nhập") && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              aria-label="Gửi liên kết đặt lại"
            >
              {isLoading ? "Đang gửi..." : "Gửi liên kết đặt lại"}
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

export default ForgotPasswordPage;