import { Menu, Search, SquarePen, EllipsisVertical } from "lucide-react";
import React from "react";

const chats = [
  { id: "1", title: "HTML Nesting Causes React Hydration" },
  { id: "2", title: "Understanding JavaScript Closures" },
  {
    id: "3",
    title:
      "CSS Grid vs Flexbox: When to Use Which A Guide to Responsive Web Design",
  },
  { id: "4", title: "A Guide to Responsive Web Design" },
  { id: "5", title: "Improving Web Accessibility" },
];

const Aside = () => {
  return (
    <div className="h-screen flex-1 bg-gray-800 flex flex-col p-6 gap-8 text-white">
      <>
        <div className="header w-full flex items-center justify-between px-2">
          <div className="p-2 hover:bg-blue-900/90 rounded-full cursor-pointer">
            <Menu className="w-5 h-5 text-white " />
          </div>
          <div className="p-2 hover:bg-blue-900/90 rounded-full cursor-pointer">
            <Search className="w-5 h-5 text-white " />
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3 py-2 px-2 rounded-lg cursor-pointer hover:bg-gray-600 transition-all">
          <SquarePen className="w-5 h-5 text-white cursor-pointer" />
          <span className="text-white">New Chat</span>
        </div>
      </>
      <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
        <div className="text-xl font-semibold px-2">Chats</div>

        <div className="flex flex-col">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="chat-link px-2 py-1 flex items-center justify-between w-full hover:bg-blue-700/70 cursor-pointer rounded-2xl transition-all"
            >
              <p className="text-sm m-0 text-white no-wrap whitespace-nowrap">
                {chat.title.length > 30
                  ? chat.title.slice(0, 30) + "..."
                  : chat.title}
              </p>
              <div className="p-2 hover:bg-blue-900/90 rounded-full cursor-pointer">
                <EllipsisVertical className="w-5 h-5 text-white " />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Aside;
