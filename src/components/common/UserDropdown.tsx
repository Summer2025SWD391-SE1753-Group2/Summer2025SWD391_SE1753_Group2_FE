import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

interface UserDropdownProps {
  avatarUrl: string;
  onLogout: () => void;
}

export default function UserDropdown({
  avatarUrl,
  onLogout,
}: UserDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <img
          src={avatarUrl}
          alt="avatar"
          className="w-10 h-10 rounded-full border-2 border-rose-300 cursor-pointer"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48 bg-white border-0">
        <DropdownMenuItem asChild>
          <Link to="/profile" className="w-full">
            Thông tin cá nhân
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="text-red-500" onClick={onLogout}>
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
