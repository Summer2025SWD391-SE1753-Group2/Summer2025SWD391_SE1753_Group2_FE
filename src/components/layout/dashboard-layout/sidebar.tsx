import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";

import {
  ChevronDown,
  LayoutDashboard,
  Package,
  Settings,
  Users,
  PlusCircle,
  Edit3,
  Bookmark,
  ListCheck,
  Home,
  Tag,
  Weight,
  Ham,
  Package2,
  LogOut,
  UserCheck2,
  MessageCircle,
  UserPlus,
  Bell,
} from "lucide-react";
import BrandLogo from "@/components/common/brand-logo";
import { paths } from "@/utils/constant/path";
import { useState } from "react";
import { UserRole } from "@/types/user-role";
import { useRoleStore } from "@/stores/roleStore";

interface SidebarLink {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles: Array<UserRole>;
  children?: Array<SidebarLink>;
}

const sidebarLinks: SidebarLink[] = [
  //user
  {
    title: "Quản lý bài viết",
    href: paths.user.dashboard,
    icon: <Edit3 className="h-5 w-5" />,
    roles: ["user"],
  },
  {
    title: "Thêm bài viết",
    href: paths.user.createPost,
    icon: <PlusCircle className="h-5 w-5" />,
    roles: ["user"],
  },
  {
    title: "Bài viết yêu thích",
    href: paths.user.favorites,
    icon: <Bookmark className="h-5 w-5" />,
    roles: ["user"],
  },
  {
    title: "Bạn bè",
    href: paths.user.friends,
    icon: <UserPlus className="h-5 w-5" />,
    roles: ["user"],
  },
  {
    title: "Thông báo",
    href: paths.user.notifications,
    icon: <Bell className="h-5 w-5" />,
    roles: ["user"],
  },
  // Moderator
  {
    title: "Duyệt bài viết",
    href: paths.moderator.approvePost,
    icon: <ListCheck className="h-5 w-5" />,
    roles: ["moderator"],
  },
  {
    title: "Quản lý tổng",
    href: "#",
    icon: <Package className="h-5 w-5" />,
    roles: ["moderator"],
    children: [
      {
        title: "Quản lý thẻ",
        href: paths.moderator.tagManagement,
        icon: <Tag className="h-5 w-5" />,
        roles: ["moderator"],
      },
      {
        title: "Quản lý chủ đề",
        href: paths.moderator.topicManagement,
        icon: <Package2 className="h-5 w-5" />,
        roles: ["moderator"],
      },
      {
        title: "Quản lý nguyên liệu",
        href: paths.moderator.materialManagement,
        icon: <Ham className="h-5 w-5" />,
        roles: ["moderator"],
      },
      {
        title: "Quản lý định lượng",
        href: paths.moderator.unitManagement,
        icon: <Weight className="h-5 w-5" />,
        roles: ["moderator"],
      },
      {
        title: "Quản lý Group Chat",
        href: paths.moderator.groupChatManagement,
        icon: <MessageCircle className="h-5 w-5" />,
        roles: ["moderator"],
      },
    ],
  },
  {
    title: "Thông báo",
    href: paths.moderator.notifications,
    icon: <Bell className="h-5 w-5" />,
    roles: ["moderator"],
  },
  //Admin
  {
    title: "Tổng quan",
    href: paths.admin.dashboard,
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ["admin"],
  },
  {
    title: "Duyệt bài viết",
    href: paths.admin.approvePost,
    icon: <Tag className="h-5 w-5" />,
    roles: ["admin"],
  },
  {
    title: "Quản lý tổng",
    href: "#",
    icon: <Package className="h-5 w-5" />,
    roles: ["admin"],
    children: [
      {
        title: "Quản lý thẻ",
        href: paths.admin.tagManagement,
        icon: <Package className="h-5 w-5" />,
        roles: ["admin"],
      },
      {
        title: "Quản lý chủ đề",
        href: paths.admin.topicManagement,
        icon: <Package2 className="h-5 w-5" />,
        roles: ["admin"],
      },
      {
        title: "Quản lý nguyên liệu",
        href: paths.admin.materialManagement,
        icon: <Ham className="h-5 w-5" />,
        roles: ["admin"],
      },
      {
        title: "Quản lý định lượng",
        href: paths.admin.unitManagement,
        icon: <Weight className="h-5 w-5" />,
        roles: ["admin"],
      },
      {
        title: "Quản lý Group Chat",
        href: paths.admin.groupChatManagement,
        icon: <MessageCircle className="h-5 w-5" />,
        roles: ["admin"],
      },
    ],
  },
  {
    title: "Phân quyền",
    href: paths.admin.userManagement,
    icon: <UserCheck2 className="h-5 w-5" />,
    roles: ["admin"],
  },
  //moderator
  {
    title: "Bạn bè",
    href: "/moderator/friends",
    icon: <UserPlus className="h-5 w-5" />,
    roles: ["moderator"],
  },
  {
    title: "Chat",
    href: paths.chat,
    icon: <MessageCircle className="h-5 w-5" />,
    roles: ["user", "moderator", "admin"],
  },
];

// bottom
const bottomLinks: SidebarLink[] = [
  {
    title: "Trang chủ",
    href: paths.home,
    icon: <Home className="h-5 w-5" />,
    roles: ["user", "moderator", "admin"],
  },
  {
    title: "Người dùng",
    href: paths.profile,
    icon: <Users className="h-5 w-5" />,
    roles: ["user", "moderator", "admin"],
  },
  {
    title: "Cài đặt",
    href: paths.setting,
    icon: <Settings className="h-5 w-5" />,
    roles: ["user", "moderator", "admin"],
  },
];


const DashboardSidebar = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const { tempRole } = useRoleStore();
  const role = tempRole as UserRole | undefined;

  const filteredLinks = sidebarLinks.filter(
    (link) => role && link.roles.includes(role)
  );

  const isLinkActive = (href: string) => {
    if (location.pathname === href) return true;
    return (
      location.pathname.startsWith(href + "/") &&
      href !== paths.moderator.dashboard.replace(/\/$/, "")
    );
  };

  const toggleExpand = (href: string) => {
    setExpanded((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(paths.login);
  };

  return (
    <div className="w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">

      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <Link to={paths.home}>
          <BrandLogo />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {filteredLinks.map((link) => {
          const hasSubLinks = link.children && link.children.length > 0;
          const isActive = isLinkActive(link.href);
          const isExpandedLink = expanded[link.href];

          return (
            <div key={link.href}>
              {hasSubLinks ? (
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between",
                    isActive && "bg-gray-100 dark:bg-gray-700"
                  )}
                  onClick={() => toggleExpand(link.href)}
                >
                  <div className="flex items-center gap-2">
                    {link.icon}
                    {link.title}
                  </div>
                  <ChevronDown
                    className={cn("h-4 w-4", isExpandedLink && "rotate-180")}
                  />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  asChild
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-gray-100 dark:bg-gray-700"
                  )}
                >
                  <Link to={link.href} className="flex items-center gap-2">
                    {link.icon}
                    {link.title}
                  </Link>
                </Button>
              )}

              {hasSubLinks && isExpandedLink && (
                <div className="ml-6 space-y-1 mt-1">
                  {link.children?.map((child) => (
                    <Button
                      key={child.href}
                      variant="ghost"
                      asChild
                      className={cn(
                        "w-full justify-start",
                        isLinkActive(child.href) &&
                        "bg-gray-100 dark:bg-gray-700"
                      )}
                    >
                      <Link to={child.href} className="flex items-center gap-2">
                        {child.icon}
                        {child.title}
                      </Link>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-1 flex-shrink-0">
        {bottomLinks
          .filter((link) => role && link.roles.includes(role))
          .map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              asChild
              className={cn(
                "w-full justify-start",
                isLinkActive(link.href) && "bg-gray-100 dark:bg-gray-700"
              )}
            >
              <Link to={link.href} className="flex items-center gap-2">
                {link.icon}
                {link.title}
              </Link>
            </Button>
          ))}
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600"
          onClick={handleLogout}
        >
          <div className="flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            Đăng xuất
          </div>
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
