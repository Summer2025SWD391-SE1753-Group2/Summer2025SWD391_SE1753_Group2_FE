// DashboardHeader.tsx
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth';

const DashboardHeader = () => {
  const { user } = useAuthStore();

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
          {/* Left side (empty or search later) */}
          <div></div>

          {/* Right side */}
          <div className='flex items-center space-x-3'>
            <Button variant='ghost' size='icon' className='shrink-0'>
              <Bell className='h-5 w-5' />
              <span className='sr-only'>Notifications</span>
            </Button>

            <Avatar>
              <AvatarImage src={user?.avatar || ""} alt={user?.full_name || "User"} />
              <AvatarFallback>{getInitials(user?.full_name)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
