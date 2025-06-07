import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Phone, ArrowLeft } from "lucide-react";

export function VerifyPhonePage() {
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // TODO: Implement send verification code API call
      // await sendVerificationCode(phone)
      setStep("verify");
    } catch {
      setError("Không thể gửi mã xác thực. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // TODO: Implement verify code API call
      // await verifyPhoneCode(phone, verificationCode)
      navigate("/");
    } catch {
      setError("Mã xác thực không đúng. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                step === "verify" ? setStep("phone") : navigate(-1)
              }
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-2xl font-bold">
                Xác thực số điện thoại
              </CardTitle>
              <CardDescription>
                {step === "phone"
                  ? "Nhập số điện thoại để nhận mã xác thực"
                  : "Nhập mã xác thực đã được gửi đến điện thoại của bạn"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {step === "phone" ? (
          <form onSubmit={handleSendCode}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Phone className="mr-2 h-4 w-4" />
                Gửi mã xác thực
              </Button>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Mã xác thực đã được gửi đến số điện thoại:
                </p>
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  {phone}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Mã xác thực</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Nhập mã 6 số"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  required
                  disabled={isLoading}
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Xác thực
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStep("phone")}
                disabled={isLoading}
              >
                Gửi lại mã xác thực
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}

export default VerifyPhonePage;
