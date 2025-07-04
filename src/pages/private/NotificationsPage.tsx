import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

// Define notification type with user object and thumbnail object
interface Notification {
  id: string;
  user: {
    avatar?: string;
    full_name?: string;
    username?: string;
  };
  message: string;
  timestamp: string;
  thumbnail: {
    image: string;
  };
  unread?: boolean;
}

const NotificationsPage: React.FC = () => {
  // Hardcoded notifications for a culinary forum
  const importantNotifications: Notification[] = [
    {
      id: '1',
      user: { avatar: 'https://via.placeholder.com/50', full_name: 'Chef Linh', username: 'chef_linh' },
      message: 'New recipe posted: Pho Ga by Chef Linh',
      timestamp: '1 giờ trước',
      thumbnail: { image: 'https://i.ytimg.com/vi/ZNnDDeqtGFc/maxresdefault.jpg' }, // Warm yellow for soup
      unread: true,
    },
    {
      id: '2',
      user: { avatar: '', full_name: 'User123', username: 'user123' }, // Missing avatar
      message: 'Your dish "Banh Mi" received a comment from User123',
      timestamp: '2 giờ trước',
      thumbnail: { image: 'https://i.ytimg.com/vi/ZNnDDeqtGFc/maxresdefault.jpg' }, // Warm orange for bread
      unread: true,
    },
    {
      id: '3',
      user: { avatar: undefined, full_name: 'Moderator Admin', username: 'mod_admin' }, // Missing avatar
      message: 'Moderator approved your recipe: Bun Cha',
      timestamp: '19 giờ trước',
      thumbnail: { image: 'https://i.ytimg.com/vi/ZNnDDeqtGFc/maxresdefault.jpg' }, // Green for herbs
    },
  ];

  const otherNotifications: Notification[] = [
    {
      id: '4',
      user: { avatar: 'https://via.placeholder.com/50', full_name: 'Cooking Guru', username: 'cooking_guru' },
      message: 'New cooking tip shared: Knife Skills 101',
      timestamp: '30 phút trước',
      thumbnail: { image: 'https://i.ytimg.com/vi/ZNnDDeqtGFc/maxresdefault.jpg' }, // Gold for tools
    },
    {
      id: '5',
      user: { avatar: '', full_name: 'Event Host', username: 'event_host' }, // Missing avatar
      message: 'Community event: Virtual Cooking Class Tomorrow',
      timestamp: '1 giờ trước',
      thumbnail: { image: 'https://i.ytimg.com/vi/ZNnDDeqtGFc/maxresdefault.jpg' }, // Blue for event
    },
  ];

  return (
    <div className="bg-white text-gray-800 min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Thông báo</h1>

      {/* Quan trọng Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Quan trọng</h2>
        {importantNotifications.map((notification) => (
          <Card key={notification.id} className="mb-2 bg-white border-gray-200">
            <CardContent className="flex items-center p-3">
              <Avatar className="w-12 h-12 mr-3">
                <AvatarImage src={notification.user.avatar} alt={notification.user.full_name || notification.user.username || 'User'} />
                <AvatarFallback>
                  {notification.user.full_name && notification.user.full_name.trim() !== "string"
                    ? notification.user.full_name.split(" ").map((word) => word[0]).join("").toUpperCase()
                    : notification.user.username?.[0].toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm">{notification.message}</p>
                <p className="text-xs text-gray-500">{notification.timestamp}</p>
              </div>
              <div className="w-24 h-18 mr-3">
                <div
                  style={{
                    backgroundImage: `url(${notification.thumbnail.image})`,
                    backgroundSize: 'cover',
                    width: '100px',
                    height: '75px',
                    borderRadius: '0.5rem',
                  }}
                ></div>
              </div>
              {notification.unread && (
                <span className="w-2 h-2 bg-red-500 rounded-full ml-2"></span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Các thông báo khác Section */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Các thông báo khác</h2>
        {otherNotifications.map((notification) => (
          <Card key={notification.id} className="mb-2 bg-white border-gray-200">
            <CardContent className="flex items-center p-3">
              <Avatar className="w-12 h-12 mr-3">
                <AvatarImage src={notification.user.avatar} alt={notification.user.full_name || notification.user.username || 'User'} />
                <AvatarFallback>
                  {notification.user.full_name && notification.user.full_name.trim() !== "string"
                    ? notification.user.full_name.split(" ").map((word) => word[0]).join("").toUpperCase()
                    : notification.user.username?.[0].toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm">{notification.message}</p>
                <p className="text-xs text-gray-500">{notification.timestamp}</p>
              </div>
              <div className="w-24 h-18 mr-3">
                <div
                  style={{
                    backgroundImage: `url(${notification.thumbnail.image})`,
                    backgroundSize: 'cover',
                    width: '100px',
                    height: '75px',
                    borderRadius: '0.5rem',
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;