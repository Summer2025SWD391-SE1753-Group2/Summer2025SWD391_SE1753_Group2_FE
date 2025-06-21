import React, { useState } from "react";

const ChatUITest = () => {
  const [messages, setMessages] = useState([
    { sender: "user", text: "Chào bạn!" },
    { sender: "bot", text: "Xin chào, bạn cần gì?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() === "") return;
    setMessages([...messages, { sender: "user", text: input }]);
    setInput("");
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white border rounded shadow">
      <div className="p-4 border-b text-center font-bold">💬 Chat UI Test</div>
      <div className="h-64 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[80%] px-3 py-2 rounded-lg ${
              msg.sender === "user"
                ? "ml-auto bg-blue-100 text-right"
                : "mr-auto bg-gray-100 text-left"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="p-4 border-t flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
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

export default ChatUITest;
