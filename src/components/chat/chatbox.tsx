import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "@/lib/api/axios";
import { Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

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
  // Lưu lịch sử chat riêng cho từng bạn
  const [chatHistory, setChatHistory] = useState<{
    [friendId: string]: ChatMessage[];
  }>({});
  const [input, setInput] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [friendTyping, setFriendTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const LIMIT = 20;
  const currentFriendId = friend.account_id;
  const messages = chatHistory[currentFriendId] || [];
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchSkip, setSearchSkip] = useState(0);
  const SEARCH_LIMIT = 10;
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Helper to safely send data via WebSocket
  const safeSend = (data: Record<string, unknown>) => {
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify(data));
    }
  };

  // Reset state khi đổi bạn chat
  useEffect(() => {
    setHasMore(true);
    setTotal(0);
    setLoading(true);
  }, [currentFriendId, token]);

  // Fetch chat history (lấy mới nhất, skip=0)
  useEffect(() => {
    setLoading(true);
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `/api/v1/chat/messages/history/${currentFriendId}?skip=0&limit=${LIMIT}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        let data: ChatMessage[] = [];
        let totalCount = 0;
        if (Array.isArray(res.data)) {
          data = res.data;
        } else if (res.data && Array.isArray(res.data.data)) {
          data = res.data.data;
        } else if (res.data && Array.isArray(res.data.messages)) {
          data = res.data.messages;
          totalCount = res.data.total || 0;
        }
        setChatHistory((prev) => ({ ...prev, [currentFriendId]: data }));
        setTotal(totalCount || data.length);
        setHasMore((totalCount || data.length) > data.length);
      } catch {
        setChatHistory((prev) => ({ ...prev, [currentFriendId]: [] }));
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [currentFriendId, token]);

  // Lazy load: lấy thêm tin nhắn cũ khi scroll lên đầu
  const fetchMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await axios.get(
        `/api/v1/chat/messages/history/${currentFriendId}?skip=${messages.length}&limit=${LIMIT}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      let data: ChatMessage[] = [];
      let totalCount = total;
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (res.data && Array.isArray(res.data.messages)) {
        data = res.data.messages;
        totalCount = res.data.total || total;
      }
      // Nếu API trả về mới nhất trước (descending), reverse lại
      if (
        data.length > 1 &&
        new Date(data[0].created_at) > new Date(data[1].created_at)
      ) {
        data = data.reverse();
      }
      // Loại bỏ trùng message_id
      const existingIds = new Set(messages.map((m) => m.message_id));
      const uniqueData = data.filter((m) => !existingIds.has(m.message_id));
      setChatHistory((prev) => ({
        ...prev,
        [currentFriendId]: [...uniqueData, ...(prev[currentFriendId] || [])],
      }));
      setHasMore(
        (totalCount || messages.length) > messages.length + uniqueData.length
      );
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, currentFriendId, token, messages, total]);

  // Xử lý scroll: nếu scroll lên đầu thì load thêm
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    if (top === 0 && hasMore && !loadingMore && !loading) {
      fetchMore();
    }
  };

  // Scroll to bottom on new message (chỉ khi load mới, không phải khi load thêm)
  useEffect(() => {
    if (!loadingMore) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loadingMore]);

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
          setChatHistory((prev) => ({
            ...prev,
            [currentFriendId]: [...(prev[currentFriendId] || []), data.message],
          }));
        } else if (data.type === "typing_indicator") {
          if (data.user_id === friend.account_id)
            setFriendTyping(data.is_typing);
        } else if (data.type === "message_read") {
          setChatHistory((prev) => ({
            ...prev,
            [currentFriendId]: (prev[currentFriendId] || []).map((m) =>
              m.message_id === data.message_id ? { ...m, status: "read" } : m
            ),
          }));
        } else if (data.type === "message_sent") {
          // Optional: cập nhật message_id thực cho tin nhắn vừa gửi (nếu muốn)
        }
      };
    }
    connect();
    return () => {
      socket.close();
      clearTimeout(reconnectTimeout);
    };
  }, [token, currentFriendId, friend.account_id]);

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
    setChatHistory((prev) => ({
      ...prev,
      [currentFriendId]: [
        ...(prev[currentFriendId] || []),
        {
          message_id: tempId,
          sender_id: currentUser.account_id,
          receiver_id: friend.account_id,
          content: input,
          status: "sent",
          created_at: new Date().toISOString(),
          sender: currentUser,
        },
      ],
    }));
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

  // Sort lại tin nhắn theo thời gian tăng dần trước khi render
  const sortedMessages = [...messages].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  // Tìm tin nhắn cuối cùng của mình trong sortedMessages
  const lastMyMsg = [...sortedMessages]
    .reverse()
    .find((m) => m.sender_id === currentUser.account_id);

  const handleSearchMessages = async (keyword: string, skip = 0) => {
    setSearchLoading(true);
    setSearchError(null);
    try {
      const res = await axios.get(
        `/api/v1/chat/messages/search/${currentFriendId}?keyword=${encodeURIComponent(
          keyword
        )}&skip=${skip}&limit=${SEARCH_LIMIT}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      let data: ChatMessage[] = [];
      if (Array.isArray(res.data)) data = res.data;
      else if (res.data && Array.isArray(res.data.data)) data = res.data.data;
      else if (res.data && Array.isArray(res.data.messages))
        data = res.data.messages;
      setSearchResults(skip === 0 ? data : [...searchResults, ...data]);
      setSearchSkip(skip + data.length);
    } catch {
      setSearchError("Lỗi khi tìm kiếm tin nhắn");
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="max-w-4xl w-full md:w-4/5 mx-auto my-8 bg-white border rounded-2xl shadow-2xl flex flex-col h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b flex items-center gap-3 bg-gradient-to-r from-orange-100 to-orange-50 rounded-t-2xl">
          <img
            src={friend.avatar || "/default-profile-image.png"}
            alt={friend.full_name}
            className="w-10 h-10 rounded-full object-cover border"
          />
          <div className="flex-1">
            <div className="font-bold text-lg">{friend.full_name}</div>
            <div className="text-xs text-gray-500">@{friend.username}</div>
          </div>
          {friendTyping && (
            <span className="text-xs text-blue-500 animate-pulse">
              Đang nhập...
            </span>
          )}
          {/* Settings button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 rounded-full hover:bg-orange-200 transition"
                title="Cài đặt chat"
              >
                <Settings className="w-6 h-6" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => {
                  setSearchOpen(true);
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }}
              >
                Tìm kiếm tin nhắn
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                Cài đặt (coming soon)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Body */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-2 bg-gray-50"
          onScroll={handleScroll}
          style={{ scrollBehavior: "smooth" }}
        >
          {loading ? (
            <div className="text-center text-gray-400 mt-10">
              Đang tải tin nhắn...
            </div>
          ) : (
            <>
              {hasMore && !loading && (
                <div className="text-center text-xs text-gray-400 mb-2">
                  {loadingMore ? "Đang tải thêm..." : "Kéo lên để xem thêm"}
                </div>
              )}
              {!hasMore && messages.length > 0 && (
                <div className="text-center text-xs text-gray-400 mb-2">
                  Đã hết lịch sử
                </div>
              )}
              {messages.length === 0 && !loading && (
                <div className="text-center text-gray-400 mt-10">
                  Chưa có tin nhắn nào
                </div>
              )}
              {sortedMessages.map((msg) => {
                const isMe = msg.sender_id === currentUser.account_id;
                const isLastMyMsg =
                  lastMyMsg && msg.message_id === lastMyMsg.message_id;
                return (
                  <div
                    key={msg.message_id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {!isMe && (
                      <img
                        src={friend.avatar || "/default-profile-image.png"}
                        alt={friend.full_name}
                        className="w-8 h-8 rounded-full object-cover mr-2 self-end"
                      />
                    )}
                    <div
                      className={`max-w-[70%] flex flex-col ${
                        isMe ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`px-4 py-2 rounded-2xl shadow-sm text-sm break-words ${
                          isMe
                            ? "bg-orange-200 text-gray-900 rounded-br-md"
                            : "bg-white text-gray-900 border rounded-bl-md"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                        <span>
                          {new Date(msg.created_at).toLocaleTimeString(
                            "vi-VN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                        {/* ĐÃ XEM/CHƯA XEM kế bên giờ */}
                        {isMe &&
                          isLastMyMsg &&
                          (msg.status === "read" ? (
                            <>
                              <img
                                src={
                                  friend.avatar || "/default-profile-image.png"
                                }
                                alt={friend.full_name}
                                className="w-5 h-5 rounded-full border object-cover shadow ml-1"
                                title="Đã xem"
                              />
                              <span className="text-xs text-green-500 font-semibold ml-1">
                                Đã xem
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 ml-1">
                              Chưa xem
                            </span>
                          ))}
                      </div>
                    </div>
                    {isMe && (
                      <img
                        src={currentUser.avatar || "/default-profile-image.png"}
                        alt={currentUser.full_name}
                        className="w-8 h-8 rounded-full object-cover ml-2 self-end"
                      />
                    )}
                  </div>
                );
              })}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input */}
        <div className="p-4 border-t flex gap-2 bg-white rounded-b-2xl">
          <input
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 shadow-sm"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setIsTyping(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            onFocus={() => {
              setIsTyping(true);
            }}
            onBlur={() => {
              // Khi blur khỏi input, gửi typing:false ngay
              if (ws && ws.readyState === 1) {
                ws.send(
                  JSON.stringify({
                    type: "typing",
                    receiver_id: friend.account_id,
                    is_typing: false,
                  })
                );
              }
            }}
            placeholder="Nhập tin nhắn..."
          />
          <button
            onClick={handleSend}
            className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-2 rounded-full font-semibold shadow hover:from-orange-500 hover:to-orange-600 transition"
          >
            Gửi
          </button>
        </div>
        {/* Modal tìm kiếm tin nhắn */}
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
              <button
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-700"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchKeyword("");
                  setSearchResults([]);
                }}
              >
                ×
              </button>
              <h3 className="font-bold text-lg mb-2">
                Tìm kiếm tin nhắn với {friend.full_name}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearchMessages(searchKeyword, 0);
                }}
                className="flex gap-2 mb-4"
              >
                <input
                  ref={searchInputRef}
                  className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="Nhập từ khóa..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-orange-500 text-white px-4 py-2 rounded font-semibold"
                >
                  Tìm
                </button>
              </form>
              {searchLoading && (
                <div className="text-center text-gray-400">
                  Đang tìm kiếm...
                </div>
              )}
              {searchError && (
                <div className="text-center text-red-500">{searchError}</div>
              )}
              {!searchLoading &&
                searchResults.length === 0 &&
                searchKeyword &&
                !searchError && (
                  <div className="text-center text-gray-400">
                    Không tìm thấy tin nhắn nào
                  </div>
                )}
              <ul className="max-h-64 overflow-y-auto space-y-2">
                {searchResults.map((msg) => (
                  <li
                    key={msg.message_id}
                    className="p-2 rounded bg-gray-50 border flex flex-col"
                  >
                    <span className="text-xs text-gray-500 mb-1">
                      {new Date(msg.created_at).toLocaleString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                      })}
                    </span>
                    <span
                      className="break-words"
                      dangerouslySetInnerHTML={{
                        __html: msg.content.replace(
                          new RegExp(`(${searchKeyword})`, "gi"),
                          '<mark class="bg-yellow-200">$1</mark>'
                        ),
                      }}
                    />
                  </li>
                ))}
              </ul>
              {searchResults.length > 0 && (
                <button
                  className="mt-3 w-full text-center text-orange-600 hover:underline"
                  onClick={() =>
                    handleSearchMessages(searchKeyword, searchSkip)
                  }
                  disabled={searchLoading}
                >
                  Xem thêm
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbox;
