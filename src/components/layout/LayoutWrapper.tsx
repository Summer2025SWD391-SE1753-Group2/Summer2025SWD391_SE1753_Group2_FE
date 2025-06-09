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
      checkAuth().catch((err) => {
        console.error("Failed to check auth:", err);
      });
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

  if (!isAuthenticated || !user) {
    return (
      <GuestLayout>
        <Outlet />
      </GuestLayout>
    );
  }

  const roleName = user.role?.role_name;

  switch (roleName) {
    case "admin":
      return <AdminLayout />;
    case "moderator":
      return <ModeratorLayout />;
    case "user":
      return <UserLayout />;
    default:
      return <UserLayout />;
  }
}
