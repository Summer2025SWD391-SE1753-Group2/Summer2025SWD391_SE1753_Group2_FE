import { Navigate, useLocation } from "react-router-dom";
import { GuardProps } from "../types/router.types";
import { useAuth } from "@/hooks/useAuth";

export const AuthGuard = ({ children }: GuardProps) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
