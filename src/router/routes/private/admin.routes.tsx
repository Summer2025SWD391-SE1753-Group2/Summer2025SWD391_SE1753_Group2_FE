import { RouteConfig } from "../../types/router.types";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import AdminDashboard from "@/pages/auth/admin/dashboard/Dashboard";
import { AuthGuard } from "../../guards/AuthGuard";
import { RoleGuard } from "../../guards/RoleGuard";
import { UserManagement } from "@/pages/auth/admin/user-management/UserManagement";
import { PostManagement } from "@/pages/auth/admin/post-management/PostManagement";
import { ReportManagement } from "@/pages/auth/admin/report-management/ReportManagement";

export const adminRoutes: RouteConfig[] = [
  {
    path: "/admin",
    element: (
      <AuthGuard>
        <RoleGuard allowedRoles={["admin"]}>
          <AdminLayout />
        </RoleGuard>
      </AuthGuard>
    ),
    children: [{ index: true, element: <AdminDashboard /> }],
  },
  {
    path: "/admin/users",
    element: (
      <AuthGuard>
        <RoleGuard allowedRoles={["admin"]}>
          <UserManagement />
        </RoleGuard>
      </AuthGuard>
    ),
  },
  {
    path: "/admin/posts",
    element: (
      <AuthGuard>
        <RoleGuard allowedRoles={["admin"]}>
          <PostManagement />
        </RoleGuard>
      </AuthGuard>
    ),
  },
  {
    path: "/admin/reports",
    element: (
      <AuthGuard>
        <RoleGuard allowedRoles={["admin"]}>
          <ReportManagement />
        </RoleGuard>
      </AuthGuard>
    ),
  },
];
