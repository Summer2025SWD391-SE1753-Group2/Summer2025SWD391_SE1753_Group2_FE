import { useState, useEffect } from "react";
import Chatbox from "@/components/chat/chatbox";
import { useAuthStore } from "@/stores/auth";
import { authService } from "@/services/auth/authService";
import { getFriendsList } from "@/services/friends/friendService";
import type { FriendListItem } from "@/types/friend";
import { useNavigate, useParams } from "react-router-dom";
import { getMyGroupChats } from "@/services/groupChat/groupChatService";
import type { GroupChat } from "@/types/group-chat";
import GroupChatContainer from "@/components/chat/GroupChatContainer";
import GroupChatSearch from "@/components/chat/GroupChatSearch";
import { Badge } from "@/components/ui/badge";
import { Users, MessageCircle, Crown, Shield } from "lucide-react";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      Promise.all([getFriendsList(), getMyGroupChats(token)])
        .then(([friendsData, groupsData]) => {
          setFriends(friendsData);
          setGroupChats(groupsData);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
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

  const handleLeaveGroup = () => {
    // Refresh group list when user leaves a group
    if (token) {
      getMyGroupChats(token).then(setGroupChats);
    }
    setSelectedGroup(null);
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "leader":
        return <Crown className="w-3 h-3 text-yellow-500" />;
      case "moderator":
        return <Shield className="w-3 h-3 text-blue-500" />;
      default:
        return <Users className="w-3 h-3 text-gray-500" />;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="default"
            className="text-xs bg-green-100 text-green-700"
          >
            Hoạt động
          </Badge>
        );
      case "inactive":
        return (
          <Badge
            variant="secondary"
            className="text-xs bg-yellow-100 text-yellow-700"
          >
            Tạm ngưng
          </Badge>
        );
      case "left":
        return (
          <Badge
            variant="secondary"
            className="text-xs bg-gray-100 text-gray-700"
          >
            Đã rời
          </Badge>
        );
      case "removed":
        return (
          <Badge
            variant="secondary"
            className="text-xs bg-orange-100 text-orange-700"
          >
            Bị xóa
          </Badge>
        );
      case "banned":
        return (
          <Badge
            variant="destructive"
            className="text-xs bg-red-100 text-red-700"
          >
            Bị cấm
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-[90vh] w-full max-w-none bg-gradient-to-br from-blue-50 to-white">
      {/* Sidebar */}
      <div className="hidden sm:block w-96 border-r p-6 bg-gradient-to-b from-white to-blue-50 shadow-lg overflow-y-auto sm:relative sm:z-10 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 h-full">
        {/* Friends Section */}
        <div className="mb-8">
          <h2 className="font-bold mb-4 text-xl text-blue-700 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Bạn bè ({friends.length})
          </h2>
          {loading ? (
            <div className="text-gray-400">Đang tải...</div>
          ) : friends.length === 0 ? (
            <div className="text-gray-400">Không có bạn bè nào</div>
          ) : (
            <ul className="space-y-2">
              {friends.map((friend) => (
                <li
                  key={friend.account_id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-blue-100 hover:scale-105 transition-all duration-150 ${
                    selectedFriend?.account_id === friend.account_id
                      ? "bg-blue-200 shadow-md"
                      : "hover:shadow-sm"
                  }`}
                  onClick={() => handleSelectFriend(friend)}
                >
                  <div className="relative">
                    <img
                      src={friend.avatar || "/default-profile-image.png"}
                      alt={friend.full_name}
                      className={`w-10 h-10 rounded-full object-cover border-2 transition-all ${
                        selectedFriend?.account_id === friend.account_id
                          ? "ring-2 ring-blue-400 border-blue-400"
                          : "border-gray-200"
                      }`}
                    />
                    {/* Online indicator - placeholder */}
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-800 truncate block">
                      {friend.full_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      @{friend.username}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Group Chat Section */}
        <div className="mb-8">
          <h2 className="font-bold mb-4 text-xl text-blue-700 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Group Chat ({groupChats.length})
          </h2>
          {loading ? (
            <div className="text-gray-400">Đang tải...</div>
          ) : groupChats.length === 0 ? (
            <div className="text-gray-400 text-center py-4">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <div>Không có group chat nào</div>
              <div className="text-xs mt-1">Tham gia group bên dưới</div>
            </div>
          ) : (
            <ul className="space-y-2">
              {groupChats.map((group) => (
                <li
                  key={group.group_id}
                  className={`p-3 rounded-lg cursor-pointer hover:bg-blue-100 hover:scale-105 transition-all duration-150 border ${
                    selectedGroup?.group_id === group.group_id
                      ? "bg-blue-200 border-blue-300 shadow-md"
                      : "border-gray-100 hover:border-blue-200 hover:shadow-sm"
                  } ${!group.is_active ? "opacity-60" : ""}`}
                  onClick={() => handleSelectGroup(group)}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800 truncate">
                        {group.group_name}
                      </span>
                      <div className="flex items-center gap-1">
                        {getRoleIcon(group.my_role)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-600 font-medium truncate">
                        {group.topic_name}
                      </span>
                      <span className="text-gray-500 whitespace-nowrap ml-2">
                        {group.member_count} thành viên
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {getStatusBadge(group.my_status)}
                        {!group.is_active && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-gray-200 text-gray-600"
                          >
                            Không hoạt động
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(group.joined_at).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Search Group Chat Section */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-lg text-blue-700 mb-4">
            Tìm Group Chat
          </h3>
          <GroupChatSearch token={token} />
        </div>
      </div>

      {/* Main Chat Area */}
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
            onLeaveGroup={handleLeaveGroup}
          />
        ) : (
          <div className="flex flex-col items-center text-gray-400 max-w-md text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-blue-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-green-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Chào mừng đến với Chat
            </h3>
            <p className="text-gray-500 mb-4">
              Chọn một bạn bè hoặc group chat để bắt đầu cuộc trò chuyện
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {friends.length} bạn bè
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {groupChats.length} group chat
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
