import { useEffect, useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useGroupChatWebSocket } from "@/services/groupChat/groupChatWebSocketService";
import { useGroupChatStore } from "@/stores/groupChatStore";
import { getGroupMessages } from "@/services/groupChat/groupChatService";
import type { GroupChatMessage } from "@/types/group-chat";

interface UseGroupChatOptions {
  groupId: string;
  token: string;
  currentUserId: string;
  autoLoadMessages?: boolean;
  messagesPerPage?: number;
}

interface UseGroupChatReturn {
  // Messages
  messages: GroupChatMessage[];
  loading: boolean;
  loadingMore: boolean;
  hasMoreMessages: boolean;

  // Connection status
  isConnected: boolean;
  isConnecting: boolean;
  connectionError?: string;

  // Typing and online status
  typingUsers: string[];
  onlineMembers: string[];

  // Actions
  sendMessage: (content: string) => boolean;
  loadMessages: (skip?: number, limit?: number) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  clearMessages: () => void;

  // Typing indicator
  sendTypingIndicator: (isTyping: boolean) => boolean;

  // Connection management
  reconnect: () => Promise<void>;
}

export const useGroupChat = ({
  groupId,
  token,
  currentUserId,
  autoLoadMessages = true,
  messagesPerPage = 50,
}: UseGroupChatOptions): UseGroupChatReturn => {
  const {
    addMessage,
    setMessages,
    prependMessages,
    clearMessages: clearStoreMessages,
    setTypingUser,
    setOnlineMembers,
    setConnectionStatus,
    getMessages,
    getTypingUsers,
    getOnlineMembers,
    getConnectionStatus,
  } = useGroupChatStore();

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const isTyping = useRef(false);

  // Get current state from store
  const currentMessages = getMessages(groupId);
  const currentTypingUsers = getTypingUsers(groupId);
  const currentOnlineMembers = getOnlineMembers(groupId);
  const currentConnectionStatus = getConnectionStatus(groupId);

  // WebSocket callbacks
  const handleNewMessage = useCallback(
    (message: GroupChatMessage) => {
      addMessage(groupId, message);
    },
    [groupId, addMessage]
  );

  const handleTypingIndicator = useCallback(
    (userId: string, isTyping: boolean) => {
      if (userId === currentUserId) return;
      setTypingUser(groupId, userId, isTyping);
    },
    [groupId, currentUserId, setTypingUser]
  );

  const handleOnlineMembers = useCallback(
    (members: string[]) => {
      setOnlineMembers(groupId, members);
    },
    [groupId, setOnlineMembers]
  );

  const handleConnectionEstablished = useCallback(() => {
    setConnectionStatus(groupId, { isConnected: true, isConnecting: false });
  }, [groupId, setConnectionStatus]);

  const handleDisconnect = useCallback(
    (code: number, reason: string) => {
      setConnectionStatus(groupId, {
        isConnected: false,
        isConnecting: false,
        lastError: `Mất kết nối: ${reason}`,
      });
    },
    [groupId, setConnectionStatus]
  );

  const handleError = useCallback(
    (error: string) => {
      setConnectionStatus(groupId, {
        isConnected: false,
        isConnecting: false,
        lastError: error,
      });
      toast.error(error);
    },
    [groupId, setConnectionStatus]
  );

  const handleReconnect = useCallback(() => {
    setConnectionStatus(groupId, { isConnected: true, isConnecting: false });
    toast.success("Đã kết nối lại thành công");
  }, [groupId, setConnectionStatus]);

  // WebSocket connection
  const {
    isConnected,
    isConnecting,
    sendMessage: wsSendMessage,
    sendTypingIndicator: wsSendTypingIndicator,
    service,
  } = useGroupChatWebSocket(groupId, token, {
    onMessage: handleNewMessage,
    onTypingIndicator: handleTypingIndicator,
    onOnlineMembers: handleOnlineMembers,
    onConnectionEstablished: handleConnectionEstablished,
    onDisconnect: handleDisconnect,
    onError: handleError,
    onReconnect: handleReconnect,
  });

  // Load messages from API
  const loadMessages = useCallback(
    async (skip = 0, limit = messagesPerPage) => {
      try {
        const response = await getGroupMessages(groupId, skip, limit);
        const newMessages = response.messages || [];

        if (skip === 0) {
          setMessages(groupId, newMessages);
          setCurrentPage(0);
        } else {
          prependMessages(groupId, newMessages);
        }

        setHasMoreMessages(newMessages.length === limit);
      } catch (error) {
        toast.error("Không thể tải tin nhắn");
        console.error("Failed to load messages:", error);
      }
    },
    [groupId, messagesPerPage, setMessages, prependMessages]
  );

  // Load more messages for infinite scroll
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

  // Send message
  const sendMessage = useCallback(
    (content: string): boolean => {
      const trimmedContent = content.trim();
      if (!trimmedContent || trimmedContent.length > 1000) return false;

      if (wsSendMessage(trimmedContent)) {
        // Stop typing indicator
        wsSendTypingIndicator(false);
        isTyping.current = false;
        if (typingTimeout.current) {
          clearTimeout(typingTimeout.current);
          typingTimeout.current = null;
        }
        return true;
      } else {
        toast.error("Không thể gửi tin nhắn");
        return false;
      }
    },
    [wsSendMessage, wsSendTypingIndicator]
  );

  // Send typing indicator
  const sendTypingIndicator = useCallback(
    (isTypingStatus: boolean): boolean => {
      if (!isConnected) return false;

      if (isTypingStatus && !isTyping.current) {
        isTyping.current = true;
      }

      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }

      if (!isTypingStatus) {
        isTyping.current = false;
      } else {
        typingTimeout.current = setTimeout(() => {
          wsSendTypingIndicator(false);
          isTyping.current = false;
        }, 1200);
      }

      return wsSendTypingIndicator(isTypingStatus);
    },
    [isConnected, wsSendTypingIndicator]
  );

  // Clear messages
  const clearMessages = useCallback(() => {
    clearStoreMessages(groupId);
  }, [groupId, clearStoreMessages]);

  // Reconnect
  const reconnect = useCallback(async () => {
    if (service) {
      try {
        await service.connect();
      } catch (error) {
        console.error("Reconnection failed:", error);
        toast.error("Không thể kết nối lại");
      }
    }
  }, [service]);

  // Auto-load messages on mount
  useEffect(() => {
    if (autoLoadMessages && groupId && token) {
      setLoading(true);
      loadMessages().finally(() => setLoading(false));
    }
  }, [groupId, token, autoLoadMessages, loadMessages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
      // Don't clear group data on unmount to preserve state
    };
  }, []);

  return {
    // Messages
    messages: currentMessages,
    loading,
    loadingMore,
    hasMoreMessages,

    // Connection status
    isConnected,
    isConnecting,
    connectionError: currentConnectionStatus.lastError,

    // Typing and online status
    typingUsers: currentTypingUsers,
    onlineMembers: currentOnlineMembers,

    // Actions
    sendMessage,
    loadMessages,
    loadMoreMessages,
    clearMessages,

    // Typing indicator
    sendTypingIndicator,

    // Connection management
    reconnect,
  };
};
