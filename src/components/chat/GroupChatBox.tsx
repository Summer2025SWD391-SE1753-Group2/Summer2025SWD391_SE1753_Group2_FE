import { useEffect, useState, useRef, useCallback } from "react";
import axiosInstance from "@/lib/api/axios";
import type { GroupChatMessage } from "@/types/group-chat";
import { toast } from "sonner";

interface GroupChatBoxProps {
  groupId: string;
  token: string;
  currentUserId: string;
}

const LIMIT = 50;
const WS_URL = (groupId: string, token: string) => {
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  const wsHost =
    import.meta.env.VITE_WS_URL ||
    import.meta.env.VITE_API_URL ||
    "localhost:8000";
  return `${proto}://${wsHost}/api/v1/group-chat/ws/group/${groupId}?token=${token}`;
};

export default function GroupChatBox({
  groupId,
  token,
  currentUserId,
}: GroupChatBoxProps) {
  const [messages, setMessages] = useState<GroupChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineMembers, setOnlineMembers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const isTyping = useRef(false);

  // Load history
  const loadHistory = useCallback(() => {
    setLoading(true);
    axiosInstance
      .get(`/api/v1/group-chat/${groupId}/messages?skip=0&limit=${LIMIT}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMessages(res.data.messages))
      .catch(() => toast.error("Không thể tải lịch sử chat"))
      .finally(() => setLoading(false));
  }, [groupId, token]);

  // Connect websocket
  useEffect(() => {
    let socket: WebSocket | null = null;
    let closedByUser = false;
    function connect() {
      socket = new WebSocket(WS_URL(groupId, token));
      setWs(socket);
      setConnected(false);
      socket.onopen = () => {
        setConnected(true);
      };
      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "group_message") {
            setMessages((prev) => [...prev, msg.data]);
          } else if (msg.type === "typing_indicator") {
            setTypingUsers((prev) => {
              if (msg.user_id === currentUserId) return prev;
              if (msg.is_typing) {
                if (!prev.includes(msg.user_id)) return [...prev, msg.user_id];
                return prev;
              } else {
                return prev.filter((id) => id !== msg.user_id);
              }
            });
          } else if (msg.type === "online_members") {
            setOnlineMembers(msg.members || []);
          } else if (msg.type === "error") {
            toast.error(msg.detail || "Lỗi websocket");
          }
        } catch {
          // ignore
        }
      };
      socket.onclose = (e) => {
        setConnected(false);
        setWs(null);
        if (closedByUser) return;
        if (e.code === 4003) {
          toast.error(
            "Bạn đã bị xóa khỏi group hoặc không còn quyền truy cập."
          );
          // Optionally: redirect or close chat
          return;
        }
        // Reconnect after 2s
        reconnectTimeout.current = setTimeout(() => {
          loadHistory();
          connect();
        }, 2000);
      };
      socket.onerror = () => {
        socket?.close();
      };
    }
    connect();
    return () => {
      closedByUser = true;
      socket?.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
    // eslint-disable-next-line
  }, [groupId, token]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSend = () => {
    if (!ws || ws.readyState !== 1) return;
    const content = input.trim();
    if (!content || content.length > 1000) return;
    ws.send(JSON.stringify({ type: "send_message", content }));
    setInput("");
    sendTyping(false);
  };

  // Typing indicator logic
  const sendTyping = (typing: boolean) => {
    if (!ws || ws.readyState !== 1) return;
    ws.send(JSON.stringify({ type: "typing", is_typing: typing }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!ws || ws.readyState !== 1) return;
    if (!isTyping.current) {
      sendTyping(true);
      isTyping.current = true;
    }
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      sendTyping(false);
      isTyping.current = false;
    }, 1200);
  };

  // Show typing indicator (except self)
  const showTyping = typingUsers.length > 0;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div>Đang tải...</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.message_id}
              className={`mb-2 ${
                msg.sender_id === currentUserId ? "text-right" : ""
              }`}
            >
              <div className="inline-block px-3 py-2 rounded bg-white shadow">
                <div className="text-xs text-gray-500">
                  {msg.sender.full_name}
                </div>
                <div>{msg.content}</div>
                <div className="text-xs text-gray-400">
                  {new Date(msg.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
        {showTyping && (
          <div className="text-xs text-blue-500 italic mt-2">
            Ai đó đang nhập...
          </div>
        )}
      </div>
      <div className="p-2 border-t flex gap-2 bg-white items-center">
        <span className="text-xs text-gray-500 mr-2">
          Online: {onlineMembers.length}
        </span>
        <input
          className="flex-1 border rounded px-2 py-1"
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={connected ? "Nhập tin nhắn..." : "Đang kết nối..."}
          maxLength={1000}
          disabled={!connected || loading}
        />
        <button
          className={`bg-blue-500 text-white px-4 py-1 rounded ${
            !connected || !input.trim() || input.length > 1000
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          onClick={handleSend}
          disabled={
            !connected || !input.trim() || input.length > 1000 || loading
          }
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
