import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { GroupChatMessage } from "@/types/group-chat";

interface GroupChatState {
  // Messages by group ID
  messages: Record<string, GroupChatMessage[]>;

  // Typing indicators by group ID
  typingUsers: Record<string, Set<string>>;

  // Online members by group ID
  onlineMembers: Record<string, string[]>;

  // Connection status by group ID
  connectionStatus: Record<
    string,
    {
      isConnected: boolean;
      isConnecting: boolean;
      lastError?: string;
    }
  >;

  // Actions
  addMessage: (groupId: string, message: GroupChatMessage) => void;
  setMessages: (groupId: string, messages: GroupChatMessage[]) => void;
  prependMessages: (groupId: string, messages: GroupChatMessage[]) => void;
  clearMessages: (groupId: string) => void;

  setTypingUser: (groupId: string, userId: string, isTyping: boolean) => void;
  clearTypingUsers: (groupId: string) => void;

  setOnlineMembers: (groupId: string, members: string[]) => void;

  setConnectionStatus: (
    groupId: string,
    status: { isConnected: boolean; isConnecting: boolean; lastError?: string }
  ) => void;

  // Utility actions
  getMessages: (groupId: string) => GroupChatMessage[];
  getTypingUsers: (groupId: string) => string[];
  getOnlineMembers: (groupId: string) => string[];
  getConnectionStatus: (groupId: string) => {
    isConnected: boolean;
    isConnecting: boolean;
    lastError?: string;
  };

  // Clear all data for a group
  clearGroupData: (groupId: string) => void;

  // Clear all data
  clearAll: () => void;
}

export const useGroupChatStore = create<GroupChatState>()(
  devtools(
    (set, get) => ({
      messages: {},
      typingUsers: {},
      onlineMembers: {},
      connectionStatus: {},

      // Message actions
      addMessage: (groupId: string, message: GroupChatMessage) => {
        set((state) => ({
          messages: {
            ...state.messages,
            [groupId]: [...(state.messages[groupId] || []), message],
          },
        }));
      },

      setMessages: (groupId: string, messages: GroupChatMessage[]) => {
        set((state) => ({
          messages: {
            ...state.messages,
            [groupId]: messages,
          },
        }));
      },

      prependMessages: (groupId: string, messages: GroupChatMessage[]) => {
        set((state) => ({
          messages: {
            ...state.messages,
            [groupId]: [...messages, ...(state.messages[groupId] || [])],
          },
        }));
      },

      clearMessages: (groupId: string) => {
        set((state) => {
          const newMessages = { ...state.messages };
          delete newMessages[groupId];
          return { messages: newMessages };
        });
      },

      // Typing indicator actions
      setTypingUser: (groupId: string, userId: string, isTyping: boolean) => {
        set((state) => {
          const currentTyping = state.typingUsers[groupId] || new Set();
          const newTyping = new Set(currentTyping);

          if (isTyping) {
            newTyping.add(userId);
          } else {
            newTyping.delete(userId);
          }

          return {
            typingUsers: {
              ...state.typingUsers,
              [groupId]: newTyping,
            },
          };
        });
      },

      clearTypingUsers: (groupId: string) => {
        set((state) => {
          const newTypingUsers = { ...state.typingUsers };
          delete newTypingUsers[groupId];
          return { typingUsers: newTypingUsers };
        });
      },

      // Online members actions
      setOnlineMembers: (groupId: string, members: string[]) => {
        set((state) => ({
          onlineMembers: {
            ...state.onlineMembers,
            [groupId]: members,
          },
        }));
      },

      // Connection status actions
      setConnectionStatus: (
        groupId: string,
        status: {
          isConnected: boolean;
          isConnecting: boolean;
          lastError?: string;
        }
      ) => {
        set((state) => ({
          connectionStatus: {
            ...state.connectionStatus,
            [groupId]: status,
          },
        }));
      },

      // Utility getters
      getMessages: (groupId: string) => {
        return get().messages[groupId] || [];
      },

      getTypingUsers: (groupId: string) => {
        const typingSet = get().typingUsers[groupId];
        return typingSet ? Array.from(typingSet) : [];
      },

      getOnlineMembers: (groupId: string) => {
        return get().onlineMembers[groupId] || [];
      },

      getConnectionStatus: (groupId: string) => {
        return (
          get().connectionStatus[groupId] || {
            isConnected: false,
            isConnecting: false,
          }
        );
      },

      // Clear actions
      clearGroupData: (groupId: string) => {
        set((state) => {
          const newMessages = { ...state.messages };
          const newTypingUsers = { ...state.typingUsers };
          const newOnlineMembers = { ...state.onlineMembers };
          const newConnectionStatus = { ...state.connectionStatus };

          delete newMessages[groupId];
          delete newTypingUsers[groupId];
          delete newOnlineMembers[groupId];
          delete newConnectionStatus[groupId];

          return {
            messages: newMessages,
            typingUsers: newTypingUsers,
            onlineMembers: newOnlineMembers,
            connectionStatus: newConnectionStatus,
          };
        });
      },

      clearAll: () => {
        set({
          messages: {},
          typingUsers: {},
          onlineMembers: {},
          connectionStatus: {},
        });
      },
    }),
    {
      name: "group-chat-store",
    }
  )
);
