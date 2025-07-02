import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { removeFriend } from "@/services/friends/friendService";
import { FriendListItem } from "@/types/friend";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UserMinus, MessageCircle } from "lucide-react";

interface FriendCardProps {
  friend: FriendListItem;
  onRemove: (friendId: string) => void;
}

const getRoleStyle = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-red-100 text-red-700";
    case "moderator":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-green-100 text-green-700";
  }
};

export function FriendCard({ friend, onRemove }: FriendCardProps) {
  const [removing, setRemoving] = useState(false);
  const navigate = useNavigate();

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await removeFriend(friend.account_id);
      toast.success(`Đã xóa ${friend.full_name} khỏi danh sách bạn bè`);
      onRemove(friend.account_id);
    } catch (error) {
      console.error("Lỗi khi xóa bạn bè:", error);
      toast.error("Không thể xóa bạn bè");
    } finally {
      setRemoving(false);
    }
  };

  const handleChat = () => {
    navigate(`/user/chat/${friend.account_id}`);
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src={friend.avatar || "/default-profile-image.png"}
            alt={friend.full_name}
            className="w-12 h-12 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/default-profile-image.png";
            }}
          />
          <div className="flex-1">
            <h3 className="font-medium">{friend.full_name}</h3>
            <p className="text-sm text-gray-500">@{friend.username}</p>
            <Badge
              variant="outline"
              className={cn(
                "mt-1 text-xs",
                getRoleStyle(friend.role.role_name)
              )}
            >
              {friend.role.role_name === "admin"
                ? "Quản trị viên"
                : friend.role.role_name === "moderator"
                ? "Kiểm duyệt viên"
                : "Thành viên"}
            </Badge>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={handleChat}
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Chat
          </Button>
          <Button
            onClick={handleRemove}
            disabled={removing}
            variant="outline"
            size="sm"
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <UserMinus className="h-4 w-4 mr-1" />
            {removing ? "Đang xóa..." : "Xóa bạn"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
