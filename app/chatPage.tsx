"use client";

import ChatInterface from "./newChat";

export default function ChatPage() {
  return (
    <div className="h-screen">
      <ChatInterface
        initialChatId=""
        token="test-token"
        backendUrl=""
        botName="AI Assistant"
        placeholder="Type your message..."
      />
    </div>
  );
}
