import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";
import { toast } from "sonner";
import { getDefaultRouteByRole } from "@/utils/constant/path";

export function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = () => {
      const success = searchParams.get("success");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        console.error("Google OAuth error:", errorParam);
        setError("Google đăng nhập thất bại. Vui lòng thử lại.");
        setLoading(false);
        return;
      }

      if (success === "true") {
        try {
          // Extract tokens and user info from URL parameters
          const accessToken = searchParams.get("access_token");
          const refreshToken = searchParams.get("refresh_token");
          const userId = searchParams.get("user_id");
          const username = searchParams.get("username");
          const email = searchParams.get("email");
          const fullName = searchParams.get("full_name");
          const role = searchParams.get("role");
          const avatar = searchParams.get("avatar");
          const accountId = searchParams.get("account_id");
          const status = searchParams.get("status");
          const emailVerified = searchParams.get("email_verified");
          const createdAt = searchParams.get("created_at");
          const updatedAt = searchParams.get("updated_at");

          if (!accessToken || !userId || !username || !email) {
            throw new Error("Thiếu thông tin xác thực từ server");
          }

          // Store tokens in cookies (using the same method as authService)
          const setCookie = (
            name: string,
            value: string,
            days: number = 7
          ): void => {
            const expires = new Date(Date.now() + days * 864e5).toUTCString();
            const isSecure = location.protocol === "https:";
            document.cookie = `${name}=${encodeURIComponent(
              value
            )}; expires=${expires}; path=/; SameSite=Strict${
              isSecure ? "; Secure" : ""
            }`;
          };

          setCookie("access_token", accessToken, 1);
          if (refreshToken) {
            setCookie("refresh_token", refreshToken, 7);
          }

          // Create user object
          const userInfo = {
            username: username,
            email: email,
            full_name: fullName || "",
            avatar: avatar || undefined,
            account_id: accountId || userId,
            status: (status as "active" | "inactive" | "banned") || "active",
            role: {
              role_id: role === "admin" ? 3 : role === "moderator" ? 2 : 1,
              role_name: (role as "user" | "moderator" | "admin") || "user",
              status: "active" as const,
            },
            email_verified: emailVerified === "true",
            date_of_birth: undefined,
            created_at: createdAt || new Date().toISOString(),
            updated_at: updatedAt || new Date().toISOString(),
            created_by: userId,
            updated_by: userId,
          };

          // Store user info in cookie
          setCookie("user_info", JSON.stringify(userInfo), 7);

          // Update auth store
          setUser(userInfo);

          toast.success("Đăng nhập Google thành công!");

          // Redirect to appropriate dashboard based on role
          const roleName = userInfo.role?.role_name || "user";
          const redirectTo = getDefaultRouteByRole(roleName);
          navigate(redirectTo, { replace: true });
        } catch (error) {
          console.error("Failed to process Google callback:", error);
          setError("Xử lý đăng nhập Google thất bại. Vui lòng thử lại.");
          setLoading(false);
        }
      } else {
        setError("Đăng nhập Google thất bại. Vui lòng thử lại.");
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser]);

  // If user is already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      const role = useAuthStore.getState().user?.role?.role_name || "user";
      const redirectTo = getDefaultRouteByRole(role);
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-lg font-medium">
                Đang xử lý đăng nhập Google...
              </p>
              <p className="text-sm text-muted-foreground text-center">
                Vui lòng đợi trong giây lát
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <div className="text-center">
                <h2 className="text-xl font-semibold text-red-600 mb-2">
                  Đăng nhập thất bại
                </h2>
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button
                  onClick={() => navigate("/auth/login")}
                  className="w-full"
                >
                  Quay lại trang đăng nhập
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
