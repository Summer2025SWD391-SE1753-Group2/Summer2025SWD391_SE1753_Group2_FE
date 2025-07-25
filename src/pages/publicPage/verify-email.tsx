import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "@/lib/api/axios";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"pending" | "success" | "error">(
    "pending"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Liên kết xác thực không hợp lệ.");
      return;
    }
    axiosInstance
      .get("/api/v1/accounts/confirm-email", { params: { token } })
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message || "Xác thực email thành công!");
        setTimeout(() => navigate("/auth/login"), 3000);
      })
      .catch(() => {
        setStatus("error");
        setMessage("Xác thực email thất bại hoặc liên kết đã hết hạn.");
      });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {status === "pending" && <div>Đang xác thực email...</div>}
      {status === "success" && (
        <div>
          <div className="text-green-600 font-bold mb-2">{message}</div>
          <div>Bạn sẽ được chuyển về trang đăng nhập trong giây lát.</div>
          <Button onClick={() => navigate("/auth/login")} className="mt-4">
            Về trang đăng nhập
          </Button>
        </div>
      )}
      {status === "error" && (
        <div>
          <div className="text-red-600 font-bold mb-2">{message}</div>
          <Button onClick={() => navigate("/auth/login")} className="mt-4">
            Về trang đăng nhập
          </Button>
        </div>
      )}
    </div>
  );
}
