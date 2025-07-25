import { useState, useCallback, useRef, useEffect } from "react";
import {
  Send,
  Users,
  Wifi,
  WifiOff,
  Loader2,
  RefreshCw,
  MoreVertical,
  LogOut,
  UserMinus,
  Ban,
  Crown,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useGroupChat } from "@/hooks/useGroupChat";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import type { GroupChatMessage, GroupMember } from "@/types/group-chat";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input as UiInput } from "@/components/ui/input";
import { toast } from "sonner";
import {
  updateGroupName,
  getGroupMembers,
  addGroupMember,
  removeGroupMember,
  banGroupMember,
  leaveGroupChat,
  searchAccounts,
} from "@/services/groupChat/groupChatService";
import type { UserProfile } from "@/types/account";

interface GroupChatContainerProps {
  groupId: string;
  token: string;
  currentUserId: string;
  groupName?: string;
  groupDescription?: string;
  onLeaveGroup?: () => void;
}

export default function GroupChatContainer({
  groupId,
  token,
  currentUserId,
  groupName = "Group Chat",
  groupDescription,
  onLeaveGroup: onLeaveGroupCallback,
}: GroupChatContainerProps) {
  const [input, setInput] = useState("");
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [editingName, setEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState(groupName);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [addingUser, setAddingUser] = useState(false);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>("member");
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [memberActionDialog, setMemberActionDialog] = useState<{
    open: boolean;
    member: GroupMember | null;
    action: "remove" | "ban" | null;
  }>({ open: false, member: null, action: null });

  const {
    messages,
    loading,
    loadingMore,
    hasMoreMessages,
    isConnected,
    isConnecting,
    connectionError,
    typingUsers,
    onlineMembers,
    sendMessage,
    loadMoreMessages,
    sendTypingIndicator,
    reconnect,
    loadMessages,
  } = useGroupChat({
    groupId,
    token,
    currentUserId,
    autoLoadMessages: true,
    messagesPerPage: 50,
  });

  // Auto scroll xuống dưới khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle input change with typing indicator
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);

      if (!isConnected) return;

      if (!showTypingIndicator) {
        setShowTypingIndicator(true);
        sendTypingIndicator(true);
      }

      // Clear typing indicator after delay
      setTimeout(() => {
        setShowTypingIndicator(false);
        sendTypingIndicator(false);
      }, 1200);
    },
    [isConnected, showTypingIndicator, sendTypingIndicator]
  );

  // Send message
  const handleSend = useCallback(() => {
    const content = input.trim();
    if (!content || content.length > 1000) return;
    if (sendMessage(content)) {
      setInput("");
      setShowTypingIndicator(false);
      sendTypingIndicator(false);
      setTimeout(() => {
        loadMessages();
      }, 200);
    }
  }, [input, sendMessage, sendTypingIndicator, loadMessages]);

  // Handle key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // Handle scroll for infinite loading
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop } = event.currentTarget;
      if (scrollTop === 0 && hasMoreMessages && !loadingMore) {
        loadMoreMessages();
      }
    },
    [hasMoreMessages, loadingMore, loadMoreMessages]
  );

  // Format message time
  const formatMessageTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return new Date(timestamp).toLocaleString();
    }
  };

  // Get user initials for avatar - Fix TypeScript error
  const getUserInitials = (fullName: string | null | undefined) => {
    if (!fullName) return "?";
    return fullName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Check if message is from current user
  const isOwnMessage = (message: GroupChatMessage) => {
    return message.sender_id === currentUserId;
  };

  // Get typing indicator text
  const getTypingText = () => {
    if (typingUsers.length === 0) return "";
    if (typingUsers.length === 1) return "Ai đó đang nhập...";
    if (typingUsers.length === 2) return "2 người đang nhập...";
    return `${typingUsers.length} người đang nhập...`;
  };

  // Check permissions
  const canEditGroup = () => currentUserRole === "leader";
  const canAddMembers = () => ["leader", "moderator"].includes(currentUserRole);
  const canRemoveMembers = () =>
    ["leader", "moderator"].includes(currentUserRole);
  const canBanMembers = () => currentUserRole === "leader";

  // Hàm gọi API đổi tên nhóm
  const onEditGroupName = async () => {
    if (!newGroupName.trim() || newGroupName === groupName) {
      setEditingName(false);
      return;
    }
    try {
      await updateGroupName(groupId, newGroupName, token);
      toast.success("Đã đổi tên nhóm thành công");
      setEditingName(false);
    } catch {
      toast.error("Đổi tên nhóm thất bại");
    }
  };

  // Hàm fetch members với status filtering
  const fetchMembers = async () => {
    try {
      const res: GroupMember[] = await getGroupMembers(groupId, token);
      setMembers(res);
      // Xác định quyền của user hiện tại
      const me = res.find((u: GroupMember) => u.account_id === currentUserId);
      setCurrentUserRole(me?.role || "member");
    } catch {
      toast.error("Không thể tải danh sách thành viên");
    }
  };

  // Hàm xóa thành viên (set status = 'removed')
  const onRemoveMember = async (member: GroupMember) => {
    if (members.length <= 2) {
      toast.error("Nhóm phải có ít nhất 2 thành viên");
      return;
    }
    try {
      await removeGroupMember(groupId, member.account_id, token);
      toast.success(`Đã xóa ${member.full_name || member.username} khỏi nhóm`);
      fetchMembers();
    } catch {
      toast.error("Xóa thành viên thất bại");
    }
  };

  // Hàm ban thành viên (set status = 'banned')
  const onBanMember = async (member: GroupMember) => {
    try {
      await banGroupMember(groupId, member.account_id, token);
      toast.success(`Đã cấm ${member.full_name || member.username} khỏi nhóm`);
      fetchMembers();
    } catch {
      toast.error("Cấm thành viên thất bại");
    }
  };

  // Hàm rời nhóm (set status = 'left')
  const handleLeaveGroup = async () => {
    try {
      await leaveGroupChat(groupId, token);
      toast.success("Đã rời khỏi nhóm");
      onLeaveGroupCallback?.();
    } catch {
      toast.error("Rời nhóm thất bại");
    }
  };

  // Hàm search user
  const onSearchUser = async (keyword: string) => {
    setSearchUser(keyword);
    if (!keyword.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await searchAccounts(keyword, token);
      // Loại bỏ user đã trong nhóm
      const filtered = res.filter(
        (u: UserProfile) =>
          !members.some((m: GroupMember) => m.account_id === u.account_id)
      );
      setSearchResults(filtered);
    } catch {
      setSearchResults([]);
    }
  };

  // Hàm thêm user vào nhóm
  const onAddUser = async (user: UserProfile) => {
    if (members.length >= 50) {
      toast.error("Nhóm đã đủ 50 thành viên");
      return;
    }
    setAddingUser(true);
    try {
      await addGroupMember(groupId, user.account_id, token);
      toast.success(`Đã thêm ${user.full_name || user.username} vào nhóm`);
      setSearchUser("");
      setSearchResults([]);
      fetchMembers();
    } catch {
      toast.error("Thêm thành viên thất bại");
    }
    setAddingUser(false);
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "leader":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "moderator":
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get role text
  const getRoleText = (role: string) => {
    switch (role) {
      case "leader":
        return "Trưởng nhóm";
      case "moderator":
        return "Quản trị viên";
      default:
        return "Thành viên";
    }
  };

  return (
    <div className="flex flex-col h-full w-full items-center justify-center">
      <div className="w-full max-w-4xl h-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-2xl border-2 border-blue-200 mx-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white/90 backdrop-blur rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {editingName ? (
                  <UiInput
                    value={newGroupName}
                    onChange={(event) => setNewGroupName(event.target.value)}
                    onBlur={onEditGroupName}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") onEditGroupName();
                    }}
                    autoFocus
                    className="text-lg font-semibold px-2 py-1"
                    maxLength={50}
                  />
                ) : (
                  <>
                    <h3 className="font-semibold text-lg truncate">
                      {newGroupName}
                    </h3>
                    {canEditGroup() && (
                      <button
                        className="ml-1 text-blue-500 hover:text-blue-700"
                        onClick={() => setEditingName(true)}
                        title="Đổi tên nhóm"
                      >
                        <svg
                          width="18"
                          height="18"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16.474 5.408a2.317 2.317 0 1 1 3.278 3.277L8.97 19.468c-.33.33-.495.495-.68.62a2 2 0 0 1-.47.22c-.2.06-.414.08-.842.12l-2.13.2c-.37.035-.555.053-.68-.03a.5.5 0 0 1-.19-.23c-.07-.16-.03-.345.06-.715l.5-2.03c.07-.28.11-.42.19-.55a2 2 0 0 1 .32-.39c.12-.12.27-.22.57-.42l10.636-10.37Z"
                          />
                        </svg>
                      </button>
                    )}
                  </>
                )}
              </div>
              {groupDescription && (
                <p className="text-sm text-gray-500 truncate">
                  {groupDescription}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {onlineMembers.length} online
            </Badge>
            {isConnected ? (
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <Wifi className="w-4 h-4" /> Đã kết nối
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600 font-medium">
                <WifiOff className="w-4 h-4" /> Mất kết nối
              </span>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    fetchMembers();
                    setMembersDialogOpen(true);
                  }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Xem thành viên
                </DropdownMenuItem>
                {canAddMembers() && (
                  <DropdownMenuItem
                    onClick={() => {
                      fetchMembers();
                      setAddUserDialogOpen(true);
                    }}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Thêm thành viên
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setLeaveConfirmOpen(true)}
                  className="text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Rời khỏi nhóm
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Connection Error */}
        {connectionError && (
          <div className="p-3 bg-red-50 border-b border-red-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-600">{connectionError}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={reconnect}
                disabled={isConnecting}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Thử lại
              </Button>
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea
          ref={scrollAreaRef}
          className="flex-1 p-4 bg-transparent overflow-y-auto"
          onScroll={handleScroll}
        >
          <div className="flex flex-col gap-3 justify-end min-h-full">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Đang tải tin nhắn...</span>
              </div>
            ) : (
              <>
                {loadingMore && (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="ml-2 text-sm text-gray-500">
                      Đang tải thêm...
                    </span>
                  </div>
                )}
                {messages.length === 0 && !loading && (
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    <div className="text-center">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Chưa có tin nhắn nào</p>
                      <p className="text-sm">Hãy bắt đầu cuộc trò chuyện!</p>
                    </div>
                  </div>
                )}
                {messages.map((message) => (
                  <div
                    key={message.message_id}
                    className={`flex items-end gap-2 group ${
                      isOwnMessage(message) ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isOwnMessage(message) && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.sender.avatar} />
                        <AvatarFallback>
                          {getUserInitials(message.sender.full_name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`flex flex-col max-w-[70%] ${
                        isOwnMessage(message) ? "items-end" : "items-start"
                      }`}
                    >
                      {!isOwnMessage(message) && (
                        <span className="font-semibold text-xs text-blue-700 mb-1 block">
                          {message.sender.full_name}
                        </span>
                      )}
                      <div
                        className={`px-4 py-2 rounded-2xl shadow-md transition-colors whitespace-pre-wrap break-words text-base font-normal select-text ${
                          isOwnMessage(message)
                            ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-br-md hover:from-blue-600 hover:to-blue-800"
                            : "bg-white/95 text-gray-900 border border-blue-100 hover:bg-blue-50"
                        }`}
                      >
                        {message.content}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 select-none">
                        {formatMessageTime(message.created_at)}
                      </div>
                    </div>
                    {isOwnMessage(message) && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.sender.avatar} />
                        <AvatarFallback>
                          {getUserInitials(message.sender.full_name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {getTypingText() && (
                  <div className="flex gap-3 mb-4">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>?</AvatarFallback>
                    </Avatar>
                    <div className="px-3 py-2 rounded-lg bg-blue-100">
                      <div className="text-sm text-blue-600 italic">
                        {getTypingText()}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t bg-white/90 backdrop-blur rounded-b-2xl sticky bottom-0 z-10">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={isConnected ? "Nhập tin nhắn..." : "Đang kết nối..."}
              maxLength={1000}
              disabled={!isConnected || loading}
              className="flex-1 text-base"
            />
            <Button
              onClick={handleSend}
              disabled={
                !isConnected || !input.trim() || input.length > 1000 || loading
              }
              size="icon"
              className="bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-md"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
            <span>{input.length}/1000 ký tự</span>
            <span>{isConnected ? "Đã kết nối" : "Đang kết nối..."}</span>
          </div>
        </div>
      </div>

      {/* Dialog xem thành viên */}
      <Dialog open={membersDialogOpen} onOpenChange={setMembersDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thành viên nhóm ({members.length})</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {members.map((m: GroupMember) => (
              <div
                key={m.account_id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={m.avatar || undefined} />
                  <AvatarFallback>
                    {getUserInitials(m.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-sm truncate">
                      {m.full_name || m.username}
                    </div>
                    {getRoleIcon(m.role)}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    {getRoleText(m.role)}
                    {m.status && m.status !== "active" && (
                      <Badge variant="secondary" className="text-xs">
                        {m.status}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                {m.account_id !== currentUserId && (
                  <div className="flex gap-1">
                    {canRemoveMembers() &&
                      m.role !== "leader" &&
                      members.length > 2 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setMemberActionDialog({
                              open: true,
                              member: m,
                              action: "remove",
                            })
                          }
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      )}
                    {canBanMembers() && m.role !== "leader" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setMemberActionDialog({
                            open: true,
                            member: m,
                            action: "ban",
                          })
                        }
                        className="text-red-600 hover:text-red-700"
                      >
                        <Ban className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMembersDialogOpen(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog thêm thành viên */}
      <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm thành viên vào nhóm</DialogTitle>
          </DialogHeader>
          <UiInput
            placeholder="Tìm kiếm user..."
            value={searchUser}
            onChange={(e) => onSearchUser(e.target.value)}
            className="mb-2"
          />
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {searchResults.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-4">
                {searchUser.trim()
                  ? "Không có kết quả"
                  : "Nhập tên để tìm kiếm"}
              </div>
            ) : (
              searchResults.map((u: UserProfile) => (
                <div
                  key={u.account_id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-blue-50 border"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={u.avatar || undefined} />
                    <AvatarFallback>
                      {getUserInitials(u.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {u.full_name || u.username}
                    </div>
                    <div className="text-xs text-gray-500">@{u.username}</div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onAddUser(u)}
                    disabled={addingUser || members.length >= 50}
                  >
                    {addingUser ? "Đang thêm..." : "Thêm"}
                  </Button>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddUserDialogOpen(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm leave dialog */}
      <AlertDialog open={leaveConfirmOpen} onOpenChange={setLeaveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rời khỏi nhóm</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn rời khỏi nhóm "{groupName}"? Bạn sẽ không
              thể xem tin nhắn hoặc tham gia trò chuyện trong nhóm này nữa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveGroup}
              className="bg-red-600 hover:bg-red-700"
            >
              Rời nhóm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Member action dialog */}
      <AlertDialog
        open={memberActionDialog.open}
        onOpenChange={(open) =>
          setMemberActionDialog({ open, member: null, action: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {memberActionDialog.action === "remove"
                ? "Xóa thành viên"
                : "Cấm thành viên"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {memberActionDialog.action === "remove"
                ? `Bạn có chắc chắn muốn xóa "${
                    memberActionDialog.member?.full_name ||
                    memberActionDialog.member?.username
                  }" khỏi nhóm? Họ có thể tham gia lại sau.`
                : `Bạn có chắc chắn muốn cấm "${
                    memberActionDialog.member?.full_name ||
                    memberActionDialog.member?.username
                  }" khỏi nhóm? Họ sẽ không thể tham gia lại nhóm này.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (
                  memberActionDialog.action === "remove" &&
                  memberActionDialog.member
                ) {
                  onRemoveMember(memberActionDialog.member);
                } else if (
                  memberActionDialog.action === "ban" &&
                  memberActionDialog.member
                ) {
                  onBanMember(memberActionDialog.member);
                }
                setMemberActionDialog({
                  open: false,
                  member: null,
                  action: null,
                });
              }}
              className={
                memberActionDialog.action === "ban"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-orange-600 hover:bg-orange-700"
              }
            >
              {memberActionDialog.action === "remove" ? "Xóa" : "Cấm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
