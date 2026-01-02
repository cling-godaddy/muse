import { useRef, useEffect, useMemo } from "react";
import type { Section } from "@muse/core";
import type { ImageSelection } from "@muse/media";
import { Spinner } from "@muse/editor";
import { useChat, type Message } from "../hooks/useChat";
import type { AgentState, ThemeSelection } from "../utils/streamParser";
import { TimelineModal } from "./modals/timeline";

interface ChatProps {
  onSectionParsed?: (section: Section) => void
  onThemeSelected?: (theme: ThemeSelection) => void
  onImages?: (images: ImageSelection[]) => void
}

export function Chat({ onSectionParsed, onThemeSelected, onImages }: ChatProps) {
  const options = useMemo(() => ({ onSectionParsed, onThemeSelected, onImages }), [onSectionParsed, onThemeSelected, onImages]);
  const { messages, input, setInput, isLoading, error, send, sessionUsage, lastUsage, agents } = useChat(options);
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
            Ask AI to generate sections...
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
        {error && (
          <div className="mb-4 p-3 rounded-lg border border-red-300 bg-red-50 text-red-700 text-sm">
            <span className="font-medium">Error:</span>
            {" "}
            {error}
          </div>
        )}
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

function getAgentSummary(agent: AgentState): string | null {
  if (agent.status !== "complete") return null;
  const persona = agentPersonas[agent.name];
  if (!persona) return null;

  switch (agent.name) {
    case "brief":
      return agent.summary ? `Targeting ${agent.summary}` : null;
    case "structure":
      if (agent.data?.sectionCount) {
        const types = agent.data.sectionTypes?.join(" → ") ?? "";
        return `Designed ${agent.data.sectionCount} sections: ${types}`;
      }
      return null;
    case "theme":
      if (agent.data?.palette) {
        return `Selected ${agent.data.palette} colors${agent.data.typography ? ` with ${agent.data.typography} typography` : ""}`;
      }
      return null;
    case "copy":
      return agent.data?.sectionCount
        ? `Wrote content for ${agent.data.sectionCount} sections`
        : null;
    case "image":
      if (agent.data?.resolved !== undefined) {
        return `Curated ${agent.data.resolved} images`;
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
                const persona = agentPersonas[agent.name];
                if (!summary || !persona) return null;
                return (
                  <div key={agent.name} className="muse-agent-summary flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>
                      <span className="font-medium text-text">
                        {persona.title}
                        :
                      </span>
                      {" "}
                      {summary}
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

interface AgentPersona {
  title: string
  running: string
}

const agentPersonas: Record<string, AgentPersona> = {
  brief: { title: "Brand Strategist", running: "Researching your target audience..." },
  structure: { title: "Page Architect", running: "Designing your page layout..." },
  theme: { title: "Visual Designer", running: "Selecting your color palette..." },
  copy: { title: "Copywriter", running: "Crafting your headlines and content..." },
  image: { title: "Art Curator", running: "Curating images for your page..." },
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
            {runningAgent
              ? (
                <span>
                  <span className="font-medium">
                    {agentPersonas[runningAgent.name]?.title}
                    :
                  </span>
                  {" "}
                  {agentPersonas[runningAgent.name]?.running ?? "Working..."}
                </span>
              )
              : <span>Starting...</span>}
          </>
        )}
      <TimelineModal agents={agents} isLoading={isLoading} trigger={trigger} />
    </div>
  );
}
