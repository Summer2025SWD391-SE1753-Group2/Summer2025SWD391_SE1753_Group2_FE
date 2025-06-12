import { useAuthStore } from '@/stores/auth';
import { getDefaultRouteByRole } from '@/utils/constant/path';
import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  const defaultRoute = getDefaultRouteByRole(user?.role.role_name||"user");
  if (isAuthenticated) {
    return <Navigate to={defaultRoute} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
