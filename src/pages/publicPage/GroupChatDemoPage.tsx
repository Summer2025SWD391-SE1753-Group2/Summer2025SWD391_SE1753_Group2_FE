import { useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { authService } from "@/services/auth/authService";
import GroupChatContainer from "@/components/chat/GroupChatContainer";
import GroupChatDebug from "@/components/chat/GroupChatDebug";
import WebSocketTest from "@/components/chat/WebSocketTest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GroupChatDemoPage() {
  const { user } = useAuthStore();
  const token = authService.getToken();
  const [groupId, setGroupId] = useState("demo-group-123");
  const [customGroupId, setCustomGroupId] = useState("");
  const [showDebug, setShowDebug] = useState(false);
  const [showWebSocketTest, setShowWebSocketTest] = useState(false);

  if (!user || !token) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Vui lòng đăng nhập</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Bạn cần đăng nhập để sử dụng group chat.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleJoinGroup = () => {
    if (customGroupId.trim()) {
      setGroupId(customGroupId.trim());
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Group Chat Demo</h1>
        <p className="text-gray-600 mb-4">
          Demo group chat với WebSocket realtime. Nhập group ID để tham gia hoặc
          sử dụng group demo mặc định.
        </p>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Nhập Group ID..."
            value={customGroupId}
            onChange={(e) => setCustomGroupId(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={handleJoinGroup} disabled={!customGroupId.trim()}>
            Tham gia Group
          </Button>
          <Button variant="outline" onClick={() => setShowDebug(!showDebug)}>
            {showDebug ? "Ẩn" : "Hiện"} Debug
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowWebSocketTest(!showWebSocketTest)}
          >
            {showWebSocketTest ? "Ẩn" : "Hiện"} WebSocket Test
          </Button>
        </div>

        <div className="text-sm text-gray-500">
          <p>
            Group ID hiện tại:{" "}
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              {groupId}
            </span>
          </p>
          <p>
            User ID:{" "}
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              {user.account_id}
            </span>
          </p>
        </div>
      </div>

      {showDebug && (
        <div className="mb-6">
          <GroupChatDebug groupId={groupId} token={token} />
        </div>
      )}

      {showWebSocketTest && (
        <div className="mb-6">
          <WebSocketTest groupId={groupId} token={token} />
        </div>
      )}

      <div className="h-[600px]">
        <GroupChatContainer
          groupId={groupId}
          token={token}
          currentUserId={user.account_id}
          groupName={`Demo Group - ${groupId}`}
          groupDescription="Group chat demo với WebSocket realtime"
        />
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Hướng dẫn sử dụng:</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Mở nhiều tab để test chat giữa các user</li>
          <li>• Gõ tin nhắn để test typing indicator</li>
          <li>• Thử ngắt kết nối mạng để test reconnect</li>
          <li>• Scroll lên để load thêm tin nhắn cũ</li>
        </ul>
      </div>
    </div>
  );
}
