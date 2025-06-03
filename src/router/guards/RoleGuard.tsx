import { Navigate } from "react-router-dom";
import { GuardProps } from "../types/router.types";
import { useAuthStore } from "@/store/auth/authStore";

interface RoleGuardProps extends GuardProps {
  allowedRoles: string[];
}

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
