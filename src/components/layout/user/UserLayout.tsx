import { Outlet } from "react-router-dom";
import { BaseLayout } from "../shared/BaseLayout";
import { Topbar } from "../shared/Topbar/Topbar";
import {
  Search,
  Home,
  Bookmark,
  MessageCircle,
  User,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NavLink, useNavigate } from "react-router-dom";

const sidebarItems = [
  {
    title: "Trang chủ",
    href: "/",
    icon: Home,
  },
  {
    title: "Yêu thích",
    href: "/favorites",
    icon: Bookmark,
  },
  {
    title: "Tin nhắn",
    href: "/messages",
    icon: MessageCircle,
  },
  {
    title: "Tài khoản",
    href: "/profile",
    icon: User,
  },
];

export default function UserLayout() {
  const navigate = useNavigate();

  return (
    <BaseLayout
      topbar={
        <Topbar>
          <div className="flex w-full items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm công thức nấu ăn..."
                className="pl-8"
              />
            </div>
            <Button
              onClick={() => navigate("/posts/create")}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Đăng bài
            </Button>
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
