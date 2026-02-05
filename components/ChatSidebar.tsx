"use client";

import { useState } from "react";
import {
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Plus,
  Menu,
  ChevronLeft,
} from "lucide-react";

export default function ChatSidebar() {
  const [isOpen, setIsOpen] = useState(true);

  // Mock data for display
  const chats = [
    {
      id: "1",
      title: "GraphQL vs REST API",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "React Hooks Tutorial",
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "3",
      title: "Next.js Best Practices",
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative inset-y-0 left-0 z-40
           bg-slate-900 text-white
          transform transition-transform duration-300 ease-in-out
          flex flex-col
          ${isOpen ? "w-64" : "w-20  "}
        `}
      >
        {/* Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className=" m-4 top-4 left-4 z-50 w-10 h-10 bg-red-500 rounded-lg shadow-lg flex items-center justify-center hover:bg-red-300 transition-colors cursor-pointer"
          aria-label="Toggle sidebar"
        >
          {isOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
        </button>
        <div className="p-4 border-b border-slate-700">
          <button className="w-full flex items-center gap-3 px-1 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors group">
            <Plus size={18} className="text-slate-400 group-hover:text-white" />
            <span className="text-sm font-medium">{isOpen && "New Chat"}</span>
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="group relative rounded-lg transition-all hover:bg-slate-800/50"
            >
              <div className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                <MessageSquare
                  size={16}
                  className="text-slate-400 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{chat.title}</p>
                  <p className="text-xs text-slate-400">
                    {formatDate(chat.updatedAt)}
                  </p>
                </div>

                {/* Action Buttons - Show on Hover */}
                <div className="hidden group-hover:flex items-center gap-1">
                  <button
                    className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                    aria-label="Edit"
                  >
                    <Edit2 size={14} className="text-slate-400" />
                  </button>
                  <button
                    className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <div className="text-xs text-slate-400 text-center">
            {chats.length} {chats.length === 1 ? "chat" : "chats"}
          </div>
        </div>
      </div>

      {/* Overlay for Mobile */}
      {/* {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )} */}
    </>
  );
}
