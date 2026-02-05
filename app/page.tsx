import Aside from "@/components/ui/Aside";
import ChatInterface from "../components/ui/Chat";
import Header from "@/components/layout/Header";

export default function Home() {
  return (
    <div className="flex">
      <Aside />
      <div className="flex-6 flex flex-col">
        <Header />
        <div className="h-screen flex w-full">
          <ChatInterface
            initialChatId=""
            token="test-token"
            backendUrl=""
            botName="AI Assistant"
            placeholder="Type your message..."
          />
        </div>
      </div>
    </div>
  );
}
