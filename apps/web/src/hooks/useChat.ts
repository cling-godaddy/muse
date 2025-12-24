import { useState, useCallback } from "react";

export interface Message {
  role: "user" | "assistant"
  content: string
}

export interface UseChat {
  messages: Message[]
  input: string
  setInput: (input: string) => void
  isLoading: boolean
  send: () => Promise<void>
}

const API_URL = "http://localhost:3001/api/chat";

export function useChat(): UseChat {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const send = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages([...newMessages, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantContent += chunk;

        setMessages([
          ...newMessages,
          { role: "assistant", content: assistantContent },
        ]);
      }
    }
    catch (error) {
      console.error("Chat error:", error);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Error: Failed to get response" },
      ]);
    }
    finally {
      setIsLoading(false);
    }
  }, [input, messages, isLoading]);

  return { messages, input, setInput, isLoading, send };
}
