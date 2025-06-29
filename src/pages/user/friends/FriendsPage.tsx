import { useEffect, useState } from "react";
import { getFriendsList } from "@/services/friends/friendService";
import { FriendListItem } from "@/types/friend";
import { FriendCard } from "@/components/friends/FriendCard";

export function FriendsPage() {
  const [friends, setFriends] = useState<FriendListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const data = await getFriendsList();
        setFriends(data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách bạn bè:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const handleRemoveFriend = (friendId: string) => {
    setFriends((prev) =>
      prev.filter((friend) => friend.account_id !== friendId)
    );
  };

  if (loading) {
    return <div className="p-6 text-center">Đang tải danh sách bạn bè...</div>;
  }

  if (friends.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        Bạn chưa có bạn bè nào
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        Danh sách bạn bè ({friends.length})
      </h2>
      <div className="space-y-4">
        {friends.map((friend) => (
          <FriendCard
            key={friend.account_id}
            friend={friend}
            onRemove={handleRemoveFriend}
          />
        ))}
      </div>
    </div>
  );
}
