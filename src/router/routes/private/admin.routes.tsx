import { type RouteObject } from "react-router-dom";
import AdminLayout from "@/components/layout/admin-layout";
import AdminDashboard from "@/pages/auth/admin/dashboard/Dashboard";
import { AuthGuard } from "../../guards/AuthGuard";
import { RoleGuard } from "../../guards/RoleGuard";
import { UserManagement } from "@/pages/auth/admin/user-management/UserManagement";
import { PostManagement } from "@/pages/auth/admin/post-management/PostManagement";
import { ReportManagement } from "@/pages/auth/admin/report-management/ReportManagement";

export const adminRoutes: RouteObject[] = [
  {
    path: "/admin",
    element: (
      <AuthGuard>
        <RoleGuard roles={["admin"]}>
          <AdminLayout />
        </RoleGuard>
      </AuthGuard>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      {
        path: "users",
        element: (
          <AuthGuard>
            <RoleGuard roles={["admin"]}>
              <UserManagement />
            </RoleGuard>
          </AuthGuard>
        ),
      },
      {
        path: "posts",
        element: (
          <AuthGuard>
            <RoleGuard roles={["admin"]}>
              <PostManagement />
            </RoleGuard>
          </AuthGuard>
        ),
      },
      {
        path: "reports",
        element: (
          <AuthGuard>
            <RoleGuard roles={["admin"]}>
              <ReportManagement />
            </RoleGuard>
          </AuthGuard>
        ),
      },
    ],
  },
];
