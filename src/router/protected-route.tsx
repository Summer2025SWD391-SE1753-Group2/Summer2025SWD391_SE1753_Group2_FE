import { useAuthStore } from "@/stores/auth";
import { getDefaultRouteByRole, paths } from "@/utils/constant/path";
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to={paths.login} replace />;
  }

if (allowedRoles && user?.role.role_name && !allowedRoles.includes(user.role.role_name)) {
  const fallback = getDefaultRouteByRole(user.role.role_name);
  return <Navigate to={fallback} replace />;
}


  return <>{children}</>;
};

export default ProtectedRoute;
