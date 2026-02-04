import { useState, useRef, useEffect } from "react";
import { useMutation, useLazyQuery } from "@apollo/client/react";
import { GET_MATE_CHATS, GET_MATE_MESSAGES } from "../graphQl/queries";

import { CREATE_MATE_CHAT } from "../graphQl/mutations";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  initialChatId?: string;
  token: string;
  backendUrl?: string; // Add base URL prop
  botName?: string;
  placeholder?: string;
}

const useChat = ({
  initialChatId,
  token,
  backendUrl = "",
}: ChatInterfaceProps) => {
  // --- State ---
  const [chatId, setChatId] = useState<string | null>(initialChatId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");

  // --- Refs ---
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamingContentRef = useRef(""); // Track streaming content

  // --- GraphQL ---
  const [createChat] = useMutation(CREATE_MATE_CHAT);
  const [loadChats] = useLazyQuery(GET_MATE_CHATS);
  const [loadHistory] = useLazyQuery(GET_MATE_MESSAGES, {
    fetchPolicy: "network-only", // Always fetch fresh data

    onCompleted: (data) => {
      if (data?.get_mate_messages?.items) {
        const history = data.get_mate_messages.items.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
        }));
        setMessages(history);
      }
    },
    onError: (error) => {
      console.error("Failed to load chat history:", error);
    },
  });

  // --- Load history on mount/chatId change ---
  useEffect(() => {
    if (chatId) {
      loadHistory({ variables: { input: { chatId } } });
    }
  }, [chatId, loadHistory]);

  // --- Auto-scroll ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // --- Streaming Logic ---
  const startStreaming = async (activeChatId: string, prompt: string) => {
    setIsLoading(true);
    setStreamingContent("");
    streamingContentRef.current = "";

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const url = `https://jb8tw1fp-5555.euw.devtunnels.ms/mate/chats/${activeChatId}/stream?message=${encodeURIComponent(prompt)}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }
      console.log(response);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = ""; // Buffer for incomplete chunks

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");

        // Keep the last incomplete line in buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const jsonStr = line.replace("data: ", "").trim();
              if (!jsonStr) continue;

              const parsed = JSON.parse(jsonStr);
              console.log("Parsed SSE:", parsed);

              if (parsed.type === "chunk" && parsed.text) {
                streamingContentRef.current += parsed.text;
                setStreamingContent(streamingContentRef.current);
              }

              if (parsed.type === "complete") {
                // Stream completed successfully
                reader.cancel();
                break;
              }

              if (parsed.type === "error") {
                throw new Error(parsed.message || "Stream error");
              }
            } catch (parseError) {
              console.warn("Failed to parse SSE line:", line, parseError);
            }
          }
        }
      }

      // Save the complete message to history
      const finalContent = streamingContentRef.current;
      if (finalContent) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: finalContent,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Stream error:", err);

        // Show error message in chat
        const errorContent =
          streamingContentRef.current || "Sorry, something went wrong.";
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: errorContent,
            timestamp: new Date(),
          },
        ]);
      }
    } finally {
      setStreamingContent("");
      streamingContentRef.current = "";
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // --- Handle Send ---
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userPrompt = input.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userPrompt,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      let currentId = chatId;

      // Step 1: Create chat if needed
      if (!currentId) {
        const { data } = await createChat({
          variables: {
            input: {
              title: userPrompt.slice(0, 50), // First 50 chars as title
            },
            context: {
              headers: {
                Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiJjNmU4MzhjYy1jZDgxLTRmYzQtODhlNy0wYTZiYzA5ZmU3ZGEiLCJ0eXBlIjoiQUNDRVNTX1RPS0VOIiwiaWF0IjoxNzcwMjA3OTg3LCJleHAiOjE3NzAyNzI3ODZ9.RWjmSWItFN6E7KVMcLX3Smg7nXtt3qyDcbPyErNoECA`,
              },
            },
          },
        });

        if (!data?.create_mate_chat?.id) {
          throw new Error("Failed to create chat");
        }

        currentId = data.create_mate_chat.id;
        setChatId(currentId);
      }

      // Step 2: Stream the response
      await startStreaming(currentId, userPrompt);
    } catch (err) {
      console.error("Failed to send message:", err);

      // Show error in chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Failed to send message. Please try again.",
          timestamp: new Date(),
        },
      ]);

      setIsLoading(false);
    }
  };

  // --- Stop Streaming ---
  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();

      // Save partial response if any
      if (streamingContentRef.current) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: streamingContentRef.current,
            timestamp: new Date(),
          },
        ]);
        setStreamingContent("");
        streamingContentRef.current = "";
      }

      setIsLoading(false);
    }
  };

  // --- Keyboard Handler ---
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- Auto-resize Textarea ---
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // --- Cleanup on Unmount ---
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    messages,
    input,
    setInput,
    isLoading,
    streamingContent,
    messagesEndRef,
    inputRef,
    handleSend,
    handleStopStream,
    handleKeyDown,
  };
};

export default useChat;
