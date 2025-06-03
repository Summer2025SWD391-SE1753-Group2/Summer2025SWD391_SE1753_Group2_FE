import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/auth/authStore";
import { authService } from "@/services/auth/authService";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth, error } = useAuthStore();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        console.error("Google OAuth error:", error);
        navigate("/login", {
          state: { error: "Google đăng nhập thất bại. Vui lòng thử lại." },
        });
        return;
      }

      if (!code) {
        navigate("/login", {
          state: { error: "Không nhận được mã xác thực từ Google." },
        });
        return;
      }

      try {
        await authService.handleGoogleCallback(code);
        checkAuth(); // Update auth state
        navigate("/", { replace: true });
      } catch (error) {
        console.error("Google callback error:", error);
        navigate("/login", {
          state: {
            error: "Xử lý đăng nhập Google thất bại. Vui lòng thử lại.",
          },
        });
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, checkAuth]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-lg font-medium">
              Đang xử lý đăng nhập Google...
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Vui lòng đợi trong giây lát
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
