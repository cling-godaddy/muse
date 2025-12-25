import { useRef, useEffect } from "react";
import type { Block, TextBlock } from "@muse/core";
import { createBlock } from "@muse/core";
import { useChat, type Message } from "../hooks/useChat";

interface ChatProps {
  onInsertBlocks?: (blocks: Block[], themeId?: string) => void
}

export function Chat({ onInsertBlocks }: ChatProps) {
  const { messages, input, setInput, isLoading, send } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleInsert = (content: string) => {
    if (!onInsertBlocks) return;

    // try to parse as JSON blocks
    try {
      const parsed = JSON.parse(content);
      if (parsed.blocks && Array.isArray(parsed.blocks)) {
        // ensure each block has an id
        const blocks = parsed.blocks.map((b: Partial<Block>) => ({
          ...b,
          id: b.id ?? crypto.randomUUID(),
        }));
        onInsertBlocks(blocks, parsed.theme);
        return;
      }
    }
    catch {
      // not JSON, fall through to text block
    }

    // fallback: create a text block with the content
    onInsertBlocks([createBlock<TextBlock>("text", { content })]);
  };

  return (
    <div className="flex flex-col h-full border border-border rounded bg-bg-subtle">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="text-text-subtle text-center py-8">
            Ask AI to generate blocks...
          </div>
        )}
        {messages.map((message, i) => (
          <MessageBubble
            key={i}
            message={message}
            onInsert={handleInsert}
            isLast={i === messages.length - 1}
            isLoading={isLoading}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 border-t border-border flex gap-2">
        <textarea
          className="flex-1 p-2 border border-border rounded resize-none font-sans text-sm focus:outline-none focus:border-primary"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AI to generate content..."
          rows={3}
          disabled={isLoading}
        />
        <button
          className="px-4 py-2 bg-primary text-white border-none rounded cursor-pointer font-medium hover:bg-primary-hover disabled:bg-border disabled:cursor-not-allowed"
          onClick={send}
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message
  onInsert?: (content: string) => void
  isLast: boolean
  isLoading: boolean
}

function MessageBubble({ message, onInsert, isLast, isLoading }: MessageBubbleProps) {
  const isAssistant = message.role === "assistant";
  const showInsert = isAssistant && onInsert && !(isLast && isLoading);

  return (
    <div className="mb-4">
      <div className={`text-xs font-semibold mb-1 ${isAssistant ? "text-success" : "text-primary"}`}>
        {isAssistant ? "AI" : "You"}
      </div>
      <div
        className={`rounded-lg p-3 border whitespace-pre-wrap break-words ${
          isAssistant
            ? "bg-bg border-border-light"
            : "bg-user-bg border-user-border"
        }`}
      >
        {message.content || (isLoading ? "..." : "")}
      </div>
      {showInsert && (
        <button
          className="mt-2 px-2 py-1 text-xs bg-bg-muted border border-border rounded cursor-pointer hover:bg-border"
          onClick={() => onInsert(message.content)}
        >
          Insert blocks
        </button>
      )}
    </div>
  );
}
