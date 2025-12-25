import { useRef, useEffect, useMemo, useState } from "react";
import type { Block } from "@muse/core";
import { useChat, type Message } from "../hooks/useChat";
import type { AgentState } from "../utils/streamParser";

interface ChatProps {
  onBlockParsed?: (block: Block, theme?: string) => void
}

export function Chat({ onBlockParsed }: ChatProps) {
  const options = useMemo(() => ({ onBlockParsed }), [onBlockParsed]);
  const { messages, input, setInput, isLoading, send, sessionUsage, lastUsage, agents } = useChat(options);
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
            agents={i === messages.length - 1 && message.role === "assistant" ? agents : []}
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
  agents: AgentState[]
}

function MessageBubble({ message, isLast, isLoading, agents }: MessageBubbleProps) {
  const isAssistant = message.role === "assistant";
  const showTimeline = isAssistant && isLast && (agents.length > 0 || isLoading);

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
        {showTimeline && <AgentTimeline agents={agents} isLoading={isLoading} />}
        <div className={`p-3 whitespace-pre-wrap break-words ${showTimeline && message.content ? "border-t border-border-light" : ""}`}>
          {message.content || (isLast && isLoading && agents.length === 0 ? "Generating..." : "")}
        </div>
      </div>
    </div>
  );
}

interface AgentTimelineProps {
  agents: AgentState[]
  isLoading: boolean
}

function AgentTimeline({ agents, isLoading }: AgentTimelineProps) {
  const [expanded, setExpanded] = useState(false);

  if (agents.length === 0 && !isLoading) return null;

  const formatDuration = (ms?: number) => ms ? `${(ms / 1000).toFixed(1)}s` : "";

  const allComplete = agents.length > 0 && agents.every(a => a.status === "complete");
  const totalDuration = agents.reduce((sum, a) => sum + (a.duration ?? 0), 0);

  // auto-expand while loading, collapse when done (unless user expanded)
  const showExpanded = isLoading || expanded;

  // collapsed view when all complete
  if (!showExpanded && allComplete) {
    const themeAgent = agents.find(a => a.name === "theme");
    return (
      <div
        onClick={() => setExpanded(true)}
        className="px-3 py-2 text-xs text-text-subtle bg-bg-subtle font-mono cursor-pointer hover:bg-bg-subtle/80"
      >
        <span className="text-success">✓</span>
        {" "}
        {agents.length}
        {" "}
        agents
        {" · "}
        {formatDuration(totalDuration)}
        {themeAgent?.data?.palette && (
          <span className="ml-2 text-text-subtle">
            {themeAgent.data.palette}
            {themeAgent.data.typography && ` + ${themeAgent.data.typography}`}
          </span>
        )}
      </div>
    );
  }

  // check if structure and theme ran in parallel
  const structureAgent = agents.find(a => a.name === "structure");
  const themeAgent = agents.find(a => a.name === "theme");
  const isParallel = structureAgent && themeAgent;

  return (
    <div
      className="px-3 py-2 text-xs text-text-subtle bg-bg-subtle font-mono cursor-pointer"
      onClick={() => allComplete && setExpanded(false)}
    >
      {agents.map((agent, i) => {
        const isComplete = agent.status === "complete";
        const isRunning = agent.status === "running";

        // skip theme if we're showing it with structure
        if (agent.name === "theme" && isParallel) return null;

        // show structure + theme together if parallel
        if (agent.name === "structure" && isParallel) {
          return (
            <div key={i} className="flex items-start gap-2 py-0.5">
              <span className="text-text-subtle">├─</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {isComplete
                    ? <span className="text-success">●</span>
                    : <span className="animate-pulse text-warning">◐</span>}
                  <span>Structure</span>
                  {structureAgent?.duration && (
                    <span className="text-text-subtle">
                      (
                      {formatDuration(structureAgent.duration)}
                      )
                    </span>
                  )}
                  <span className="text-text-subtle">─┐</span>
                  {structureAgent?.data?.blockCount !== undefined && (
                    <span className="text-text-subtle">
                      (
                      {structureAgent.data.blockCount}
                      {" "}
                      blocks)
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        }

        // show theme completion after structure in parallel view
        if (agent.name === "copy" && isParallel && themeAgent) {
          return (
            <div key={i}>
              <div className="flex items-center gap-2 py-0.5">
                <span className="text-text-subtle">├─</span>
                {themeAgent.status === "complete"
                  ? <span className="text-success">●</span>
                  : <span className="animate-pulse text-warning">◐</span>}
                <span>Theme</span>
                {themeAgent.duration && (
                  <span className="text-text-subtle">
                    (
                    {formatDuration(themeAgent.duration)}
                    )
                  </span>
                )}
                <span className="text-text-subtle">─┘</span>
                {themeAgent.data?.palette && (
                  <span className="text-text-subtle">
                    →
                    {themeAgent.data.palette}
                    {themeAgent.data.typography && ` + ${themeAgent.data.typography}`}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 py-0.5">
                <span className="text-text-subtle">└─</span>
                {isComplete
                  ? <span className="text-success">●</span>
                  : <span className="animate-pulse text-warning">◐</span>}
                <span>Copy</span>
                {agent.duration && (
                  <span className="text-text-subtle">
                    (
                    {formatDuration(agent.duration)}
                    )
                  </span>
                )}
              </div>
            </div>
          );
        }

        return (
          <div key={i} className="flex items-center gap-2 py-0.5">
            <span className="text-text-subtle">{i === agents.length - 1 ? "└─" : "├─"}</span>
            {isComplete
              ? <span className="text-success">●</span>
              : isRunning
                ? <span className="animate-pulse text-warning">◐</span>
                : <span className="text-text-subtle">○</span>}
            <span className="capitalize">{agent.name}</span>
            {agent.duration && (
              <span className="text-text-subtle">
                (
                {formatDuration(agent.duration)}
                )
              </span>
            )}
            {agent.summary && (
              <span className="text-text-subtle truncate max-w-xs">
                →
                {agent.summary}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
