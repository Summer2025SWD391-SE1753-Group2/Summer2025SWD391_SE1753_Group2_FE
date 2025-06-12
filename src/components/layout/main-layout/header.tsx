import BrandLogo from '@/components/common/brand-logo';
import { EmptyState } from '@/components/common/empty_state';
import { ErrorMessage } from '@/components/common/error';
import { Loading } from '@/components/common/loading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useAuthStore } from '@/stores/auth';
import { paths } from '@/utils/constant/path';
import { ChevronDown, Clock, Home, LogOut, PlayCircle, User, UserCircle, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isServiceMenuOpen, setIsServiceMenuOpen] = useState(false);

  const navItems = [
    { icon: <Home className="h-5 w-5" />, to: '/', label: 'Home' },
    { icon: <Users className="h-5 w-5" />, to: '/friends', label: 'Friends' },
    { icon: <PlayCircle className="h-5 w-5" />, to: '/videos', label: 'Videos' },
    { icon: <UserCircle className="h-5 w-5" />, to: '/groups', label: 'Groups' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto flex h-16 items-center justify-between'>
        <Link to={paths.home}>
          <BrandLogo />
        </Link>

        <nav className='hidden md:flex items-center space-x-6'>
          <NavLink
            to={paths.home}
            className={({ isActive }) =>
              `text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            Trang chủ
          </NavLink>

          <div
            className='relative'
            onMouseEnter={() => setIsServiceMenuOpen(true)}
            onMouseLeave={() => setIsServiceMenuOpen(false)}
          >
            <button className='text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1'>
              Dịch vụ
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-300 ease-in-out ${isServiceMenuOpen ? 'rotate-180' : ''
                  }`}
              />
            </button>
            {isServiceMenuOpen && <div className='absolute top-full left-0 h-2 w-full'></div>}
            <div
              className={`absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-2 w-48 z-50 origin-top transition-all duration-300 ease-in-out ${isServiceMenuOpen
                ? 'opacity-100 scale-y-100 translate-y-0'
                : 'opacity-0 scale-y-0 -translate-y-2 pointer-events-none'
                }`}
            >

            </div>
          </div>

          <a href='#about' className='text-sm font-medium text-muted-foreground hover:text-primary'>
            Về chúng tôi
          </a>
          <a href='#' className='text-sm font-medium text-muted-foreground hover:text-primary'>
            Liên hệ
          </a>
        </nav>

        <div className='flex items-center space-x-4'>
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className='flex items-center gap-2 cursor-pointer'>

                  <Avatar>
                    <AvatarImage src={user?.avatar} alt={user?.full_name} />
                    <AvatarFallback>
                      {user?.full_name
                        ? user.full_name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .toUpperCase()
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className='hidden lg:block text-sm font-medium'>{user.full_name}</span>
                  <ChevronDown className='h-4 w-4' />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-56' align='end' forceMount>
                {(user?.role?.role_name === 'moderator' || user?.role?.role_name === 'admin') && (
                  <DropdownMenuItem className='flex items-center gap-2'>
                    <Link
                      to={paths[user.role.role_name as 'moderator' | 'admin']?.dashboard || '/moderator'}
                      className='flex items-center gap-2 w-full'
                    >
                      <User className='h-4 w-4' />
                      Hồ sơ
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className='flex flex-col items-start w-full'>
                  <Link to={paths.profile} className='flex items-center gap-2 w-full'>
                    <User className='h-4 w-4' />
                    Hồ sơ
                  </Link>
                </DropdownMenuItem>
                {/* <DropdownMenuItem className='flex flex-col items-start w-full'>
                  <Link to={paths.bookingHistory} className='flex items-center gap-2 w-full'>
                    <Clock className='h-4 w-4' />
                    lịch sử đặt lịch
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className='flex flex-col items-start w-full'>
                  <Link to={paths.result} className='flex items-center gap-2 w-full'>
                    <Clock className='h-4 w-4' />
                    xem kết quả
                  </Link>
                </DropdownMenuItem> */}
                <DropdownMenuItem onClick={handleLogout} className='text-red-600'>
                  <LogOut className='h-4 w-4' />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant='ghost' asChild>
                <Link to={paths.login}>Đăng nhập</Link>
              </Button>
              <Button asChild>
                <Link to={paths.register}>Đăng ký</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
