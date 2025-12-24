import { useRef, useEffect } from "react";
import { useChat, type Message } from "../hooks/useChat";

interface ChatProps {
  onInsert?: (text: string) => void
}

export function Chat({ onInsert }: ChatProps) {
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

  return (
    <div className="muse-chat">
      <div className="muse-chat-messages">
        {messages.length === 0 && (
          <div className="muse-chat-empty">
            Start a conversation...
          </div>
        )}
        {messages.map((message, i) => (
          <MessageBubble
            key={i}
            message={message}
            onInsert={onInsert}
            isLast={i === messages.length - 1}
            isLoading={isLoading}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="muse-chat-input-container">
        <textarea
          className="muse-chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={3}
          disabled={isLoading}
        />
        <button
          className="muse-chat-send"
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
  onInsert?: (text: string) => void
  isLast: boolean
  isLoading: boolean
}

function MessageBubble({ message, onInsert, isLast, isLoading }: MessageBubbleProps) {
  const isAssistant = message.role === "assistant";
  const showInsert = isAssistant && onInsert && !(isLast && isLoading);

  return (
    <div className={`muse-chat-message muse-chat-message-${message.role}`}>
      <div className="muse-chat-message-role">
        {isAssistant ? "AI" : "You"}
      </div>
      <div className="muse-chat-message-content">
        {message.content || (isLoading ? "..." : "")}
      </div>
      {showInsert && (
        <button
          className="muse-chat-insert"
          onClick={() => onInsert(message.content)}
        >
          Insert to editor
        </button>
      )}
    </div>
  );
}
