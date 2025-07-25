// hooks/useGroupChat.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { getGroupMessages } from "@/services/groupChat/groupChatService";
import { useGroupChatWebSocket } from "@/services/groupChat/groupChatWebSocketService";
import type { GroupChatMessage } from "@/types/group-chat";

export interface UseGroupChatOptions {
  groupId: string;
  token: string;
  currentUserId: string;
  autoLoadMessages?: boolean;
  messagesPerPage?: number;
}

export interface UseGroupChatReturn {
  messages: GroupChatMessage[];
  loading: boolean;
  loadingMore: boolean;
  hasMoreMessages: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  typingUsers: string[];
  onlineMembers: string[];
  memberStatus: string;
  sendMessage: (content: string) => boolean;
  loadMoreMessages: () => Promise<void>;
  sendTypingIndicator: (isTyping: boolean) => boolean;
  reconnect: () => void;
  loadMessages: () => Promise<void>;
}

export const useGroupChat = ({
  groupId,
  token,
  currentUserId,
  autoLoadMessages = true,
  messagesPerPage = 50,
}: UseGroupChatOptions): UseGroupChatReturn => {
  const [messages, setMessages] = useState<GroupChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineMembers, setOnlineMembers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const typingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Load messages function
  const loadMessages = useCallback(
    async (skip = 0, limit = messagesPerPage) => {
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
        return newMessages;
      } catch (error) {
        console.error("Failed to load messages:", error);
        if (skip === 0) {
          toast.error("Không thể tải tin nhắn");
        }
        return [];
      }
    },
    [groupId, messagesPerPage]
  );

  // Load more messages (infinite scroll)
  const loadMoreMessages = useCallback(async () => {
    if (loadingMore || !hasMoreMessages) return;

    setLoadingMore(true);
    const nextSkip = (currentPage + 1) * messagesPerPage;

    try {
      await loadMessages(nextSkip, messagesPerPage);
      setCurrentPage((prev) => prev + 1);
    } finally {
      setLoadingMore(false);
    }
  }, [
    loadingMore,
    hasMoreMessages,
    currentPage,
    messagesPerPage,
    loadMessages,
  ]);

  // WebSocket callbacks
  const handleNewMessage = useCallback((message: GroupChatMessage) => {
    // Remove temp message if exists and add real message
    setMessages((prev) => {
      const filtered = prev.filter((m) => !m.message_id.startsWith("temp-"));
      return [...filtered, message];
    });
  }, []);

  const handleTypingIndicator = useCallback(
    (userId: string, isTyping: boolean) => {
      if (userId === currentUserId) return;

      // Clear existing timeout for this user
      const existingTimeout = typingTimeouts.current.get(userId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      setTypingUsers((prev) => {
        if (isTyping) {
          // Add user to typing list if not already there
          if (!prev.includes(userId)) {
            return [...prev, userId];
          }
          return prev;
        } else {
          // Remove user from typing list
          return prev.filter((id) => id !== userId);
        }
      });

      // Set timeout to automatically remove typing indicator
      if (isTyping) {
        const timeout = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((id) => id !== userId));
          typingTimeouts.current.delete(userId);
        }, 3000); // 3 seconds timeout

        typingTimeouts.current.set(userId, timeout);
      }
    },
    [currentUserId]
  );

  const handleOnlineMembers = useCallback((members: string[]) => {
    setOnlineMembers(members);
  }, []);

  const handleError = useCallback((error: string) => {
    setConnectionError(error);
    toast.error(error);
  }, []);

  const handleDisconnect = useCallback((code: number, reason: string) => {
    // Handle different disconnect codes
    if (code === 4003) {
      setConnectionError("Bạn không còn là thành viên hoạt động của group này");
    } else if (code === 4004) {
      setConnectionError("Bạn đã bị cấm khỏi group này");
    } else if (code === 1000) {
      // Normal closure
      setConnectionError(null);
    } else {
      setConnectionError("Mất kết nối với server");
    }
  }, []);

  const handleReconnect = useCallback(() => {
    setConnectionError(null);
    toast.success("Đã kết nối lại thành công");
  }, []);

  const handleStatusChange = useCallback((status: string) => {
    if (status !== "active") {
      if (status === "banned") {
        setConnectionError("Bạn đã bị cấm khỏi group này");
        toast.error("Bạn đã bị cấm khỏi group này");
      } else if (status === "removed") {
        setConnectionError("Bạn đã bị xóa khỏi group");
        toast.error("Bạn đã bị xóa khỏi group");
      } else if (status === "left") {
        setConnectionError("Bạn đã rời khỏi group");
      }
    }
  }, []);

  // WebSocket connection
  const {
    isConnected,
    isConnecting,
    memberStatus,
    sendMessage: wsSendMessage,
    sendTypingIndicator,
    service,
  } = useGroupChatWebSocket(groupId, token, {
    onMessage: handleNewMessage,
    onTypingIndicator: handleTypingIndicator,
    onOnlineMembers: handleOnlineMembers,
    onError: handleError,
    onDisconnect: handleDisconnect,
    onReconnect: handleReconnect,
    onStatusChange: handleStatusChange,
  });

  // Enhanced send message with optimistic updates
  const sendMessage = useCallback(
    (content: string): boolean => {
      if (!content.trim() || content.length > 1000) return false;

      // Check if user can send messages
      if (memberStatus !== "active") {
        toast.error("Bạn không thể gửi tin nhắn trong trạng thái hiện tại");
        return false;
      }

      // Add optimistic message
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage: GroupChatMessage = {
        message_id: tempId,
        group_id: groupId,
        sender_id: currentUserId,
        content: content.trim(),
        status: "sent",
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sender: {
          account_id: currentUserId,
          username: "You", // Will be updated when real message arrives
          full_name: "You",
          avatar: "",
        },
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      // Send via WebSocket
      const success = wsSendMessage(content);

      if (!success) {
        // Remove optimistic message if send failed
        setMessages((prev) => prev.filter((m) => m.message_id !== tempId));
        toast.error("Không thể gửi tin nhắn");
      }

      return success;
    },
    [wsSendMessage, memberStatus, groupId, currentUserId]
  );

  // Reconnect function
  const reconnect = useCallback(() => {
    setConnectionError(null);
    service?.disconnect();
    // The useGroupChatWebSocket hook will automatically reconnect
  }, [service]);

  // Load initial messages
  useEffect(() => {
    if (autoLoadMessages && groupId && token) {
      setLoading(true);
      loadMessages().finally(() => setLoading(false));
    }
  }, [autoLoadMessages, groupId, token, loadMessages]);

  // Cleanup typing timeouts on unmount
  useEffect(() => {
    return () => {
      typingTimeouts.current.forEach((timeout) => clearTimeout(timeout));
      typingTimeouts.current.clear();
    };
  }, []);

  return {
    messages,
    loading,
    loadingMore,
    hasMoreMessages,
    isConnected,
    isConnecting,
    connectionError,
    typingUsers,
    onlineMembers,
    memberStatus,
    sendMessage,
    loadMoreMessages,
    sendTypingIndicator,
    reconnect,
    loadMessages,
  };
};
