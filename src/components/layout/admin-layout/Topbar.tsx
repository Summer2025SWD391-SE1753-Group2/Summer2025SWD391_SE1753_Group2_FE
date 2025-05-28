import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserDropdown from '@/components/common/UserDropdown';

const user = {
  avatar: 'https://github.com/shadcn.png',
};

export default function Topbar() {
  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    // redirect
  };

  return (
    <div className="flex items-center justify-end p-3.5 bg-rose-600 bg-opacity-80 shadow-sm">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" className="text-white hover:bg-rose-700 ">
          <Bell className="h-5 w-5" />
        </Button>

        <UserDropdown avatarUrl={user.avatar} onLogout={handleLogout} />
      </div>
    </div>
  );
}
