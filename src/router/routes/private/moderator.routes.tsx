import { type RouteObject } from "react-router-dom";
import ModeratorLayout from "@/components/layout/moderator";
import ModeratorDashboard from "@/pages/auth/moderator/dashboard-mor/Dashboard";
import { AuthGuard } from "../../guards/AuthGuard";
import { RoleGuard } from "../../guards/RoleGuard";
import { PostApproval } from "@/pages/auth/moderator/post-management/PostApproval";
import { ReportHandling } from "@/pages/auth/moderator/report-management/ReportHandling";
import { GroupChatManagement } from "@/pages/chat/chat-with-group/GroupChatManagement";

export const moderatorRoutes: RouteObject[] = [
  {
    path: "/moderator",
    element: (
      <AuthGuard>
        <RoleGuard roles={["moderator", "admin"]}>
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
        <RoleGuard roles={["moderator", "admin"]}>
          <PostApproval />
        </RoleGuard>
      </AuthGuard>
    ),
  },
  {
    path: "/moderator/reports",
    element: (
      <AuthGuard>
        <RoleGuard roles={["moderator", "admin"]}>
          <ReportHandling />
        </RoleGuard>
      </AuthGuard>
    ),
  },
  {
    path: "/moderator/groups",
    element: (
      <AuthGuard>
        <RoleGuard roles={["moderator", "admin"]}>
          <GroupChatManagement />
        </RoleGuard>
      </AuthGuard>
    ),
  },
];
