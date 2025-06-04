import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth/authStore";
import { GuestLayout } from "./guest";
import { UserLayout } from "./user";
import ModeratorLayout from "./moderator";
import { AdminLayout } from "./admin";

export function LayoutWrapper() {
  const { isAuthenticated, user, checkAuth, isInitialized } = useAuthStore();

  useEffect(() => {
    // Check auth on mount only if not initialized
    if (!isInitialized) {
      checkAuth();
    }
  }, [checkAuth, isInitialized]);

  // Show loading while checking auth
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, use guest layout
  if (!isAuthenticated || !user) {
    return (
      <GuestLayout>
        <Outlet />
      </GuestLayout>
    );
  }

  // Choose layout based on user role
  const roleName = user.role?.role_name;

  switch (roleName) {
    case "admin":
      return <AdminLayout />;
    case "moderator":
      return <ModeratorLayout />;
    case "user_l1":
    case "user_l2":
    default:
      return <UserLayout />;
  }
}
