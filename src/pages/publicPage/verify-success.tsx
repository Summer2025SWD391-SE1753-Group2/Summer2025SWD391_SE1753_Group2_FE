import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { paths } from "@/utils/constant/path";

export default function VerifySuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const status = params.get("status"); // "success" hoặc "fail"
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      navigate(paths.login);
      return;
    }
    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, navigate]);

  const isSuccess = status === "success";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        background: isSuccess ? "#f6ffed" : "#fff1f0",
        border: isSuccess ? "1px solid #b7eb8f" : "1px solid #ffa39e",
        borderRadius: 12,
        margin: 32,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        color: isSuccess ? "#389e0d" : "#cf1322",
        fontSize: 24,
        fontWeight: 600,
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>
        {isSuccess ? "✔️" : "❌"}
      </div>
      {isSuccess
        ? "Xác thực email thành công! Bạn có thể đăng nhập."
        : "Liên kết xác thực không hợp lệ hoặc đã hết hạn."}
      <br />
      <span style={{ fontSize: 16, color: "#555", marginTop: 12 }}>
        Đang chuyển về trang đăng nhập sau {count} giây...
      </span>
      <button
        style={{
          marginTop: 24,
          padding: "10px 24px",
          fontSize: 18,
          background: isSuccess ? "#389e0d" : "#cf1322",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: 500,
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
        onClick={() => navigate(paths.login)}
      >
        Trở về trang Đăng nhập
      </button>
    </div>
  );
}
