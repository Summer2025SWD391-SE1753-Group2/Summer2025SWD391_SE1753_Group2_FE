import { useState, useRef } from "react";
import { useEffect } from "react";
import {
  sendFriendRequest,
  getFriendshipStatus,
} from "@/services/friends/friendService";
import { searchUsersByUsername } from "@/services/accounts/accountService";
import { UserProfile } from "@/types/account";
import { FriendshipStatus } from "@/types/friend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Search, UserPlus } from "lucide-react";
import axios from "axios";

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
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [skip, setSkip] = useState(0);
  const limit = 20;
  const [hasMore, setHasMore] = useState(true);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [searching, setSearching] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [friendshipStatuses, setFriendshipStatuses] = useState<
    Record<string, FriendshipStatus>
  >({});

  const fetchSearch = async (reset = false) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setFriendshipStatuses({});
      setHasMore(true);
      setSkip(0);
      return;
    }
    setSearching(true);
    try {
      const results = await searchUsersByUsername(
        searchQuery.trim(),
        reset ? 0 : skip,
        limit
      );
      let newResults = reset ? results : [...searchResults, ...results];
      // Xóa trùng account_id
      newResults = newResults.filter(
        (v, i, arr) => arr.findIndex((u) => u.account_id === v.account_id) === i
      );
      setSearchResults(newResults);
      setSkip(newResults.length);
      setHasMore(results.length === limit);
      // Lấy trạng thái bạn bè cho từng user mới
      const statuses: Record<string, FriendshipStatus> = {
        ...(reset ? {} : friendshipStatuses),
      };
      for (const user of results) {
        if (!statuses[user.account_id]) {
          try {
            statuses[user.account_id] = await getFriendshipStatus(
              user.account_id
            );
          } catch {
            statuses[user.account_id] = { status: "none" } as FriendshipStatus;
          }
        }
      }
      setFriendshipStatuses(statuses);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
      if (reset) {
        setSearchResults([]);
        setFriendshipStatuses({});
        setSkip(0);
        setHasMore(true);
      }
      toast.error("Không tìm thấy người dùng phù hợp");
    } finally {
      setSearching(false);
    }
  };

  // Realtime search with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSearch(true);
    }, 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Load more
  const handleLoadMore = () => {
    if (!hasMore || searching) return;
    fetchSearch(false);
  };

  const handleSendRequest = async (user: UserProfile) => {
    const status = friendshipStatuses[user.account_id]?.status;
    if (status === "request_sent") {
      toast.warning(
        "Bạn đã gửi lời mời kết bạn trước đó, vui lòng chờ xác nhận."
      );
      return;
    }
    if (status === "request_received") {
      toast.warning(
        "Người này đã gửi lời mời cho bạn, hãy kiểm tra mục lời mời kết bạn."
      );
      return;
    }
    if (status === "friends") {
      toast.warning("Bạn đã là bạn bè với người này.");
      return;
    }
    if (status === "self") {
      toast.warning("Không thể gửi lời mời kết bạn cho chính mình.");
      return;
    }
    setSendingRequest(true);
    try {
      const res = await sendFriendRequest({ receiver_id: user.account_id });
      if (res.status === "pending") {
        toast.success(`Đã gửi lời mời kết bạn đến ${user.full_name}`);
      } else {
        toast.error("Không thể gửi lời mời kết bạn");
      }
      // Luôn đồng bộ lại trạng thái từ BE
      const newStatus = await getFriendshipStatus(user.account_id);
      setFriendshipStatuses((prev) => ({
        ...prev,
        [user.account_id]: newStatus,
      }));
      setSearchResults((prev) => [...prev]);
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.data?.detail === "Friend request already exists"
      ) {
        toast.warning(
          "Bạn đã gửi lời mời kết bạn trước đó, vui lòng chờ xác nhận."
        );
        // Luôn đồng bộ lại trạng thái từ BE
        const newStatus = await getFriendshipStatus(user.account_id);
        setFriendshipStatuses((prev) => ({
          ...prev,
          [user.account_id]: newStatus,
        }));
        setSearchResults((prev) => [...prev]);
      } else {
        toast.error("Không thể gửi lời mời kết bạn");
      }
    } finally {
      setSendingRequest(false);
    }
  };

  const renderActionButton = (user: UserProfile) => {
    const status = friendshipStatuses[user.account_id];
    if (!status) return null;
    switch (status.status) {
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
            onClick={() => handleSendRequest(user)}
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Tìm kiếm bạn bè</h2>

      {/* Search Input */}
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Nhập tên hoặc username"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSkip(0);
            setHasMore(true);
          }}
          className="flex-1"
        />
        <Button disabled className="bg-blue-500 opacity-60 cursor-not-allowed">
          <Search className="h-4 w-4 mr-1" />
          Tìm kiếm
        </Button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-2">
          {searchResults.map((user) => (
            <Card className="p-4" key={user.account_id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={user.avatar || "/default-profile-image.png"}
                    alt={user.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/default-profile-image.png";
                    }}
                  />
                  <div>
                    <h3 className="font-medium">{user.full_name}</h3>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "mt-1 text-xs",
                        getRoleStyle(user.role.role_name)
                      )}
                    >
                      {user.role.role_name === "admin"
                        ? "Quản trị viên"
                        : user.role.role_name === "moderator"
                        ? "Kiểm duyệt viên"
                        : "Thành viên"}
                    </Badge>
                  </div>
                </div>
                {renderActionButton(user)}
              </div>
            </Card>
          ))}
          <div className="flex justify-center mt-2">
            {hasMore ? (
              <Button
                onClick={handleLoadMore}
                disabled={searching}
                className="bg-blue-100 text-blue-700 border border-blue-300"
              >
                {searching ? "Đang tải..." : "Xem thêm"}
              </Button>
            ) : (
              <span className="text-gray-400 text-sm py-2">
                Không còn kết quả
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
