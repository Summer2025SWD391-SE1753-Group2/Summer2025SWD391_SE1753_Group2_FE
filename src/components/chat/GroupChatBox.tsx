import { useEffect, useState, useRef } from "react";
import axiosInstance from "@/lib/api/axios";
import type { GroupChatMessage } from "@/types/group-chat";

interface GroupChatBoxProps {
  groupId: string;
  token: string;
  currentUserId: string;
}

const LIMIT = 50;

export default function GroupChatBox({
  groupId,
  token,
  currentUserId,
}: GroupChatBoxProps) {
  const [messages, setMessages] = useState<GroupChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get(`/api/v1/group-chat/${groupId}/messages?skip=0&limit=${LIMIT}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMessages(res.data.messages))
      .finally(() => setLoading(false));
  }, [groupId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      </div>
      {/* Gửi tin nhắn sẽ bổ sung sau */}
      <div className="p-2 border-t flex gap-2 bg-white">
        <input
          className="flex-1 border rounded px-2 py-1"
          disabled
          placeholder="Tính năng gửi tin nhắn sẽ sớm có!"
        />
        <button className="bg-blue-300 text-white px-4 py-1 rounded" disabled>
          Gửi
        </button>
      </div>
    </div>
  );
}
