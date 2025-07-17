import { useState, useEffect } from "react";
import Chatbox from "@/components/chat/chatbox";
import { useAuthStore } from "@/stores/auth";
import { authService } from "@/services/auth/authService";
import { getFriendsList } from "@/services/friends/friendService";
import type { FriendListItem } from "@/types/friend";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "@/lib/api/axios";
import type { GroupChat } from "@/types/group-chat";
import GroupChatContainer from "@/components/chat/GroupChatContainer";
import GroupChatSearch from "@/components/chat/GroupChatSearch";

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
  const [selectedGroup, setSelectedGroup] = useState<GroupChat | null>(null);

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
    setSelectedGroup(null);
    navigate(`/user/chat/${friend.account_id}`);
  };

  const handleSelectGroup = (group: GroupChat) => {
    setSelectedGroup(group);
    setSelectedFriend(null);
  };

  return (
    <div className="flex h-[90vh] w-full max-w-none bg-gradient-to-br from-blue-50 to-white">
      {/* Sidebar */}
      <div className="hidden sm:block w-96 border-r p-6 bg-gradient-to-b from-white to-blue-50 shadow-lg overflow-y-auto sm:relative sm:z-10 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 h-full">
        <h2 className="font-bold mb-4 text-xl text-blue-700">Bạn bè</h2>
        {friends.length === 0 && (
          <div className="text-gray-400">Không có bạn bè nào</div>
        )}
        <ul>
          {friends.map((friend) => (
            <li
              key={friend.account_id}
              className={`flex items-center gap-3 p-2 mb-2 rounded-lg cursor-pointer hover:bg-blue-100 hover:scale-105 transition-transform duration-150 ${
                selectedFriend?.account_id === friend.account_id
                  ? "bg-blue-200"
                  : ""
              }`}
              onClick={() => handleSelectFriend(friend)}
            >
              <img
                src={friend.avatar || "/default-profile-image.png"}
                alt={friend.full_name}
                className={`w-10 h-10 rounded-full object-cover border-2 ${
                  selectedFriend?.account_id === friend.account_id
                    ? "ring-2 ring-blue-400"
                    : "ring-1 ring-gray-200"
                }`}
              />
              <span className="font-medium text-gray-700">
                {friend.full_name}
              </span>
            </li>
          ))}
        </ul>
        {/* Group Chat section */}
        <h2 className="font-bold mt-8 mb-4 text-xl text-blue-700">
          Group Chat
        </h2>
        {groupChats.length === 0 && (
          <div className="text-gray-400">Không có group chat nào</div>
        )}
        <ul>
          {groupChats.map((group) => (
            <li
              key={group.group_id}
              className={`p-2 mb-2 rounded-lg cursor-pointer hover:bg-blue-100 hover:scale-105 transition-transform duration-150 ${
                selectedGroup?.group_id === group.group_id ? "bg-blue-200" : ""
              }`}
              onClick={() => handleSelectGroup(group)}
            >
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800">
                  {group.group_name}
                </span>
                <span className="text-xs text-gray-500">
                  {group.topic_name} • {group.member_count} thành viên
                </span>
              </div>
            </li>
          ))}
        </ul>
        {/* Search Group Chat dưới danh sách group chat */}
        <div className="mt-6">
          <GroupChatSearch token={token} />
        </div>
      </div>
      {/* Khung chat */}
      <div className="flex-1 flex items-center justify-center bg-white min-w-0 shadow-xl p-6 h-full">
        {selectedFriend ? (
          <Chatbox currentUser={user} friend={selectedFriend} token={token} />
        ) : selectedGroup ? (
          <GroupChatContainer
            groupId={selectedGroup.group_id}
            token={token}
            currentUserId={user.account_id}
            groupName={selectedGroup.group_name}
            groupDescription={selectedGroup.group_description}
          />
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <svg width="64" height="64" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 22c5.523 0 10-4.03 10-9s-4.477-9-10-9S2 3.03 2 8s4.477 9 10 9z"
                fill="#e0e7ef"
              />
              <path
                d="M8 10h8M8 14h4"
                stroke="#a0aec0"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="mt-2">
              Chọn một bạn hoặc group để bắt đầu chat
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
