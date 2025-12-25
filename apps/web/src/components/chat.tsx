import { useRef, useEffect, useMemo } from "react";
import type { Block } from "@muse/core";
import { useChat, type Message } from "../hooks/useChat";
import type { Progress } from "../utils/streamParser";

interface ChatProps {
  onBlockParsed?: (block: Block, theme?: string) => void
}

export function Chat({ onBlockParsed }: ChatProps) {
  const options = useMemo(() => ({ onBlockParsed }), [onBlockParsed]);
  const { messages, input, setInput, isLoading, send, sessionUsage, lastUsage, progress } = useChat(options);
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
    <div className="flex flex-col h-full border border-border rounded bg-bg-subtle">
      {sessionUsage.cost > 0 && (
        <div className="px-4 py-2 border-b border-border text-xs text-text-subtle flex justify-between">
          <span>
            Session: $
            {sessionUsage.cost.toFixed(4)}
            {" "}
            (
            {sessionUsage.input + sessionUsage.output}
            {" "}
            tokens)
          </span>
          {lastUsage && (
            <span>
              Last: $
              {lastUsage.cost.toFixed(4)}
              {" "}
              (
              {lastUsage.input}
              ↓
              {" "}
              {lastUsage.output}
              ↑)
            </span>
          )}
        </div>
      )}
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
            isLast={i === messages.length - 1}
            isLoading={isLoading}
            progress={i === messages.length - 1 && message.role === "assistant" ? progress : []}
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
          placeholder="Describe the landing page you want..."
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
  isLast: boolean
  isLoading: boolean
  progress: Progress[]
}

function MessageBubble({ message, isLast, isLoading, progress }: MessageBubbleProps) {
  const isAssistant = message.role === "assistant";
  const showProgress = isAssistant && isLast && (progress.length > 0 || isLoading);

  return (
    <div className="mb-4">
      <div className={`text-xs font-semibold mb-1 ${isAssistant ? "text-success" : "text-primary"}`}>
        {isAssistant ? "AI" : "You"}
      </div>
      <div
        className={`rounded-lg border overflow-hidden ${
          isAssistant
            ? "bg-bg border-border-light"
            : "bg-user-bg border-user-border"
        }`}
      >
        {showProgress && <ProgressTimeline progress={progress} isLoading={isLoading} hasContent={!!message.content} />}
        <div className={`p-3 whitespace-pre-wrap break-words ${showProgress && message.content ? "border-t border-border-light" : ""}`}>
          {message.content || (isLast && isLoading && progress.length === 0 ? "Generating..." : "")}
        </div>
      </div>
    </div>
  );
}

interface ProgressTimelineProps {
  progress: Progress[]
  isLoading: boolean
  hasContent: boolean
}

function ProgressTimeline({ progress, isLoading, hasContent }: ProgressTimelineProps) {
  if (progress.length === 0 && !isLoading) return null;

  return (
    <div className="px-3 py-2 text-xs text-text-subtle bg-bg-subtle">
      {progress.map((p, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="text-success">✓</span>
          {p.stage === "brief" && (
            <span>
              Analyzed:
              {p.data.summary}
            </span>
          )}
          {p.stage === "structure" && (
            <span>
              Planned:
              {" "}
              {p.data.blocks?.length}
              {" "}
              blocks (
              {p.data.blocks?.map(b => b.type).join(", ")}
              )
            </span>
          )}
        </div>
      ))}
      {isLoading && progress.length > 0 && !hasContent && (
        <div className="flex items-center gap-2 py-0.5">
          <span className="animate-pulse text-primary">●</span>
          <span>Writing content...</span>
        </div>
      )}
    </div>
  );
}
