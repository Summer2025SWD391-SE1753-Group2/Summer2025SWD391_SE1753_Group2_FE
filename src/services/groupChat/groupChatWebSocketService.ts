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
  my_status?: string;
}

export interface GroupChatWebSocketCallbacks {
  onMessage?: (message: GroupChatMessage) => void;
  onTypingIndicator?: (userId: string, isTyping: boolean) => void;
  onOnlineMembers?: (members: string[]) => void;
  onConnectionEstablished?: () => void;
  onError?: (error: string) => void;
  onDisconnect?: (code: number, reason: string) => void;
  onReconnect?: () => void;
  onStatusChange?: (status: string) => void;
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
  private hadConnectionEstablished = false;
  private errorTimeout: NodeJS.Timeout | null = null;
  private currentStatus: string | null = null;

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
    const wsHost = import.meta.env.VITE_API_URL || "http://54.169.148.165:8000";
    const host = wsHost.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `${proto}://${host}/api/v1/group-chat/ws/group/${this.groupId}?token=${this.token}`;
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connecting || this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.connecting = true;
      this.isManualClose = false;
      this.hadConnectionEstablished = false;
      if (this.errorTimeout) {
        clearTimeout(this.errorTimeout);
        this.errorTimeout = null;
      }

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
            if (message.type === "connection_established") {
              this.hadConnectionEstablished = true;
              this.currentStatus = message.my_status || "active";
              this.callbacks.onStatusChange?.(this.currentStatus);
              if (this.errorTimeout) {
                clearTimeout(this.errorTimeout);
                this.errorTimeout = null;
              }
              return;
            }
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

          // Handle specific error codes for status-related issues
          if (event.code === 4003) {
            this.callbacks.onError?.(
              "Bạn không còn là thành viên hoạt động của group này."
            );
            return;
          }

          if (event.code === 4001) {
            this.callbacks.onError?.("Token không hợp lệ hoặc đã hết hạn.");
            return;
          }

          if (event.code === 4004) {
            this.callbacks.onError?.("Bạn đã bị cấm khỏi group này.");
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
          // Only log as error if connection was never established
          if (!this.hadConnectionEstablished) {
            if (!this.errorTimeout) {
              this.errorTimeout = setTimeout(() => {
                if (!this.hadConnectionEstablished) {
                  console.error(
                    "WebSocket error (no connection established):",
                    error
                  );
                  reject(new Error("Không thể kết nối WebSocket"));
                }
                this.errorTimeout = null;
              }, 1000);
            }
          } else {
            console.warn(
              "WebSocket error after connection established:",
              error
            );
          }
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
      case "status_changed":
        // Handle status change notifications
        if (message.my_status) {
          this.currentStatus = message.my_status;
          this.callbacks.onStatusChange?.(message.my_status);

          // If user was removed/banned, show appropriate message
          if (message.my_status === "removed") {
            this.callbacks.onError?.("Bạn đã bị xóa khỏi group.");
            this.disconnect();
          } else if (message.my_status === "banned") {
            this.callbacks.onError?.("Bạn đã bị cấm khỏi group.");
            this.disconnect();
          }
        }
        break;
      case "member_status_update":
        // Handle other members' status updates if needed
        console.log("Member status updated:", message);
        break;
      case "error":
        this.callbacks.onError?.(message.detail || "Lỗi WebSocket");
        break;
      case "connection_established":
        // Already handled in onmessage
        break;
      default:
        console.warn("Unknown WebSocket message type:", message.type);
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

    // Check if user is still active
    if (this.currentStatus && this.currentStatus !== "active") {
      this.callbacks.onError?.(
        "Bạn không thể gửi tin nhắn trong trạng thái hiện tại."
      );
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

    // Only send typing indicator if user is active
    if (this.currentStatus && this.currentStatus !== "active") {
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

    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
      this.errorTimeout = null;
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

  public getCurrentStatus(): string | null {
    return this.currentStatus;
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
  const [memberStatus, setMemberStatus] = useState<string>("active");

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
      onStatusChange: (status) => {
        setMemberStatus(status);
        callbacks.onStatusChange?.(status);
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
    memberStatus,
    sendMessage,
    sendTypingIndicator,
    service,
  };
};
