<<<<<<< Updated upstream
=======
import { Button } from "@/components/ui/button";
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
    <div className="shadow-gray-200 shadow-xs w-full py-6 px-4">
      <div className="mx-auto max-w-7xl flex items-center justify-between space-x-1">
        <Link to="/" className="hover:underline">
          <h2 className="font-bold text-xl text-rose-600">🍜 Food Forum</h2>
        </Link>

        <Input
          type="text"
          placeholder="Tìm kiếm..."
          className="flex items-center lg:mr-40 bg-gray-100 shadow-md shadow-gray-200 w-[250px] md:w-[400px] lg:w-[650px]  rounded-4xl border-0 hover:scale-x-105 transition-transform duration-200 "
        />

        <NavigationMenu >
          <NavigationMenuList className="space-x-3 ">
            {/* <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/tao" className="hover:underline">Tạo</Link>
                </NavigationMenuLink>
              </NavigationMenuItem> */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Button className="btn bg-rose-500 p-8 ">
                  <Link to="/login" className="hover:underline">Đăng nhập</Link>
                </Button>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Button className="btn bg-gray-300 text-xl px-6 ">
                  <Link to="/login" className="hover:underline">Đăng ký</Link>
                </Button>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>



      </div>
    </div>

>>>>>>> Stashed changes
  );
}
