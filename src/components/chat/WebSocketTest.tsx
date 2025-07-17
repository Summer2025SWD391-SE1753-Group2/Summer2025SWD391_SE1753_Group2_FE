import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WebSocketTestProps {
  groupId: string;
  token: string;
}

export default function WebSocketTest({ groupId, token }: WebSocketTestProps) {
  const [status, setStatus] = useState("Disconnected");
  const [messages, setMessages] = useState<string[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const connect = () => {
    setStatus("Connecting...");
    setMessages([]);

    // Generate WebSocket URL based on environment
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const wsHost = import.meta.env.VITE_API_URL || "http://54.169.148.165:8000";
    const host = wsHost.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const testUrl = `${proto}://${host}/api/v1/group-chat/ws/group/${groupId}?token=${token}`;
    console.log("Testing WebSocket URL:", testUrl);

    const websocket = new WebSocket(testUrl);

    websocket.onopen = () => {
      setStatus("Connected");
      setMessages((prev) => [...prev, "✅ WebSocket connected successfully"]);
    };

    websocket.onmessage = (event) => {
      const message = `📨 Received: ${event.data}`;
      setMessages((prev) => [...prev, message]);
      console.log("WebSocket message:", event.data);
    };

    websocket.onclose = (event) => {
      setStatus(`Closed (${event.code})`);
      setMessages((prev) => [
        ...prev,
        `❌ Connection closed: ${event.code} - ${event.reason}`,
      ]);
    };

    websocket.onerror = (error) => {
      setStatus("Error");
      setMessages((prev) => [...prev, "❌ WebSocket error occurred"]);
      console.error("WebSocket error:", error);
    };

    setWs(websocket);
  };

  const disconnect = () => {
    if (ws) {
      ws.close();
      setWs(null);
      setStatus("Disconnected");
    }
  };

  const sendTestMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const testMessage = {
        type: "send_message",
        content: "Test message from WebSocketTest component",
      };
      ws.send(JSON.stringify(testMessage));
      setMessages((prev) => [
        ...prev,
        `📤 Sent: ${JSON.stringify(testMessage)}`,
      ]);
    }
  };

  useEffect(() => {
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [ws]);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          WebSocket Test
          <span
            className={`px-2 py-1 rounded text-xs ${
              status === "Connected"
                ? "bg-green-100 text-green-800"
                : status === "Connecting..."
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {status}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={connect} disabled={status === "Connecting..."}>
            Connect
          </Button>
          <Button onClick={disconnect} variant="outline" disabled={!ws}>
            Disconnect
          </Button>
          <Button onClick={sendTestMessage} disabled={status !== "Connected"}>
            Send Test Message
          </Button>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Connection Info:</h4>
          <div className="text-sm space-y-1">
            <p>
              <strong>Group ID:</strong> {groupId}
            </p>
            <p>
              <strong>Token:</strong> {token.substring(0, 20)}...
            </p>
            <p>
              <strong>Test URL:</strong>{" "}
              {(() => {
                const proto =
                  window.location.protocol === "https:" ? "wss" : "ws";
                const wsHost =
                  import.meta.env.VITE_API_URL || "http://54.169.148.165:8000";
                const host = wsHost
                  .replace(/^https?:\/\//, "")
                  .replace(/\/$/, "");
                return `${proto}://${host}/api/v1/group-chat/ws/group/${groupId}?token=...`;
              })()}
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Messages:</h4>
          <div className="max-h-64 overflow-y-auto space-y-1 border rounded p-2 bg-gray-50">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-sm">No messages yet</p>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className="text-sm font-mono">
                  {msg}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="text-xs text-gray-500">
          <p>
            <strong>Note:</strong> Check browser console for detailed WebSocket
            logs
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
