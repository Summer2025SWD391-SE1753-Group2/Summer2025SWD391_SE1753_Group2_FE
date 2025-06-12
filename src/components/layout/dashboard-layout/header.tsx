import { Bell, LogOut, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth';
import { Link, useNavigate } from 'react-router-dom';
import { paths } from '@/utils/constant/path';

const DashboardHeader = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(paths.login);
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className='sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30'>
      <div className='px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16 -mb-px'>
          {/* Left: Search */}
          <div className='flex lg:hidden'>
            <Button variant='ghost' size='icon' className='shrink-0'>
              <Search className='h-5 w-5' />
              <span className='sr-only'>Search</span>
            </Button>
          </div>
          <div className='hidden lg:flex lg:grow'>
            <div className='relative max-w-xs w-full'>
              <Input type='search' placeholder='Tìm kiếm...' className='pl-9' />
              <div className='absolute inset-y-0 left-0 flex items-center pl-3'>
                <Search className='h-4 w-4 text-gray-400' />
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className='flex items-center space-x-3'>
            <Button variant='ghost' size='icon' className='shrink-0'>
              <Bell className='h-5 w-5' />
              <span className='sr-only'>Notifications</span>
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='flex items-center gap-2' role='combobox'>
                  <Avatar>
                    <AvatarImage src={user?.avatar || ""} alt={user?.full_name || "User"} />
                    <AvatarFallback>{getInitials(user?.full_name)}</AvatarFallback>
                  </Avatar>
                  {user?.username && (
                    <span className='hidden lg:block text-sm font-medium'>{user.username}</span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-[200px]'>

                <DropdownMenuItem className='flex items-center gap-2'>
                  <Link to={paths.moderator.dashboard} className='flex items-center gap-2 w-full'>
                    <User className='h-4 w-4' />
                    Hồ sơ
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className='text-red-600 flex items-center gap-2'>
                  <LogOut className='h-4 w-4' />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
