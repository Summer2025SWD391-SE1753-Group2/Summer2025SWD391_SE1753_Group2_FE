import { Navigate, useLocation } from "react-router-dom";
import { GuardProps } from "../types/router.types";
import { useAuthStore } from "@/store/auth/authStore";

export const AuthGuard = ({ children }: GuardProps) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
