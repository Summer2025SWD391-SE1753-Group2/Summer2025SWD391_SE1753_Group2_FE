import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Send, Users, Wifi, WifiOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGroupChatWebSocket } from "@/services/groupChat/groupChatWebSocketService";
import { getGroupMessages } from "@/services/groupChat/groupChatService";
import type { GroupChatMessage } from "@/types/group-chat";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface EnhancedGroupChatBoxProps {
  groupId: string;
  token: string;
  currentUserId: string;
  groupName?: string;
}

const MESSAGES_PER_PAGE = 50;

export default function EnhancedGroupChatBox({
  groupId,
  token,
  currentUserId,
  groupName = "Group Chat",
}: EnhancedGroupChatBoxProps) {
  const [messages, setMessages] = useState<GroupChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [input, setInput] = useState("");
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [onlineMembers, setOnlineMembers] = useState<string[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const isTyping = useRef(false);

  // Load initial messages
  const loadMessages = useCallback(
    async (skip = 0, limit = MESSAGES_PER_PAGE) => {
      try {
        const response = await getGroupMessages(groupId, skip, limit);
        const newMessages = response.messages || [];

        if (skip === 0) {
          setMessages(newMessages);
          setCurrentPage(0);
        } else {
          setMessages((prev) => [...newMessages, ...prev]);
        }

        setHasMoreMessages(newMessages.length === limit);
      } catch (error) {
        toast.error("Không thể tải tin nhắn");
        console.error("Failed to load messages:", error);
      }
    },
    [groupId]
  );

  // Load more messages (infinite scroll)
  const loadMoreMessages = useCallback(async () => {
    if (loadingMore || !hasMoreMessages) return;

    setLoadingMore(true);
    const nextSkip = (currentPage + 1) * MESSAGES_PER_PAGE;

    try {
      await loadMessages(nextSkip, MESSAGES_PER_PAGE);
      setCurrentPage((prev) => prev + 1);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMoreMessages, currentPage, loadMessages]);

  // WebSocket callbacks
  const handleNewMessage = useCallback((message: GroupChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const handleTypingIndicator = useCallback(
    (userId: string, isTyping: boolean) => {
      if (userId === currentUserId) return;

      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    },
    [currentUserId]
  );

  const handleOnlineMembers = useCallback((members: string[]) => {
    setOnlineMembers(members);
  }, []);

  const handleError = useCallback((error: string) => {
    toast.error(error);
  }, []);

  const handleReconnect = useCallback(() => {
    toast.success("Đã kết nối lại thành công");
  }, []);

  // WebSocket connection
  const { isConnected, isConnecting, sendMessage, sendTypingIndicator } =
    useGroupChatWebSocket(groupId, token, {
      onMessage: handleNewMessage,
      onTypingIndicator: handleTypingIndicator,
      onOnlineMembers: handleOnlineMembers,
      onError: handleError,
      onReconnect: handleReconnect,
    });

  // Load initial messages
  useEffect(() => {
    setLoading(true);
    loadMessages().finally(() => setLoading(false));
  }, [loadMessages]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  // Send message
  const handleSend = useCallback(() => {
    const content = input.trim();
    if (!content || content.length > 1000) return;

    if (sendMessage(content)) {
      setInput("");
      sendTypingIndicator(false);
      isTyping.current = false;
    } else {
      toast.error("Không thể gửi tin nhắn");
    }
  }, [input, sendMessage, sendTypingIndicator]);

  // Handle input change with typing indicator
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);

      if (!isConnected) return;

      if (!isTyping.current) {
        sendTypingIndicator(true);
        isTyping.current = true;
      }

      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }

      typingTimeout.current = setTimeout(() => {
        sendTypingIndicator(false);
        isTyping.current = false;
      }, 1200);
    },
    [isConnected, sendTypingIndicator]
  );

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

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-lg">{groupName}</h3>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {onlineMembers.length} online
          </Badge>
        </div>
        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Messages */}
      <ScrollArea
        ref={scrollAreaRef}
        className="flex-1 p-4"
        onScroll={handleScroll}
      >
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

            {messages.map((message) => (
              <div
                key={message.message_id}
                className={`flex gap-3 mb-4 ${
                  message.sender_id === currentUserId ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={message.sender.avatar} />
                  <AvatarFallback>
                    {getUserInitials(message.sender.full_name)}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={`flex flex-col max-w-[70%] ${
                    message.sender_id === currentUserId
                      ? "items-end"
                      : "items-start"
                  }`}
                >
                  <div
                    className={`px-3 py-2 rounded-lg ${
                      message.sender_id === currentUserId
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {message.sender.full_name}
                    </div>
                    <div className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatMessageTime(message.created_at)}
                  </div>
                </div>
              </div>
            ))}

            {typingUsers.size > 0 && (
              <div className="flex gap-3 mb-4">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>?</AvatarFallback>
                </Avatar>
                <div className="px-3 py-2 rounded-lg bg-gray-100">
                  <div className="text-sm text-gray-500 italic">
                    Ai đó đang nhập...
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-gray-50 rounded-b-lg">
        <div className="flex gap-2">
          <Input
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
