import { useRef, useEffect, useMemo } from "react";
import type { Block } from "@muse/core";
import type { ImageSelection } from "@muse/media";
import { Spinner } from "@muse/editor";
import { useChat, type Message } from "../hooks/useChat";
import type { AgentState, ThemeSelection } from "../utils/streamParser";
import { TimelineModal } from "./modals/timeline";

interface ChatProps {
  onBlockParsed?: (block: Block) => void
  onThemeSelected?: (theme: ThemeSelection) => void
  onImages?: (images: ImageSelection[]) => void
}

export function Chat({ onBlockParsed, onThemeSelected, onImages }: ChatProps) {
  const options = useMemo(() => ({ onBlockParsed, onThemeSelected, onImages }), [onBlockParsed, onThemeSelected, onImages]);
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

function getAgentSummary(agent: AgentState): { label: string, value: string } | null {
  if (agent.status !== "complete") return null;

  switch (agent.name) {
    case "brief":
      return agent.summary ? { label: "Audience", value: agent.summary } : null;
    case "structure":
      if (agent.data?.blockCount) {
        const types = agent.data.blockTypes?.join(", ") ?? "";
        return { label: "Layout", value: `${agent.data.blockCount} sections: ${types}` };
      }
      return null;
    case "theme":
      if (agent.data?.palette) {
        const value = `${agent.data.palette}${agent.data.typography ? ` + ${agent.data.typography}` : ""}`;
        return { label: "Theme", value };
      }
      return null;
    case "copy":
      return agent.data?.blockCount
        ? { label: "Content", value: `${agent.data.blockCount} blocks written` }
        : null;
    case "image":
      if (agent.data?.resolved !== undefined) {
        return { label: "Images", value: `${agent.data.resolved} found` };
      }
      return null;
    default:
      return null;
  }
}

function MessageBubble({ message, isLast, isLoading, agents }: MessageBubbleProps) {
  const isAssistant = message.role === "assistant";
  const showTimeline = isAssistant && isLast && (agents.length > 0 || isLoading);
  const completedAgents = agents.filter(a => a.status === "complete");

  // Show agent summaries when loading, or message content when available
  const showAgentSummaries = showTimeline && !message.content && completedAgents.length > 0;

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
        {showAgentSummaries
          ? (
            <div className="p-3 text-sm text-text-muted space-y-1">
              {completedAgents.map((agent) => {
                const summary = getAgentSummary(agent);
                if (!summary) return null;
                return (
                  <div key={agent.name} className="muse-agent-summary flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>
                      <span className="font-medium text-text">
                        {summary.label}
                        :
                      </span>
                      {" "}
                      {summary.value}
                    </span>
                  </div>
                );
              })}
            </div>
          )
          : (
            <div className={`p-3 whitespace-pre-wrap break-words ${showTimeline && message.content ? "border-t border-border-light" : ""}`}>
              {message.content || (isLast && isLoading && agents.length === 0 ? "Generating..." : "")}
            </div>
          )}
      </div>
    </div>
  );
}

interface AgentTimelineProps {
  agents: AgentState[]
  isLoading: boolean
}

const agentDescriptions: Record<string, string> = {
  brief: "Understanding your request...",
  structure: "Planning page layout...",
  theme: "Selecting colors and fonts...",
  copy: "Writing content...",
  image: "Finding images...",
};

function AgentTimeline({ agents, isLoading }: AgentTimelineProps) {
  if (agents.length === 0 && !isLoading) return null;

  const formatDuration = (ms?: number) => ms ? `${(ms / 1000).toFixed(1)}s` : "";

  const allComplete = agents.length > 0 && agents.every(a => a.status === "complete");
  const runningAgent = agents.find(a => a.status === "running");
  const totalDuration = agents.reduce((sum, a) => sum + (a.duration ?? 0), 0);
  const themeAgent = agents.find(a => a.name === "theme");

  const trigger = (
    <button className="text-primary hover:underline ml-2">
      Details
    </button>
  );

  return (
    <div className="px-3 py-2 text-xs text-text-subtle bg-bg-subtle font-mono flex items-center gap-2">
      {allComplete
        ? (
          <>
            <span className="text-success">✓</span>
            <span>
              {agents.length}
              {" "}
              agents ·
              {formatDuration(totalDuration)}
            </span>
            {themeAgent?.data?.palette && (
              <span className="text-text-subtle">
                {themeAgent.data.palette}
                {themeAgent.data.typography && ` + ${themeAgent.data.typography}`}
              </span>
            )}
          </>
        )
        : (
          <>
            <Spinner size="sm" />
            <span>
              {runningAgent ? agentDescriptions[runningAgent.name] ?? runningAgent.name : "Starting..."}
            </span>
          </>
        )}
      <TimelineModal agents={agents} isLoading={isLoading} trigger={trigger} />
    </div>
  );
}
