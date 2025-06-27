import { useState } from "react";
import {
  sendFriendRequest,
  getFriendshipStatus,
} from "@/services/friends/friendService";
import { getProfileByUsername } from "@/services/accounts/accountService";
import { UserProfile } from "@/types/account";
import { FriendshipStatus } from "@/types/friend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Search, UserPlus } from "lucide-react";

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

export function FindFriends() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<UserProfile | null>(null);
  const [searching, setSearching] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [friendshipStatus, setFriendshipStatus] =
    useState<FriendshipStatus | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Vui lòng nhập tên người dùng");
      return;
    }

    setSearching(true);
    try {
      const result = await getProfileByUsername(searchQuery.trim());
      setSearchResult(result);

      // Check friendship status
      const status = await getFriendshipStatus(result.account_id);
      setFriendshipStatus(status);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
      toast.error("Không tìm thấy người dùng");
      setSearchResult(null);
      setFriendshipStatus(null);
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async () => {
    if (!searchResult) return;

    setSendingRequest(true);
    try {
      await sendFriendRequest({ receiver_id: searchResult.account_id });
      toast.success(`Đã gửi lời mời kết bạn đến ${searchResult.full_name}`);
      // Update status after sending request
      const newStatus = await getFriendshipStatus(searchResult.account_id);
      setFriendshipStatus(newStatus);
    } catch (error) {
      console.error("Lỗi khi gửi lời mời:", error);
      toast.error("Không thể gửi lời mời kết bạn");
    } finally {
      setSendingRequest(false);
    }
  };

  const renderActionButton = () => {
    if (!searchResult || !friendshipStatus) return null;

    switch (friendshipStatus.status) {
      case "self":
        return (
          <Button disabled className="bg-gray-400">
            Bản thân
          </Button>
        );
      case "friends":
        return (
          <Button disabled className="bg-green-400">
            Đã là bạn bè
          </Button>
        );
      case "request_sent":
        return (
          <Button disabled className="bg-yellow-400">
            Đã gửi lời mời
          </Button>
        );
      case "request_received":
        return (
          <Button disabled className="bg-blue-400">
            Đã nhận lời mời
          </Button>
        );
      case "none":
      case "rejected":
        return (
          <Button
            onClick={handleSendRequest}
            disabled={sendingRequest}
            className="bg-green-500 hover:bg-green-600"
          >
            <UserPlus className="h-4 w-4 mr-1" />
            {sendingRequest ? "Đang gửi..." : "Thêm bạn"}
          </Button>
        );
      default:
        return null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Tìm kiếm bạn bè</h2>

      {/* Search Input */}
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Nhập tên người dùng (@username)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button
          onClick={handleSearch}
          disabled={searching || !searchQuery.trim()}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Search className="h-4 w-4 mr-1" />
          {searching ? "Đang tìm..." : "Tìm kiếm"}
        </Button>
      </div>

      {/* Search Result */}
      {searchResult && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={searchResult.avatar || "/default-profile-image.png"}
                alt={searchResult.full_name}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/default-profile-image.png";
                }}
              />
              <div>
                <h3 className="font-medium">{searchResult.full_name}</h3>
                <p className="text-sm text-gray-500">
                  @{searchResult.username}
                </p>
                <Badge
                  variant="outline"
                  className={cn(
                    "mt-1 text-xs",
                    getRoleStyle(searchResult.role.role_name)
                  )}
                >
                  {searchResult.role.role_name === "admin"
                    ? "Quản trị viên"
                    : searchResult.role.role_name === "moderator"
                    ? "Kiểm duyệt viên"
                    : "Thành viên"}
                </Badge>
              </div>
            </div>

            {renderActionButton()}
          </div>
        </Card>
      )}
    </div>
  );
}
