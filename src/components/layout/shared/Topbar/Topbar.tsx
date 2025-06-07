import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/store/layout/layoutStore";
import { useAuthStore } from "@/store/auth/authStore";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/UserMenu";
import { Link } from "react-router-dom";
import { Menu, LogIn, UserPlus } from "lucide-react";

interface TopbarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function Topbar({ className, children, ...props }: TopbarProps) {
  const { toggleMobileMenu } = useLayoutStore();
  const { user, isAuthenticated } = useAuthStore();

  return (
    <div
      className={cn(
        "sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4",
        className
      )}
      {...props}
    >
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={toggleMobileMenu}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Logo/Brand */}
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          🍲 Food Forum
        </Link>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Custom children content */}
      {children}

      {/* Auth Section */}
      <div className="flex items-center gap-2">
        {isAuthenticated && user ? (
          <UserMenu />
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth/login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Đăng nhập</span>
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth/register" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Đăng ký</span>
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
