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
            token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiI3NmIwOWVmNS1mNjdlLTQ3NmYtYTQzMy05NDg1ODE0OGZlNDIiLCJ0eXBlIjoiQUNDRVNTX1RPS0VOIiwiaWF0IjoxNzcwNDc3Mzg4LCJleHAiOjE3NzA1NDIxODd9.NAkak1U5vk60oXq3YEGNKTU_EjvZcOl5r1jHhYz1Ftw"
            backendUrl=""
            placeholder="Type your message..."
          />
        </div>
      </div>
    </div>
  );
}
