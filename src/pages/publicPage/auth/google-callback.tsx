import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "@/lib/api/axios";

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      axiosInstance
        .post("/api/v1/auth/google/callback", { code })
        .then((res) => {
          const { access_token, refresh_token, user } = res.data;
          if (access_token) {
            localStorage.setItem("token", access_token);
            if (refresh_token)
              localStorage.setItem("refresh_token", refresh_token);
            localStorage.setItem("user_info", JSON.stringify(user));
            navigate("/");
          } else {
            navigate("/auth/login");
          }
        })
        .catch(() => {
          navigate("/auth/login");
        });
    } else {
      navigate("/auth/login");
    }
  }, [searchParams, navigate]);

  return <div>Đang xử lý đăng nhập Google...</div>;
}
