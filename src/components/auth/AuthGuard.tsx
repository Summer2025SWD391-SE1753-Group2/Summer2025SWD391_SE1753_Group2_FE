import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth/authStore";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireRole?: string;
  requirePhoneVerified?: boolean;
}

export function AuthGuard({
  children,
  requireAuth = false,
  requireRole,
  requirePhoneVerified = false,
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

  // If phone verification is required
  if (requirePhoneVerified && (!user || !user.phone_verified)) {
    return <Navigate to="/verify-phone" replace />;
  }

  return <>{children}</>;
}
