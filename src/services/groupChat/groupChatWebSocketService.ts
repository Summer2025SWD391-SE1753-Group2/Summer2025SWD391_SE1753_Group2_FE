import { useState, useEffect, useCallback } from "react";
import type { GroupChatMessage } from "@/types/group-chat";

export interface WebSocketMessage {
  type: string;
  content?: string;
  is_typing?: boolean;
  data?: GroupChatMessage;
  message_id?: string;
  user_id?: string;
  group_id?: string;
  members?: string[];
  detail?: string;
}

export interface GroupChatWebSocketCallbacks {
  onMessage?: (message: GroupChatMessage) => void;
  onTypingIndicator?: (userId: string, isTyping: boolean) => void;
  onOnlineMembers?: (members: string[]) => void;
  onConnectionEstablished?: () => void;
  onError?: (error: string) => void;
  onDisconnect?: (code: number, reason: string) => void;
  onReconnect?: () => void;
}

export class GroupChatWebSocketService {
  private ws: WebSocket | null = null;
  private groupId: string;
  private token: string;
  private callbacks: GroupChatWebSocketCallbacks;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private connecting = false;
  private isManualClose = false;

  constructor(
    groupId: string,
    token: string,
    callbacks: GroupChatWebSocketCallbacks = {}
  ) {
    this.groupId = groupId;
    this.token = token;
    this.callbacks = callbacks;
  }

  private getWebSocketUrl(): string {
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    // Use WebSocket URL from environment or fallback to API URL
    const wsHost =
      import.meta.env.VITE_WS_URL ||
      import.meta.env.VITE_API_URL ||
      "localhost:8000";
    return `${proto}://${wsHost}/api/v1/group-chat/ws/group/${this.groupId}?token=${this.token}`;
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connecting || this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.connecting = true;
      this.isManualClose = false;

      try {
        this.ws = new WebSocket(this.getWebSocketUrl());

        this.ws.onopen = () => {
          this.connecting = false;
          this.reconnectAttempts = 0;
          this.callbacks.onConnectionEstablished?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };

        this.ws.onclose = (event) => {
          this.connecting = false;
          this.ws = null;

          if (this.isManualClose) {
            return;
          }

          // Handle specific error codes
          if (event.code === 4003) {
            this.callbacks.onError?.(
              "Bạn đã bị xóa khỏi group hoặc không còn quyền truy cập."
            );
            return;
          }

          if (event.code === 4001) {
            this.callbacks.onError?.("Token không hợp lệ hoặc đã hết hạn.");
            return;
          }

          this.callbacks.onDisconnect?.(event.code, event.reason);

          // Attempt to reconnect
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          } else {
            this.callbacks.onError?.(
              "Không thể kết nối lại sau nhiều lần thử."
            );
          }
        };

        this.ws.onerror = (error) => {
          this.connecting = false;
          console.error("WebSocket error:", error);
          reject(new Error("Không thể kết nối WebSocket"));
        };
      } catch (error) {
        this.connecting = false;
        reject(error);
      }
    });
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case "group_message":
        if (message.data) {
          this.callbacks.onMessage?.(message.data);
        }
        break;

      case "typing_indicator":
        if (message.user_id && typeof message.is_typing === "boolean") {
          this.callbacks.onTypingIndicator?.(
            message.user_id,
            message.is_typing
          );
        }
        break;

      case "online_members":
        if (message.members) {
          this.callbacks.onOnlineMembers?.(message.members);
        }
        break;

      case "message_sent":
        // Optional: Handle message sent confirmation
        break;

      case "error":
        this.callbacks.onError?.(message.detail || "Lỗi WebSocket");
        break;

      default:
        console.log("Unknown WebSocket message type:", message.type);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    this.reconnectAttempts++;

    this.reconnectTimeout = setTimeout(() => {
      this.connect()
        .then(() => {
          this.callbacks.onReconnect?.();
        })
        .catch((error) => {
          console.error("Reconnection failed:", error);
        });
    }, delay);
  }

  public sendMessage(content: string): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    const message: WebSocketMessage = {
      type: "send_message",
      content: content.trim(),
    };

    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error("Failed to send message:", error);
      return false;
    }
  }

  public sendTypingIndicator(isTyping: boolean): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    const message: WebSocketMessage = {
      type: "typing",
      is_typing: isTyping,
    };

    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error("Failed to send typing indicator:", error);
      return false;
    }
  }

  public disconnect(): void {
    this.isManualClose = true;
    this.connecting = false;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  public getConnectingStatus(): boolean {
    return this.connecting;
  }
}

// Hook for using the WebSocket service in React components
export const useGroupChatWebSocket = (
  groupId: string,
  token: string,
  callbacks: GroupChatWebSocketCallbacks = {}
) => {
  const [service, setService] = useState<GroupChatWebSocketService | null>(
    null
  );
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!groupId || !token) return;

    const wsService = new GroupChatWebSocketService(groupId, token, {
      ...callbacks,
      onConnectionEstablished: () => {
        setIsConnected(true);
        setIsConnecting(false);
        callbacks.onConnectionEstablished?.();
      },
      onDisconnect: (code, reason) => {
        setIsConnected(false);
        setIsConnecting(false);
        callbacks.onDisconnect?.(code, reason);
      },
      onError: (error) => {
        setIsConnected(false);
        setIsConnecting(false);
        callbacks.onError?.(error);
      },
    });

    setService(wsService);
    setIsConnecting(true);

    wsService.connect().catch((error) => {
      console.error("Failed to connect:", error);
      setIsConnecting(false);
    });

    return () => {
      wsService.disconnect();
      setService(null);
    };
  }, [groupId, token]);

  const sendMessage = useCallback(
    (content: string): boolean => {
      return service?.sendMessage(content) || false;
    },
    [service]
  );

  const sendTypingIndicator = useCallback(
    (isTyping: boolean): boolean => {
      return service?.sendTypingIndicator(isTyping) || false;
    },
    [service]
  );

  return {
    isConnected,
    isConnecting,
    sendMessage,
    sendTypingIndicator,
    service,
  };
};
