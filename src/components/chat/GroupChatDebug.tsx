import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GroupChatDebugProps {
  groupId: string;
  token: string;
}

export default function GroupChatDebug({
  groupId,
  token,
}: GroupChatDebugProps) {
  const [wsStatus, setWsStatus] = useState<string>("Disconnected");
  const [wsUrl, setWsUrl] = useState<string>("");
  const [lastError, setLastError] = useState<string>("");
  const [messages, setMessages] = useState<
    Array<{ timestamp: string; data?: unknown; raw?: string }>
  >([]);

  useEffect(() => {
    // Generate WebSocket URL
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const wsHost =
      import.meta.env.VITE_WS_URL ||
      import.meta.env.VITE_API_URL ||
      "localhost:8000";
    const url = `${proto}://${wsHost}/api/v1/group-chat/ws/group/${groupId}?token=${token}`;
    setWsUrl(url);

    // Test WebSocket connection
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setWsStatus("Connected");
      setLastError("");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [
          ...prev,
          { timestamp: new Date().toISOString(), data },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { timestamp: new Date().toISOString(), raw: event.data },
        ]);
      }
    };

    ws.onclose = (event) => {
      setWsStatus(`Closed (${event.code})`);
      if (event.code !== 1000) {
        setLastError(
          `Connection closed with code ${event.code}: ${event.reason}`
        );
      }
    };

    ws.onerror = () => {
      setWsStatus("Error");
      setLastError("WebSocket connection error");
    };

    return () => {
      ws.close();
    };
  }, [groupId, token]);

  const testConnection = () => {
    setMessages([]);
    setWsStatus("Connecting...");
    setLastError("");

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setWsStatus("Connected");
      setLastError("");
      // Send a test message
      ws.send(
        JSON.stringify({
          type: "send_message",
          content: "Test message from debug component",
        })
      );
    };

    ws.onclose = (event) => {
      setWsStatus(`Closed (${event.code})`);
      setLastError(`Connection closed with code ${event.code}`);
    };

    ws.onerror = () => {
      setWsStatus("Error");
      setLastError("Failed to connect");
    };
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Group Chat Debug
          <Badge variant={wsStatus === "Connected" ? "default" : "destructive"}>
            {wsStatus}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Connection Info:</h4>
          <div className="text-sm space-y-1">
            <p>
              <strong>Group ID:</strong> {groupId}
            </p>
            <p>
              <strong>WebSocket URL:</strong>{" "}
              <code className="bg-gray-100 px-1 rounded">{wsUrl}</code>
            </p>
            <p>
              <strong>Environment:</strong>
            </p>
            <ul className="ml-4 space-y-1">
              <li>VITE_WS_URL: {import.meta.env.VITE_WS_URL || "Not set"}</li>
              <li>VITE_API_URL: {import.meta.env.VITE_API_URL || "Not set"}</li>
              <li>Protocol: {window.location.protocol}</li>
            </ul>
          </div>
        </div>

        {lastError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <h4 className="font-semibold text-red-800 mb-1">Last Error:</h4>
            <p className="text-red-700 text-sm">{lastError}</p>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold">Messages ({messages.length}):</h4>
            <Button size="sm" onClick={testConnection}>
              Test Connection
            </Button>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-sm">No messages received</p>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                  <div className="text-gray-500 text-xs">{msg.timestamp}</div>
                  <pre className="mt-1 text-xs overflow-x-auto">
                    {JSON.stringify(msg.data || msg.raw, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
