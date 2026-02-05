"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";

// Type definitions for the chat interface
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  backendUrl?: string;
  botName?: string;
  placeholder?: string;
  initialMessages?: Message[];
}

export default function ChatInterface({
  backendUrl = "",
  botName = "AI Assistant",
  placeholder = "Type your message...",
  initialMessages = [],
}: ChatInterfaceProps) {
  // State variables
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streaming, setStreaming] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const contentRef = useRef("");

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  // =================================== Start chat with SSE streaming ===================================
  const startChat = (prompt: string) => {
    // Close old connection if exists
    eventSourceRef.current?.close();

    // Reset streaming content

    setStreamingContent("");
    contentRef.current = ""; // Reset the ref
    setIsLoading(true);
    setStreaming(true);

    // Create new EventSource connection
    const es = new EventSource(
      `${backendUrl}/ai/chat?prompt=${encodeURIComponent(prompt)}`,
    );

    eventSourceRef.current = es;
    console.log(es);

    es.onmessage = (event) => {
      contentRef.current += event.data;
      setStreamingContent((prev) => prev + event.data);
      console.log("Received chunk:", event.data);
    };

    es.onerror = (err) => {
      es.close();

      if (err.data) {
        console.error("Stream error:", err);
      }

      const finalContent = contentRef.current;

      // If no content was streamed, show error message
      if (!finalContent) {
        // ACTUAL ERROR: Nothing was received
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } else {
        // SUCCESSFUL END: The server hung up after sending data
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: finalContent,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }

      // Cleanup UI
      setStreamingContent("");
      contentRef.current = "";
      setIsLoading(false);
      setStreaming(false);
    };

    // Listen for the end of stream (optional, if your backend sends this)
    // es.addEventListener("end", () => {
    //   es.close();
    //   setIsLoading(false);
    //   setStreaming(false);

    //   // Save the complete streamed message
    //   if (streamingContent) {
    //     const assistantMessage: Message = {
    //       id: (Date.now() + 1).toString(),
    //       role: "assistant",
    //       content: streamingContent,
    //       timestamp: new Date(),
    //     };
    //     setMessages((prev) => [...prev, assistantMessage]);
    //     setStreamingContent("");
    //   }
    // });
  };

  // =================================== Handle sending messages ===================================
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const promptToSend = input.trim();
    setInput("");

    // Start streaming response
    startChat(promptToSend);
  };

  // ===============================================================================================

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  // Handle stopping the stream
  const handleStopStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      setIsLoading(false);

      // Save whatever was streamed so far
      if (streamingContent) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: streamingContent,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setStreamingContent("");
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{botName}</h1>
            <p className="text-xs text-slate-500">Online</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {messages.length === 0 && !streamingContent ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                Start a conversation
              </h2>
              <p className="text-slate-500 max-w-md">
                Ask me anything! I'm here to help you with your questions.
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                        : "bg-gradient-to-br from-indigo-500 to-purple-600"
                    } shadow-md`}
                  >
                    {message.role === "user" ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`flex flex-col max-w-[75%] ${
                      message.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md"
                          : "bg-white text-slate-800 shadow-sm border border-slate-200"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 mt-1 px-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}

              {/* Streaming Message */}
              {streamingContent && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col max-w-[75%]">
                    <div className="bg-white text-slate-800 rounded-2xl px-4 py-3 shadow-sm border border-slate-200">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {streamingContent}
                      </p>
                      {streaming && (
                        <div className="flex items-center gap-1 mt-2">
                          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse delay-75" />
                          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse delay-150" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Loading Indicator (when waiting for first chunk) */}
              {isLoading && !streamingContent && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                      <span className="text-sm text-slate-600">
                        Thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3 ">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isLoading}
                rows={1}
                className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
            </div>

            {isLoading ? (
              <button
                onClick={handleStopStream}
                className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-rose-600 text-white flex items-center justify-center hover:shadow-lg transition-all  cursor-pointer"
                aria-label="Stop generating"
              >
                <div className="w-3 h-3 bg-white rounded-sm" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed  cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
