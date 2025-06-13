import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";

import {
  ChevronDown,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  Users,
} from "lucide-react";
import BrandLogo from "@/components/common/brand-logo";
import { paths } from "@/utils/constant/path";
import { useState } from "react";
import { UserRole } from "@/types/user-role";

interface SidebarLink {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles: Array<UserRole>;
  children?: Array<SidebarLink>;
}

const sidebarLinks: SidebarLink[] = [
  {
    title: 'Trang chủ',
    href: paths.home,
    icon: <LayoutDashboard className='h-5 w-5' />,
    roles: ['moderator', 'admin'],
  },
  {
    title: "Tổng quan",
    href: paths.moderator.dashboard,
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ["moderator", "admin"],
  },
  {
    title: "Duyệt bài viết",
    href: paths.moderator.approvePost,
    icon: <FileText className="h-5 w-5" />,
    roles: ["moderator", "admin"],
  },
  {
    title: "Quản lý tổng",
    href: "#",
    icon: <Package className="h-5 w-5" />,
    roles: ["moderator", "admin"],
    children: [
      {
        title: "Quản lý thẻ",
        href: paths.moderator.tagManagement,
        icon: <Package className="h-5 w-5" />,
        roles: ["moderator", "admin"],
      },
      {
        title: "Quản lý nguyên liệu",
        href: paths.moderator.materialManagement,
        icon: <Package className="h-5 w-5" />,
        roles: ["moderator", "admin"],
      },
      {
        title: "Quản lý chủ đề",
        href: paths.moderator.topicManagement,
        icon: <Package className="h-5 w-5" />,
        roles: ["moderator", "admin"],
      },
    ],
  },
  {
    title: "Báo cáo",
    href: paths.admin.dashboard,
    icon: <FileText className="h-5 w-5" />,
    roles: ["admin"],
  },
  {
    title: "Người dùng",
    href: "/#",
    icon: <Users className="h-5 w-5" />,
    roles: ["admin"],
  },
  {
    title: "Cài đặt",
    href: "/#",
    icon: <Settings className="h-5 w-5" />,
    roles: ["admin"],
  },
];

const DashboardSidebar = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const role = user?.role?.role_name as UserRole | undefined;
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

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Sidebar header */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
        <Link to={paths.moderator.dashboard}>
          <BrandLogo />
        </Link>
      </div>

      {/* Sidebar content */}
      <div className="p-4">
        <nav className="space-y-1">
          {filteredLinks.map((link) => {
            const hasSubLinks = link.children && link.children.length > 0;
            const isActive = isLinkActive(link.href);
            const isExpandedLink = expanded[link.href];

            return (
              <div key={link.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between",
                    isActive && "bg-gray-100 dark:bg-gray-700"
                  )}
                  onClick={() => hasSubLinks && toggleExpand(link.href)}
                >
                  <Link
                    to={hasSubLinks ? "#" : link.href}
                    className="w-full flex justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {link.icon}
                      {link.title}
                    </div>
                    {hasSubLinks && (
                      <ChevronDown
                        className={cn(
                          "h-4 w-4",
                          isExpandedLink && "rotate-180"
                        )}
                      />
                    )}
                  </Link>
                </Button>

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
                        <Link
                          to={child.href}
                          className="flex items-center gap-2"
                        >
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
        </nav>
      </div>
    </div>
  );
};

export default DashboardSidebar;
