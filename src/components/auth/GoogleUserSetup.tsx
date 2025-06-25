import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { accountService } from "@/services/accounts/accountService";
import type { GoogleUserInfo } from "@/types/account";
import { useAuthStore } from "@/stores/auth";

interface GoogleUserSetupProps {
  onComplete?: () => void;
}

export function GoogleUserSetup({ onComplete }: GoogleUserSetupProps) {
  const { user, setUser } = useAuthStore();
  const [googleUserInfo, setGoogleUserInfo] = useState<GoogleUserInfo | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  // Form states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation states
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  useEffect(() => {
    checkGoogleUserStatus();
  }, []);

  const checkGoogleUserStatus = async () => {
    try {
      setLoading(true);

      // Debug: Check if user is authenticated
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="));
      console.log("Debug - Access token exists:", !!token);

      const info = await accountService.isGoogleUser();
      setGoogleUserInfo(info);
      setIsGoogleUser(info.is_google_user);

      if (info.is_google_user && info.current_username.startsWith("google_")) {
        // Show setup form for Google users with default username
        setNewUsername(info.current_username.replace("google_", ""));
      }
    } catch (error) {
      console.error("Failed to check Google user status:", error);

      // For now, just hide the component on any error
      // This prevents the 403 error from showing to users
      setIsGoogleUser(false);
    } finally {
      setLoading(false);
    }
  };

  const validateUsername = (username: string) => {
    if (!username.trim()) {
      setUsernameError("Tên đăng nhập không được để trống");
      return false;
    }
    if (username.length < 3) {
      setUsernameError("Tên đăng nhập phải có ít nhất 3 ký tự");
      return false;
    }
    if (username.length > 20) {
      setUsernameError("Tên đăng nhập không được quá 20 ký tự");
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError(
        "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới"
      );
      return false;
    }
    setUsernameError("");
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("Mật khẩu không được để trống");
      return false;
    }
    if (password.length < 8) {
      setPasswordError("Mật khẩu phải có ít nhất 8 ký tự");
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setPasswordError("Mật khẩu phải chứa chữ hoa, chữ thường và số");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const validateConfirmPassword = (confirm: string) => {
    if (confirm !== newPassword) {
      setConfirmPasswordError("Mật khẩu xác nhận không khớp");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  const handleUsernameChange = (value: string) => {
    setNewUsername(value);
    if (usernameError) validateUsername(value);
  };

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    if (passwordError) validatePassword(value);
    if (confirmPassword && confirmPasswordError)
      validateConfirmPassword(confirmPassword);
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (confirmPasswordError) validateConfirmPassword(value);
  };

  const handleUpdateUsername = async () => {
    if (!validateUsername(newUsername)) return;

    try {
      setIsSubmitting(true);
      await accountService.updateUsername({ new_username: newUsername });
      toast.success("Cập nhật tên đăng nhập thành công!");

      // Update local user state
      if (user) {
        setUser({ ...user, username: newUsername });
      }

      onComplete?.();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Cập nhật tên đăng nhập thất bại";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (
      !validatePassword(newPassword) ||
      !validateConfirmPassword(confirmPassword)
    )
      return;

    try {
      setIsSubmitting(true);
      await accountService.updatePassword({
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      toast.success("Cập nhật mật khẩu thành công!");
      onComplete?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Cập nhật mật khẩu thất bại";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="ml-2">Đang kiểm tra tài khoản...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isGoogleUser) {
    return null; // Don't show for non-Google users
  }

  const hasDefaultUsername =
    googleUserInfo?.current_username.startsWith("google_");

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          Thiết lập tài khoản Google
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bạn đã đăng nhập bằng Google. Bạn có thể tùy chọn thiết lập tên đăng
            nhập và mật khẩu để sử dụng đăng nhập thông thường.
          </AlertDescription>
        </Alert>

        {/* Username Setup */}
        {hasDefaultUsername && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Tên đăng nhập mới</Label>
              <Input
                id="username"
                type="text"
                placeholder="Nhập tên đăng nhập mới"
                value={newUsername}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className={usernameError ? "border-red-500" : ""}
              />
              {usernameError && (
                <p className="text-sm text-red-600 mt-1">{usernameError}</p>
              )}
            </div>
            <Button
              onClick={handleUpdateUsername}
              disabled={isSubmitting || !newUsername.trim()}
              className="w-full"
            >
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật tên đăng nhập"}
            </Button>
          </div>
        )}

        {/* Password Setup */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="password">Mật khẩu mới (tùy chọn)</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className={passwordError ? "border-red-500" : ""}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {passwordError && (
              <p className="text-sm text-red-600 mt-1">{passwordError}</p>
            )}
          </div>

          {newPassword && (
            <div>
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  className={confirmPasswordError ? "border-red-500" : ""}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {confirmPasswordError && (
                <p className="text-sm text-red-600 mt-1">
                  {confirmPasswordError}
                </p>
              )}
            </div>
          )}

          {newPassword &&
            confirmPassword &&
            !passwordError &&
            !confirmPasswordError && (
              <Button
                onClick={handleUpdatePassword}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
              </Button>
            )}
        </div>

        {/* Skip option */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={onComplete}
            className="text-muted-foreground"
          >
            Bỏ qua, thiết lập sau
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
