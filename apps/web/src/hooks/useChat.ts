import { useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { sumBy } from "lodash-es";
import { getConfig } from "@muse/config";
import type { Section } from "@muse/core";
import type { Usage } from "@muse/ai";
import type { ImageSelection } from "@muse/media";
import { parseStream, type ParseState, type AgentState, type ThemeSelection, type PageInfo } from "../utils/streamParser";
import { useLatest } from "@muse/react";
import { useSiteStore } from "../stores/siteStore";

const { api } = getConfig();
const MESSAGES_URL = `${api.baseUrl}/api/messages`;

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  agents?: AgentState[]
  usage?: Usage
}

export interface RefineUpdate {
  sectionId: string
  updates: Partial<Section>
}

export interface MoveUpdate {
  sectionId: string
  direction: "up" | "down"
}

export interface PendingAction {
  type: string
  step?: string
  payload: Record<string, unknown>
  message: string
  options?: Array<{
    id: string
    label: string
    icon?: string
    description?: string
  }>
}

export interface SiteContext {
  name?: string
  description?: string
  location?: string
  siteType?: "landing" | "full"
}

export interface UseChatOptions {
  /** Business context for content generation */
  siteContext?: SiteContext
  /** Current sections - when provided, chat switches to refine mode */
  sections?: Section[]
  /** Current theme - needed for refine mode to preserve palette when changing typography */
  theme?: { palette: string, typography: string }
  /** Existing costs from site for session tracking */
  siteCosts?: Usage[]
  onSectionParsed?: (section: Section) => void
  onThemeSelected?: (theme: ThemeSelection) => void
  onImages?: (images: ImageSelection[], sections: Section[]) => void
  onPages?: (pages: PageInfo[], theme?: ThemeSelection) => void
  onUsage?: (usage: Usage) => void
  /** Called when refine returns updates to apply */
  onRefine?: (updates: RefineUpdate[]) => void
  /** Called when refine returns move operations to apply */
  onMove?: (moves: MoveUpdate[]) => void
  /** Called when refine returns updated sections from backend */
  onSectionsUpdated?: (sections: Section[]) => void
  /** Called when user confirms a pending delete action */
  onDelete?: (sectionId: string) => void
  /** Called when user confirms adding a section */
  onAddSection?: (sectionType: string, preset: string, index?: number) => void
  /** Called after generation completes */
  onGenerationComplete?: () => void
  /** Called when messages change (for persistence) */
  onMessagesChange?: (messages: Message[]) => void
}

export interface UseChat {
  messages: Message[]
  input: string
  setInput: (input: string) => void
  isLoading: boolean
  error: string | null
  send: (message?: string) => Promise<void>
  sessionUsage: Usage
  lastUsage?: Usage
  agents: AgentState[]
  /** Index of the message that owns the agents timeline */
  agentsMessageIndex: number | null
  /** Pending action awaiting user confirmation */
  pendingAction: PendingAction | null
  /** Confirm and execute the pending action */
  confirmPendingAction: () => void
  /** Cancel the pending action */
  cancelPendingAction: () => void
  /** Select an option from a multi-step pending action */
  selectOption: (optionId: string) => Promise<void>
  /** Track usage from section/item generation */
  trackUsage: (usage: Usage) => void
}

const API_URL = `${api.baseUrl}/api/chat`;
const REFINE_URL = `${api.baseUrl}/api/chat/refine`;

const emptyUsage: Usage = { input: 0, output: 0, cost: 0, model: "", timestamp: "" };

export function useChat(options: UseChatOptions = {}): UseChat {
  // Use ref to avoid stale closures when accessing options in callbacks
  const optionsRef = useLatest(options);
  const { onMessagesChange } = options;
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionUsage, setSessionUsage] = useState<Usage>(emptyUsage);
  const [lastUsage, setLastUsage] = useState<Usage | undefined>();
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [agentsMessageIndex, setAgentsMessageIndex] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const parseStateRef = useRef<ParseState>({ sections: [], pages: [], agents: new Map(), images: [] });
  const usageProcessedRef = useRef(false);
  const themeProcessedRef = useRef(false);
  const pagesProcessedRef = useRef(false);
  const loadedSiteIdRef = useRef<string | null>(null);

  // Read siteId from global state
  const siteId = useSiteStore(state => state.draft?.id);

  // Load messages when siteId changes
  useEffect(() => {
    if (!siteId || siteId === loadedSiteIdRef.current) return;

    const loadMessages = async () => {
      try {
        const token = await getToken();
        const response = await fetch(`${MESSAGES_URL}/${siteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.messages?.length > 0) {
            const loadedMessages = data.messages.map((m: { id: string, role: string, content: string, agents?: AgentState[], usage?: Usage }) => ({
              id: m.id,
              role: m.role as "user" | "assistant",
              content: m.content,
              agents: m.agents,
              usage: m.usage,
            }));
            setMessages(loadedMessages);
            // Don't set sessionUsage here - let the useEffect below be the single source of truth
          }
        }
        loadedSiteIdRef.current = siteId;
      }
      catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    loadMessages();
  }, [siteId, getToken]);

  // Single source of truth: sessionUsage = sum(site.costs)
  // message.usage is kept for debugging but not counted
  useEffect(() => {
    const costs = options.siteCosts ?? [];
    setSessionUsage({
      input: sumBy(costs, c => c.input),
      output: sumBy(costs, c => c.output),
      cost: sumBy(costs, c => c.cost),
      model: costs.at(-1)?.model ?? "",
      timestamp: costs.at(-1)?.timestamp ?? "",
    });
  }, [options.siteCosts]);

  // Notify parent when messages change
  useEffect(() => {
    onMessagesChange?.(messages);
  }, [messages, onMessagesChange]);

  const send = useCallback(async (message?: string) => {
    const content = message ?? input;
    if (!content.trim() || isLoading) return;

    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content };
    const newMessages = [...messages, userMessage];

    // Refine mode: when sections exist, use refine endpoint
    const opts = optionsRef.current;
    const isRefineMode = opts.sections && opts.sections.length > 0;

    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    // Only clear generation state when in generation mode
    if (!isRefineMode) {
      setAgents([]);
      parseStateRef.current = { sections: [], pages: [], agents: new Map(), images: [] };
      usageProcessedRef.current = false;
      themeProcessedRef.current = false;
      pagesProcessedRef.current = false;
    }

    if (isRefineMode) {
      try {
        const token = await getToken();
        const response = await fetch(REFINE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            siteId,
            sections: opts.sections,
            messages: newMessages, // Send full conversation history
            theme: opts.theme,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();

        // Handle updated sections from backend
        if (result.updatedSections?.length > 0) {
          optionsRef.current.onSectionsUpdated?.(result.updatedSections);
        }

        // Handle moves from backend
        if (result.moves?.length > 0) {
          optionsRef.current.onMove?.(result.moves);
        }

        // Handle theme updates from backend
        if (result.themeUpdate) {
          optionsRef.current.onThemeSelected?.({
            palette: result.themeUpdate.palette,
            typography: result.themeUpdate.typography,
          });
        }

        // Handle pending actions (e.g., delete confirmation)
        const hasPendingActions = result.pendingActions?.length > 0;
        if (hasPendingActions) {
          setPendingAction(result.pendingActions[0]);
        }

        // Track usage - add to site.costs (single source of truth)
        const usage = result.usage
          ? { ...result.usage, cost: result.usage.cost ?? 0, model: result.usage.model ?? "unknown" }
          : undefined;

        if (usage) {
          setLastUsage(usage);
          optionsRef.current.onUsage?.(usage);
        }

        // Skip assistant message if there are pending actions (confirmation UI handles it)
        if (!hasPendingActions) {
          const finalMessages = [
            ...newMessages,
            {
              id: crypto.randomUUID(),
              role: "assistant" as const,
              content: result.message || "Done",
              usage,
            },
          ];
          setMessages(finalMessages);
        }

        // Save site to persist costs (reuse generation complete handler)
        optionsRef.current.onGenerationComplete?.();
      }
      catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Refine error:", err);
        setError(message);
      }
      finally {
        setIsLoading(false);
      }
      return;
    }

    // Generation mode: stream from chat endpoint
    try {
      const token = await getToken();
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          siteId,
          messages: newMessages,
          stream: true,
          siteContext: optionsRef.current.siteContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let accumulated = "";
      const assistantId = crypto.randomUUID();

      setMessages([...newMessages, { id: assistantId, role: "assistant", content: "" }]);
      setAgentsMessageIndex(newMessages.length); // Track which message owns the agents

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        accumulated += chunk;

        const result = parseStream(accumulated, parseStateRef.current);

        // emit new sections
        for (const section of result.newSections) {
          optionsRef.current.onSectionParsed?.(section);
        }

        // emit theme selection (only once per response)
        if (result.theme && !themeProcessedRef.current) {
          themeProcessedRef.current = true;
          optionsRef.current.onThemeSelected?.(result.theme);
        }

        // emit pages FIRST (before images) so sections exist when images are injected
        if (result.newPages.length > 0 && !pagesProcessedRef.current) {
          pagesProcessedRef.current = true;
          optionsRef.current.onPages?.(result.newPages, result.theme);
        }

        // emit images with sections from current parse result
        if (result.newImages.length > 0) {
          const allSections = result.state.pages.flatMap(p => p.sections);
          optionsRef.current.onImages?.(result.newImages, allSections);
        }

        // update agents if changed
        if (result.agents.length > 0) {
          setAgents(result.agents);
        }

        // track usage (only once per response)
        // Add to site.costs for session total (single source of truth)
        if (result.usage && !usageProcessedRef.current) {
          usageProcessedRef.current = true;
          setLastUsage(result.usage);
          optionsRef.current.onUsage?.(result.usage);
        }

        // update parse state
        parseStateRef.current = result.state;

        // update display (clean text without markers)
        setMessages([
          ...newMessages,
          { id: assistantId, role: "assistant", content: result.displayText },
        ]);
      }

      // Update final message with agents for persistence
      const finalResult = parseStream(accumulated, parseStateRef.current);
      const finalAgents = Array.from(parseStateRef.current.agents.values());
      setMessages([
        ...newMessages,
        {
          id: assistantId,
          role: "assistant",
          content: finalResult.displayText,
          agents: finalAgents,
          usage: finalResult.usage,
        },
      ]);
      optionsRef.current.onGenerationComplete?.();
    }
    catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Chat error:", err);
      setError(message);
      setAgents([]);
    }
    finally {
      setIsLoading(false);
    }
  }, [input, messages, isLoading, getToken, optionsRef, siteId]);

  const confirmPendingAction = useCallback(() => {
    if (!pendingAction) return;

    if (pendingAction.type === "delete_section") {
      optionsRef.current.onDelete?.(pendingAction.payload.sectionId as string);
    }

    if (pendingAction.type === "add_section" && !pendingAction.step) {
      // Final confirmation step - has all params
      const { sectionType, preset, index } = pendingAction.payload;
      optionsRef.current.onAddSection?.(
        sectionType as string,
        preset as string,
        index as number | undefined,
      );
    }

    setPendingAction(null);
  }, [pendingAction, optionsRef]);

  const cancelPendingAction = useCallback(() => {
    setPendingAction(null);
  }, []);

  const selectOption = useCallback(async (optionId: string) => {
    if (!pendingAction || !pendingAction.options) return;

    if (pendingAction.step === "select_type") {
      // User selected section type, trigger next step
      const message = `Add a ${optionId} section`;
      setPendingAction(null);
      setInput(message);
      await send(message);
    }
    else if (pendingAction.step === "select_preset") {
      // User selected preset, trigger final confirmation
      const { sectionType } = pendingAction.payload;
      const message = `Add ${sectionType} with ${optionId} preset`;
      setPendingAction(null);
      setInput(message);
      await send(message);
    }
    else {
      // Simple option selection (not multi-step)
      // Just confirm with the selected option
      confirmPendingAction();
    }
  }, [pendingAction, send, confirmPendingAction]);

  const trackUsage = useCallback((usage: Usage) => {
    setLastUsage(usage);
    // Don't update sessionUsage directly - let useEffect recalculate from siteCosts
    // to avoid double counting (this usage gets added to site.costs via onUsage,
    // then useEffect adds siteCosts to sessionUsage)
    optionsRef.current.onUsage?.(usage);
  }, [optionsRef]);

  return { messages, input, setInput, isLoading, error, send, sessionUsage, lastUsage, agents, agentsMessageIndex, pendingAction, confirmPendingAction, cancelPendingAction, selectOption, trackUsage };
}
