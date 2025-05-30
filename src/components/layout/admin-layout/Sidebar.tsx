import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, User, Settings, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const navItems = [
  { label: 'Dashboard', icon: Home, href: '/' },
  { label: 'Profile', icon: User, href: '/profile' },
  { label: 'Settings', icon: Settings, href: '/settings' },
  { label: 'Logout', icon: LogOut, href: '/logout' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={
        'h-screen  bg-background transition-all duration-300 flex flex-col ' +
        (collapsed ? 'w-16' : 'w-64')
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4  bg-rose-600 bg-opacity-80">
       
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {navItems.map(({ label, icon: Icon, href }) => (
            <NavLink
              key={label}
              to={href}
              className={({ isActive }) =>
                (isActive
                  ? 'bg-primary text-primary-foreground '
                  : 'hover:bg-accent hover:text-accent-foreground ') +
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors'
              }
            >
              <Icon className="h-5 w-5" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}
