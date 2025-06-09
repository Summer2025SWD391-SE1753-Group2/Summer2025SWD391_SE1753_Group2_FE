import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth/authStore";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireRole?: string;
}

export function AuthGuard({
  children,
  requireAuth = false,
  requireRole,
}: AuthGuardProps) {
  const { user, isAuthenticated } = useAuthStore();

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // If specific role is required
  if (requireRole && (!user || user.role?.role_name !== requireRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
