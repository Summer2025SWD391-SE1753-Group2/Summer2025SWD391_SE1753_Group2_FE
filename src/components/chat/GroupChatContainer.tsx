import { useState, useCallback, useRef, useEffect } from "react";
import {
  Send,
  Users,
  Wifi,
  WifiOff,
  Loader2,
  RefreshCw,
  MoreVertical,
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
} from "@/components/ui/dropdown-menu";
import { useGroupChat } from "@/hooks/useGroupChat";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import type { GroupChatMessage } from "@/types/group-chat";

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
  onLeaveGroup,
}: GroupChatContainerProps) {
  const [input, setInput] = useState("");
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    clearMessages,
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

  // Get user initials for avatar
  const getUserInitials = (fullName: string) => {
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

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg shadow-sm border relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur rounded-t-lg sticky top-0 z-10">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{groupName}</h3>
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

          {isConnecting && (
            <div className="flex items-center gap-1 text-yellow-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Đang kết nối...</span>
            </div>
          )}

          {isConnected ? (
            <div className="flex items-center gap-1 text-green-600">
              <Wifi className="w-4 h-4" />
              <span className="text-sm">Đã kết nối</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-600">
              <WifiOff className="w-4 h-4" />
              <span className="text-sm">Mất kết nối</span>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={reconnect} disabled={isConnecting}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Kết nối lại
              </DropdownMenuItem>
              <DropdownMenuItem onClick={clearMessages}>
                <Loader2 className="w-4 h-4 mr-2" />
                Xóa tin nhắn
              </DropdownMenuItem>
              {onLeaveGroup && (
                <DropdownMenuItem
                  onClick={onLeaveGroup}
                  className="text-red-600"
                >
                  Rời khỏi nhóm
                </DropdownMenuItem>
              )}
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
        className="flex-1 p-4 bg-chat-pattern overflow-y-auto"
        onScroll={handleScroll}
      >
        <div className="flex flex-col gap-2 justify-end min-h-full">
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
                    <div
                      className={`px-3 py-2 rounded-2xl shadow transition-colors whitespace-pre-wrap break-words text-sm font-normal ${
                        isOwnMessage(message)
                          ? "bg-blue-500 text-white rounded-br-md hover:bg-blue-600"
                          : "bg-white/90 text-gray-900 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {!isOwnMessage(message) && (
                        <span className="font-semibold text-xs text-blue-700 mr-2">
                          {message.sender.full_name}
                        </span>
                      )}
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
                  <div className="px-3 py-2 rounded-lg bg-gray-100">
                    <div className="text-sm text-gray-500 italic">
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
      <div className="p-4 border-t bg-white/80 backdrop-blur rounded-b-lg sticky bottom-0 z-10">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Nhập tin nhắn..." : "Đang kết nối..."}
            maxLength={1000}
            disabled={!isConnected || loading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={
              !isConnected || !input.trim() || input.length > 1000 || loading
            }
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>{input.length}/1000 ký tự</span>
          <span>{isConnected ? "Đã kết nối" : "Đang kết nối..."}</span>
        </div>
      </div>
    </div>
  );
}
