import { Navigate } from "react-router-dom";
import { GuardProps } from "../types/router.types";
import { useAuthStore } from "@/store/auth/authStore";

export const PhoneVerifiedGuard = ({ children }: GuardProps) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user?.phone_verified) {
    return <Navigate to="/verify-phone" replace />;
  }

  return <>{children}</>;
};
