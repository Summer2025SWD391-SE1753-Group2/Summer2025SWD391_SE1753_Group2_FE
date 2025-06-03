import { useEffect } from "react";
import { useAuthStore } from "@/store/auth/authStore";
import { Navigate, useLocation } from "react-router-dom";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: string;
  requirePhoneVerification?: boolean;
  fallbackPath?: string;
}

export function AuthGuard({
  children,
  requireAuth = true,
  requiredRole,
  requirePhoneVerification = false,
  fallbackPath = "/login",
}: AuthGuardProps) {
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // If authentication is not required, render children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // If user data is not available yet, show loading or redirect
  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // Check phone verification requirement
  if (requirePhoneVerification && !user.phone_verified) {
    return <Navigate to="/verify-phone" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
