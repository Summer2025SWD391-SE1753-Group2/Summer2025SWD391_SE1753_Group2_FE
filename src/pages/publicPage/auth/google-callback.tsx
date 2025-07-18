import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      navigate("/"); // về trang chủ
    } else {
      navigate("/auth/login"); // về trang login nếu lỗi
    }
  }, [navigate]);

  return <div>Đang đăng nhập bằng Google...</div>;
}
