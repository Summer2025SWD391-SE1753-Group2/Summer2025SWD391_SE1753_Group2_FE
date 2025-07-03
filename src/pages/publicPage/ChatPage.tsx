import { useState, useEffect } from "react";
import Chatbox from "@/components/chat/chatbox";
import { useAuthStore } from "@/stores/auth";
import { authService } from "@/services/auth/authService";
import { getFriendsList } from "@/services/friends/friendService";
import type { FriendListItem } from "@/types/friend";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "@/lib/api/axios";
import type { GroupChat } from "@/types/group-chat";

const ChatPage = () => {
  const { user } = useAuthStore();
  const token = authService.getToken();
  const [friends, setFriends] = useState<FriendListItem[]>([]);
  const navigate = useNavigate();
  const { friendId } = useParams();
  const [selectedFriend, setSelectedFriend] = useState<FriendListItem | null>(
    null
  );
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);

  useEffect(() => {
    if (token) {
      getFriendsList().then(setFriends);
      axiosInstance
        .get("/api/v1/group-chat/my-groups")
        .then((res) => setGroupChats(res.data));
    }
  }, [token]);

  // Khi friendId trên URL thay đổi, tự động chọn bạn đó
  useEffect(() => {
    if (friendId && friends.length > 0) {
      const found = friends.find((f) => f.account_id === friendId);
      setSelectedFriend(found || null);
    }
  }, [friendId, friends]);

  if (!user || !token) return <div>Vui lòng đăng nhập</div>;

  // Khi chọn bạn, cập nhật URL
  const handleSelectFriend = (friend: FriendListItem) => {
    setSelectedFriend(friend);
    navigate(`/user/chat/${friend.account_id}`);
  };

  return (
    <div className="flex h-[90vh]">
      {/* Danh sách bạn bè + group chat */}
      <div className="w-64 border-r p-4 bg-white overflow-y-auto">
        <h2 className="font-bold mb-4">Bạn bè</h2>
        {friends.length === 0 && <div>Không có bạn bè nào</div>}
        <ul>
          {friends.map((friend) => (
            <li
              key={friend.account_id}
              className={`p-2 rounded cursor-pointer hover:bg-blue-50 ${
                selectedFriend?.account_id === friend.account_id
                  ? "bg-blue-100"
                  : ""
              }`}
              onClick={() => handleSelectFriend(friend)}
            >
              <div className="flex items-center gap-2">
                <img
                  src={friend.avatar || "/default-profile-image.png"}
                  alt={friend.full_name}
                  className="w-8 h-8 rounded-full"
                />
                <span>{friend.full_name}</span>
              </div>
            </li>
          ))}
        </ul>
        {/* Group Chat section */}
        <h2 className="font-bold mt-6 mb-4">Group Chat</h2>
        {groupChats.length === 0 && <div>Không có group chat nào</div>}
        <ul>
          {groupChats.map((group) => (
            <li
              key={group.group_id}
              className="p-2 rounded cursor-pointer hover:bg-green-50"
              onClick={() => alert(`Vào group chat: ${group.group_name}`)}
            >
              <div className="flex flex-col">
                <span className="font-semibold">{group.group_name}</span>
                <span className="text-xs text-gray-500">
                  {group.topic_name} • {group.member_count} thành viên
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* Khung chat */}
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        {selectedFriend ? (
          <Chatbox currentUser={user} friend={selectedFriend} token={token} />
        ) : (
          <div className="text-gray-400">Chọn một bạn để bắt đầu chat</div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
