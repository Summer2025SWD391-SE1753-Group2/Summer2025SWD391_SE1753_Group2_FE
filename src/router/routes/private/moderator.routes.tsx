import { RouteConfig } from "../../types/router.types";
import ModeratorLayout from "@/components/layout/moderator";
import ModeratorDashboard from "@/pages/auth/moderator/dashboard-mor/Dashboard";
import { AuthGuard } from "../../guards/AuthGuard";
import { RoleGuard } from "../../guards/RoleGuard";
import { PostApproval } from "@/pages/auth/moderator/post-management/PostApproval";
import { ReportHandling } from "@/pages/auth/moderator/report-management/ReportHandling";
import { GroupChatManagement } from "@/pages/chat/chat-with-group/GroupChatManagement";

export const moderatorRoutes: RouteConfig[] = [
  {
    path: "/moderator",
    element: (
      <AuthGuard>
        <RoleGuard allowedRoles={["moderator", "admin"]}>
          <ModeratorLayout />
        </RoleGuard>
      </AuthGuard>
    ),
    children: [{ index: true, element: <ModeratorDashboard /> }],
  },
  {
    path: "/moderator/posts",
    element: (
      <AuthGuard>
        <RoleGuard allowedRoles={["moderator", "admin"]}>
          <PostApproval />
        </RoleGuard>
      </AuthGuard>
    ),
  },
  {
    path: "/moderator/reports",
    element: (
      <AuthGuard>
        <RoleGuard allowedRoles={["moderator", "admin"]}>
          <ReportHandling />
        </RoleGuard>
      </AuthGuard>
    ),
  },
  {
    path: "/moderator/groups",
    element: (
      <AuthGuard>
        <RoleGuard allowedRoles={["moderator", "admin"]}>
          <GroupChatManagement />
        </RoleGuard>
      </AuthGuard>
    ),
  },
];
