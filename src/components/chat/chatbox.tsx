import React, { useEffect, useRef, useState } from "react";
import axios from "@/lib/api/axios";

// Minimal types for chat
interface UserInfo {
  account_id: string;
  username: string;
  full_name: string;
  avatar?: string | null;
}

interface ChatMessage {
  message_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  status: string;
  created_at: string;
  sender: UserInfo;
}

interface ChatboxProps {
  currentUser: UserInfo;
  friend: UserInfo;
  token: string;
}

const WS_URL = (token: string) =>
  `${
    import.meta.env.VITE_API_WS_URL || "ws://localhost:8000"
  }/api/v1/chat/ws/chat?token=${token}`;

const Chatbox: React.FC<ChatboxProps> = ({ currentUser, friend, token }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [friendTyping, setFriendTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper to safely send data via WebSocket
  const safeSend = (data: Record<string, unknown>) => {
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify(data));
    }
  };

  // Fetch chat history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `/api/v1/chat/messages/history/${friend.account_id}?skip=0&limit=50`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Ensure messages is always an array
        const data = Array.isArray(res.data) ? res.data : [];
        setMessages(data);
      } catch {
        setMessages([]); // fallback to empty array on error
      }
    };
    fetchHistory();
  }, [friend.account_id, token]);

  // WebSocket connect
  useEffect(() => {
    let socket: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;
    function connect() {
      socket = new WebSocket(WS_URL(token));
      setWs(socket);
      socket.onopen = () => {};
      socket.onclose = () => {
        reconnectTimeout = setTimeout(connect, 2000);
      };
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("[WebSocket] event:", data); // Log mọi sự kiện để debug
        if (data.type === "new_message") {
          setMessages((prev) => [...prev, data.message]);
        } else if (data.type === "typing_indicator") {
          if (data.user_id === friend.account_id)
            setFriendTyping(data.is_typing);
        } else if (data.type === "message_read") {
          setMessages((prev) =>
            prev.map((m) =>
              m.message_id === data.message_id ? { ...m, status: "read" } : m
            )
          );
        } else if (data.type === "message_sent") {
          // Optional: cập nhật message_id thực cho tin nhắn vừa gửi (nếu muốn)
          // setMessages((prev) => prev.map(m => m.message_id === data.temp_id ? { ...m, message_id: data.message_id, status: "sent" } : m));
        }
      };
    }
    connect();
    return () => {
      socket.close();
      clearTimeout(reconnectTimeout);
    };
  }, [token, friend.account_id]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSend = () => {
    if (!input.trim()) return;
    const tempId = "temp-" + Date.now();
    safeSend({
      type: "send_message",
      receiver_id: friend.account_id,
      content: input,
      temp_id: tempId, // gửi temp_id để BE trả về nếu muốn
    });
    // Optimistic UI: append ngay tin nhắn vào messages
    setMessages((prev) => [
      ...prev,
      {
        message_id: tempId,
        sender_id: currentUser.account_id,
        receiver_id: friend.account_id,
        content: input,
        status: "sent",
        created_at: new Date().toISOString(),
        sender: currentUser,
      },
    ]);
    setInput("");
    setIsTyping(false);
  };

  // Typing indicator
  useEffect(() => {
    if (!ws) return;
    if (isTyping) {
      safeSend({
        type: "typing",
        receiver_id: friend.account_id,
        is_typing: true,
      });
      const timeout = setTimeout(() => {
        safeSend({
          type: "typing",
          receiver_id: friend.account_id,
          is_typing: false,
        });
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isTyping, ws, friend.account_id]);

  // Mark as read when window focused or new message
  useEffect(() => {
    if (!ws) return;
    const unread = messages.filter(
      (m) => m.sender_id === friend.account_id && m.status !== "read"
    );
    unread.forEach((msg) => {
      safeSend({
        type: "mark_read",
        message_id: msg.message_id,
      });
    });
  }, [messages, ws, friend.account_id]);

  return (
    <div className="max-w-md mx-auto mt-10 bg-white border rounded shadow flex flex-col h-[500px]">
      <div className="p-4 border-b text-center font-bold flex items-center gap-2">
        <img
          src={friend.avatar || "/default-profile-image.png"}
          alt={friend.full_name}
          className="w-8 h-8 rounded-full object-cover"
        />
        <span>{friend.full_name}</span>
        {friendTyping && (
          <span className="text-xs text-gray-400 ml-2">Đang nhập...</span>
        )}
      </div>
      <div className="flex-1 h-64 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.message_id}
            className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
              msg.sender_id === currentUser.account_id
                ? "ml-auto bg-blue-100 text-right"
                : "mr-auto bg-gray-100 text-left"
            }`}
          >
            {msg.content}
            <div className="text-[10px] text-gray-400 mt-1">
              {new Date(msg.created_at).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {msg.sender_id === currentUser.account_id &&
                msg.status === "read" && <span className="ml-1">✓✓</span>}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-1"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setIsTyping(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Nhập tin nhắn..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          Gửi
        </button>
      </div>
    </div>
  );
};

export default Chatbox;
