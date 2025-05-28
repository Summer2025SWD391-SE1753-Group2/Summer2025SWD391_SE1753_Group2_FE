import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import UserDropdown from "./UserDropdown";

interface MainMenuProps {
  isLoggedIn: boolean;
  avatarUrl: string;
  onLogout: () => void;
}

export default function MainMenu({ isLoggedIn, avatarUrl, onLogout }: MainMenuProps) {
  return (
    <NavigationMenu>
      <NavigationMenuList className="space-x-3 items-center">
        {isLoggedIn ? (
          <>
            <NavigationMenuItem>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link to="/post">
                <Button className="bg-rose-500 text-white px-6 py-2 text-base rounded-2xl">
                  Đăng bài
                </Button>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <UserDropdown avatarUrl={avatarUrl} onLogout={onLogout} />
            </NavigationMenuItem>
          </>
        ) : (
          <>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Button className="bg-gray-300 px-6 py-2 text-base rounded-2xl">
                  <Link to="/login" className="hover:underline">
                    Đăng nhập
                  </Link>
                </Button>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Button className="bg-red-400 text-white px-6 py-2 text-base rounded-2xl">
                  <Link to="/register" className="hover:underline">
                    Đăng ký
                  </Link>
                </Button>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
