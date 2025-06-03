import { Navigate } from "react-router-dom";
import { GuardProps } from "../types/router.types";
import { useAuth } from "@/hooks/useAuth";

export const RoleGuard = ({ children, roles }: GuardProps) => {
  const { user } = useAuth();

  if (!roles || !user) {
    return <>{children}</>;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
