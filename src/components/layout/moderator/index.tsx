import { Outlet } from "react-router-dom";
import { BaseLayout } from "../shared/BaseLayout";
import { Topbar } from "../shared/Topbar/Topbar";
import { Search, Home, Flag, MessageCircle, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";

const sidebarItems = [
  {
    title: "Trang chủ",
    href: "/moderator",
    icon: Home,
  },
  {
    title: "Báo cáo",
    href: "/moderator/reports",
    icon: Flag,
  },
  {
    title: "Tin nhắn",
    href: "/moderator/messages",
    icon: MessageCircle,
  },
  {
    title: "Tài khoản",
    href: "/moderator/profile",
    icon: User,
  },
];

export default function ModeratorLayout() {
  return (
    <BaseLayout
      topbar={
        <Topbar>
          <div className="flex w-full items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Tìm kiếm báo cáo..." className="pl-8" />
            </div>
          </div>
        </Topbar>
      }
      sidebar={
        <nav className="grid gap-1 p-2">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-accent" : "transparent"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>
      }
    >
      <Outlet />
    </BaseLayout>
  );
}
