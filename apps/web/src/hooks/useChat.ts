import { useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import type { Section } from "@muse/core";
import type { Usage } from "@muse/ai";
import type { ImageSelection } from "@muse/media";
import { parseStream, type ParseState, type AgentState, type ThemeSelection, type PageInfo } from "../utils/streamParser";

const MESSAGES_URL = "http://localhost:3001/api/messages";

export interface Message {
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

export interface SiteContext {
  name?: string
  description?: string
  location?: string
  siteType?: "landing" | "full"
}

export interface UseChatOptions {
  /** Site ID for message persistence */
  siteId?: string
  /** Business context for content generation */
  siteContext?: SiteContext
  /** Current sections - when provided, chat switches to refine mode */
  sections?: Section[]
  onSectionParsed?: (section: Section) => void
  onThemeSelected?: (theme: ThemeSelection) => void
  onImages?: (images: ImageSelection[], sections: Section[]) => void
  onPages?: (pages: PageInfo[], theme?: ThemeSelection) => void
  onUsage?: (usage: Usage) => void
  /** Called when refine returns updates to apply */
  onRefine?: (updates: RefineUpdate[]) => void
  /** Called when refine returns move operations to apply */
  onMove?: (moves: MoveUpdate[]) => void
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
}

const API_URL = "http://localhost:3001/api/chat";
const REFINE_URL = "http://localhost:3001/api/chat/refine";

const emptyUsage: Usage = { input: 0, output: 0, cost: 0, model: "" };

export function useChat(options: UseChatOptions = {}): UseChat {
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
  const parseStateRef = useRef<ParseState>({ sections: [], pages: [], agents: new Map(), images: [] });
  const usageProcessedRef = useRef(false);
  const themeProcessedRef = useRef(false);
  const pagesProcessedRef = useRef(false);
  const loadedSiteIdRef = useRef<string | null>(null);

  // Load messages when siteId changes
  useEffect(() => {
    if (!options.siteId || options.siteId === loadedSiteIdRef.current) return;

    const loadMessages = async () => {
      try {
        const token = await getToken();
        const response = await fetch(`${MESSAGES_URL}/${options.siteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.messages?.length > 0) {
            setMessages(data.messages.map((m: { role: string, content: string, agents?: AgentState[], usage?: Usage }) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
              agents: m.agents,
              usage: m.usage,
            })));
          }
        }
        loadedSiteIdRef.current = options.siteId ?? null;
      }
      catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    loadMessages();
  }, [options.siteId, getToken]);

  // Notify parent when messages change
  useEffect(() => {
    onMessagesChange?.(messages);
  }, [messages, onMessagesChange]);

  const send = useCallback(async (message?: string) => {
    const content = message ?? input;
    if (!content.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content };
    const newMessages = [...messages, userMessage];

    // Refine mode: when sections exist, use refine endpoint
    const isRefineMode = options.sections && options.sections.length > 0;

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
            sections: options.sections,
            messages: newMessages, // Send full conversation history
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();

        // Apply updates via callbacks
        if (result.toolCalls?.length) {
          // Handle edit_section calls
          if (options.onRefine) {
            const updates: RefineUpdate[] = result.toolCalls
              .filter((tc: { name: string }) => tc.name === "edit_section")
              .map((tc: { input: { sectionId: string, updates: Partial<Section> } }) => ({
                sectionId: tc.input.sectionId,
                updates: tc.input.updates,
              }));
            if (updates.length > 0) {
              options.onRefine(updates);
            }
          }

          // Handle move_section calls
          if (options.onMove) {
            const moves: MoveUpdate[] = result.toolCalls
              .filter((tc: { name: string }) => tc.name === "move_section")
              .map((tc: { input: { sectionId: string, direction: "up" | "down" } }) => ({
                sectionId: tc.input.sectionId,
                direction: tc.input.direction,
              }));
            if (moves.length > 0) {
              options.onMove(moves);
            }
          }
        }

        // Track usage
        if (result.usage) {
          const usage = { ...result.usage, cost: result.usage.cost ?? 0, model: result.usage.model ?? "unknown" };
          setLastUsage(usage);
          setSessionUsage(prev => ({
            input: prev.input + usage.input,
            output: prev.output + usage.output,
            cost: prev.cost + usage.cost,
            model: usage.model,
          }));
        }

        const finalMessages = [...newMessages, { role: "assistant" as const, content: result.message || "Done" }];
        setMessages(finalMessages);
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
          messages: newMessages,
          stream: true,
          siteContext: options.siteContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let accumulated = "";

      setMessages([...newMessages, { role: "assistant", content: "" }]);
      setAgentsMessageIndex(newMessages.length); // Track which message owns the agents

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        accumulated += chunk;

        const result = parseStream(accumulated, parseStateRef.current);

        // emit new sections
        for (const section of result.newSections) {
          options.onSectionParsed?.(section);
        }

        // emit theme selection (only once per response)
        if (result.theme && !themeProcessedRef.current) {
          themeProcessedRef.current = true;
          options.onThemeSelected?.(result.theme);
        }

        // emit pages FIRST (before images) so sections exist when images are injected
        if (result.newPages.length > 0 && !pagesProcessedRef.current) {
          pagesProcessedRef.current = true;
          options.onPages?.(result.newPages, result.theme);
        }

        // emit images with sections from current parse result (not stale ref)
        if (result.newImages.length > 0) {
          const allSections = result.state.pages.flatMap(p => p.sections);
          options.onImages?.(result.newImages, allSections);
        }

        // update agents if changed
        if (result.agents.length > 0) {
          setAgents(result.agents);
        }

        // track usage (only once per response)
        if (result.usage && !usageProcessedRef.current) {
          usageProcessedRef.current = true;
          const usage = result.usage;
          setLastUsage(usage);
          setSessionUsage(prev => ({
            input: prev.input + usage.input,
            output: prev.output + usage.output,
            cost: prev.cost + usage.cost,
            model: usage.model,
          }));
          options.onUsage?.(usage);
        }

        // update parse state
        parseStateRef.current = result.state;

        // update display (clean text without markers)
        setMessages([
          ...newMessages,
          { role: "assistant", content: result.displayText },
        ]);
      }

      // Update final message with agents for persistence
      const finalResult = parseStream(accumulated, parseStateRef.current);
      const finalAgents = Array.from(parseStateRef.current.agents.values());
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: finalResult.displayText,
          agents: finalAgents,
          usage: finalResult.usage,
        },
      ]);
      options.onGenerationComplete?.();
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
  }, [input, messages, isLoading, options, getToken]);

  return { messages, input, setInput, isLoading, error, send, sessionUsage, lastUsage, agents, agentsMessageIndex };
}
