import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="w-full shadow-amber-500 shadow-2xs p-4">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <h2 className="font-bold text-xl">🍜 Food Forum</h2>
       
          <div className="flex items-center gap-0 space-x-3">
            <Input
              type="text"
              placeholder="Tìm kiếm..."
              className=" w-[200px] md:w-[250px] lg:w-[300px] rounded-4xl border-0"
            />
            
              <NavigationMenu >
                <NavigationMenuList className="space-x-3">
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link to="/" className="hover:underline">Trang chủ</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link to="/gioi-thieu" className="hover:underline">Giới thiệu</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link to="/doanh-nghiep" className="hover:underline">Doanh nghiệp</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link to="/tao" className="hover:underline">Tạo</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link to="/login" className="hover:underline">Đăng nhập</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

            

        </div>
      </div>
    </div>
  );
}
