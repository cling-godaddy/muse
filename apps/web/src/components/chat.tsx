import { useRef, useEffect, useMemo, useState } from "react";
import type { Section } from "@muse/core";
import type { ImageSelection } from "@muse/media";
import type { Usage } from "@muse/ai";
import { Spinner } from "@muse/editor";
import { Building2, MapPin, PanelTop, Grid3x3, MousePointerClick, Quote, DollarSign, HelpCircle, Images, BarChart3, Mail, Users, Shapes, Bell, ShoppingBag, UtensilsCrossed, PanelTopOpen, PanelBottom, type LucideIcon } from "lucide-react";
import { getPalette } from "@muse/themes";

const iconMap: Record<string, LucideIcon> = {
  PanelTop, Grid3x3, MousePointerClick, Quote, DollarSign, HelpCircle, Images, BarChart3, Mail, Users, Shapes, Bell, ShoppingBag, UtensilsCrossed, PanelTopOpen, PanelBottom,
};
import { useChat, type Message, type RefineUpdate, type MoveUpdate, type SiteContext } from "../hooks/useChat";
import { useAutosaveMessages } from "../hooks/useAutosaveMessages";
import type { AgentState, ThemeSelection, PageInfo } from "../utils/streamParser";
import { TimelineModal } from "./modals/timeline";
import { CostsModal } from "./modals/costs";

interface IntakeContext {
  name?: string
  description?: string
  location?: string
}

interface ChatProps {
  /** Business context for content generation */
  siteContext?: SiteContext
  /** Current sections - enables refine mode when provided */
  sections?: Section[]
  /** Current theme - needed for refine mode to preserve palette when changing typography */
  theme?: { palette: string, typography: string }
  /** Existing costs from site for session tracking */
  siteCosts?: Usage[]
  /** Initial prompt to auto-send on mount (only if no existing messages/sections) */
  autoSendPrompt?: string
  /** Intake form data to display in chat */
  intakeContext?: IntakeContext
  onSectionParsed?: (section: Section) => void
  onThemeSelected?: (theme: ThemeSelection) => void
  onImages?: (images: ImageSelection[], sections: Section[]) => void
  onPages?: (pages: PageInfo[]) => void
  /** Called when AI refines sections */
  onRefine?: (updates: RefineUpdate[]) => void
  /** Called when backend returns updated sections from refine */
  onSectionsUpdated?: (sections: Section[]) => void
  /** Called when AI moves sections */
  onMove?: (moves: MoveUpdate[]) => void
  /** Called when user confirms delete action */
  onDelete?: (sectionId: string) => void
  /** Called when user confirms adding a section */
  onAddSection?: (sectionType: string, preset: string, index?: number) => void
  /** Called when generation (not refine) completes */
  onGenerationComplete?: () => void
  /** Called when messages change (for persistence) */
  onMessagesChange?: (messages: Message[]) => void
  /** Called when usage is tracked (for cost persistence) */
  onUsage?: (usage: Usage) => void
  /** Called with trackUsage function when chat is ready */
  onTrackUsageReady?: (trackUsage: (usage: Usage) => void) => void
  /** Called when agents state changes (for generation preview) */
  onAgentsChange?: (agents: AgentState[]) => void
}

export function Chat({ siteContext, sections, theme, siteCosts, autoSendPrompt, intakeContext, onSectionParsed, onThemeSelected, onImages, onPages, onRefine, onSectionsUpdated, onMove, onDelete, onAddSection, onGenerationComplete, onMessagesChange, onUsage, onTrackUsageReady, onAgentsChange }: ChatProps) {
  const options = useMemo(() => ({ siteContext, sections, theme, siteCosts, onSectionParsed, onThemeSelected, onImages, onPages, onRefine, onSectionsUpdated, onMove, onDelete, onAddSection, onGenerationComplete, onMessagesChange, onUsage }), [siteContext, sections, theme, siteCosts, onSectionParsed, onThemeSelected, onImages, onPages, onRefine, onSectionsUpdated, onMove, onDelete, onAddSection, onGenerationComplete, onMessagesChange, onUsage]);
  const { messages, input, setInput, isLoading, error, send, sessionUsage, agents, agentsMessageIndex, pendingAction, confirmPendingAction, cancelPendingAction, selectOption, trackUsage } = useChat(options);
  const isRefineMode = sections && sections.length > 0;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autoSendTriggeredRef = useRef(false);

  // Autosave messages after each conversation turn completes
  useAutosaveMessages(messages, isLoading);

  // expose trackUsage function to parent
  useEffect(() => {
    onTrackUsageReady?.(trackUsage);
  }, [onTrackUsageReady, trackUsage]);

  // expose agents state to parent for generation preview
  useEffect(() => {
    onAgentsChange?.(agents);
  }, [onAgentsChange, agents]);

  // auto-send initial prompt if provided and no existing content
  useEffect(() => {
    if (autoSendPrompt && !autoSendTriggeredRef.current && messages.length === 0 && !isRefineMode && !isLoading) {
      autoSendTriggeredRef.current = true;
      send(autoSendPrompt);
    }
  }, [autoSendPrompt, messages.length, isRefineMode, isLoading, send]);

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
        <CostsModal
          costs={siteCosts ?? []}
          totalCost={sessionUsage.cost}
          trigger={(
            <button className="w-full px-4 py-2 border-b border-border text-xs text-text-subtle flex items-center hover:bg-bg-subtle/80 transition-colors cursor-pointer">
              <span className="tabular-nums">
                $
                {sessionUsage.cost.toFixed(4)}
              </span>
              <span className="ml-auto text-text-subtle/60">›</span>
            </button>
          )}
        />
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
            agents={message.agents ?? (i === agentsMessageIndex ? agents : [])}
            intakeContext={i === 0 && message.role === "user" ? intakeContext : undefined}
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
      {pendingAction && (
        <div className="mx-3 mb-3 p-3 rounded-lg border border-amber-300 bg-amber-50">
          <p className="text-sm mb-3 text-amber-900">{pendingAction.message}</p>
          {pendingAction.options && pendingAction.options.length > 0
            ? (
              <div className="space-y-2">
                <div className={pendingAction.options[0]?.icon ? "grid grid-cols-2 gap-2" : "space-y-2"}>
                  {pendingAction.options.map((option) => {
                    const Icon = option.icon ? iconMap[option.icon] : null;
                    return (
                      <button
                        key={option.id}
                        className={`p-2 text-left border border-border rounded hover:bg-bg-subtle cursor-pointer ${Icon ? "flex items-center gap-2" : "w-full"}`}
                        onClick={() => selectOption(option.id)}
                        title={option.description}
                      >
                        {Icon && <Icon size={16} className="text-text-muted shrink-0" />}
                        <span className="font-medium text-sm text-text">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  className="w-full px-3 py-1.5 text-sm border border-border rounded hover:bg-bg-subtle cursor-pointer"
                  onClick={cancelPendingAction}
                >
                  Cancel
                </button>
              </div>
            )
            : (
              <div className="flex gap-2 justify-end">
                <button
                  className="px-3 py-1.5 text-sm border border-border rounded hover:bg-bg-subtle cursor-pointer"
                  onClick={cancelPendingAction}
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                  onClick={confirmPendingAction}
                >
                  {pendingAction.type === "delete_section" ? "Confirm Delete" : "Confirm"}
                </button>
              </div>
            )}
        </div>
      )}
      <div className="p-3 border-t border-border flex gap-2">
        <textarea
          className="flex-1 p-2 border border-border rounded resize-none font-sans text-sm focus:outline-none focus:border-primary"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isRefineMode ? "Ask to refine sections..." : "Describe the landing page you want..."}
          rows={3}
          disabled={isLoading}
        />
        <button
          className="px-4 py-2 bg-primary text-white border-none rounded cursor-pointer font-medium hover:bg-primary-hover disabled:bg-border disabled:cursor-not-allowed"
          onClick={() => send()}
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
  intakeContext?: IntakeContext
}

function getAgentSummary(agent: AgentState): string | null {
  if (agent.status !== "complete") return null;
  const persona = agentPersonas[agent.name];
  if (!persona) return null;

  switch (agent.name) {
    case "brief":
      return agent.summary ? `Targeting ${agent.summary}` : null;
    case "sitemap":
      return agent.data?.sectionCount
        ? `Planned ${agent.data.sectionCount} pages`
        : null;
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
    case "pages":
      return agent.data?.sectionCount
        ? `Generated ${agent.data.sectionCount} pages`
        : null;
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

function MessageBubble({ message, isLast, isLoading, agents, intakeContext }: MessageBubbleProps) {
  const isAssistant = message.role === "assistant";
  // Show timeline if this message has agents, or if loading the last message
  const showTimeline = isAssistant && (agents.length > 0 || (isLast && isLoading));
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
            <div className="muse-fade-in-stagger p-3 text-sm text-text-muted space-y-1">
              {completedAgents.map((agent) => {
                const summary = getAgentSummary(agent);
                const persona = agentPersonas[agent.name];
                if (!summary || !persona) return null;
                return (
                  <div key={agent.name} className="flex items-start gap-2">
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
              {!isAssistant && intakeContext && (
                <BusinessContextCollapsible intakeContext={intakeContext} />
              )}
            </div>
          )}
      </div>
    </div>
  );
}

function BusinessContextCollapsible({ intakeContext }: { intakeContext: IntakeContext }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mt-3 text-xs">
      <button
        type="button"
        className="cursor-pointer text-text-muted hover:text-text font-medium flex items-center gap-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}>▶</span>
        Business context
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="mt-2 p-3 bg-bg rounded-lg border border-border-light space-y-2">
            {intakeContext.name && (
              <div className="flex items-center gap-1.5">
                <Building2 size={12} className="text-text-subtle shrink-0" />
                <span className="font-medium text-text">{intakeContext.name}</span>
              </div>
            )}
            {intakeContext.location && (
              <div className="flex items-center gap-1.5">
                <MapPin size={12} className="text-text-subtle shrink-0" />
                <span className="text-text-muted">{intakeContext.location}</span>
              </div>
            )}
            {intakeContext.description && (
              <p className="text-text-muted pt-2 border-t border-border-light">
                {intakeContext.description}
              </p>
            )}
          </div>
        </div>
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
  sitemap: { title: "Site Planner", running: "Planning your site structure..." },
  structure: { title: "Page Architect", running: "Designing your page layout..." },
  theme: { title: "Visual Designer", running: "Selecting your color palette..." },
  pages: { title: "Page Builder", running: "Generating your pages..." },
  copy: { title: "Copywriter", running: "Crafting your headlines and content..." },
  image: { title: "Art Curator", running: "Curating images for your site..." },
};

function AgentTimeline({ agents, isLoading }: AgentTimelineProps) {
  if (agents.length === 0 && !isLoading) return null;

  const formatDuration = (ms?: number) => ms ? `${Math.round(ms / 1000)}s` : "";

  const allComplete = agents.length > 0 && agents.every(a => a.status === "complete");
  const runningAgent = agents.find(a => a.status === "running");
  const totalDuration = agents.reduce((sum, a) => sum + (a.duration ?? 0), 0);
  const themeAgent = agents.find(a => a.name === "theme");
  const paletteColor = themeAgent?.data?.palette
    ? getPalette(themeAgent.data.palette)?.colors.primary
    : undefined;

  const trigger = (
    <button className="muse-fade-in w-full px-3 py-2 text-xs text-text-subtle bg-bg-subtle flex items-center gap-2 hover:bg-bg-subtle/80 transition-colors cursor-pointer text-left">
      {allComplete
        ? (
          <>
            <span className="text-success">✓</span>
            <span>
              Generated in
              {` ${formatDuration(totalDuration)}`}
            </span>
            {themeAgent?.data?.palette && (
              <span className="flex items-center gap-1.5 text-text-subtle">
                {paletteColor && (
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: paletteColor }}
                  />
                )}
                <span className="capitalize">{themeAgent.data.palette}</span>
                {themeAgent.data.typography && (
                  <span className="capitalize">
                    {" + "}
                    {themeAgent.data.typography}
                  </span>
                )}
              </span>
            )}
            <span className="ml-auto text-text-subtle/60">›</span>
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
    </button>
  );

  return <TimelineModal agents={agents} isLoading={isLoading} trigger={trigger} />;
}
