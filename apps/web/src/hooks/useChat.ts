import { useState, useCallback, useRef } from "react";
import type { Section, NavbarSection } from "@muse/core";
import type { Usage } from "@muse/ai";
import type { ImageSelection } from "@muse/media";
import { parseStream, type ParseState, type AgentState, type ThemeSelection, type PageInfo } from "../utils/streamParser";

export interface Message {
  role: "user" | "assistant"
  content: string
}

export interface RefineUpdate {
  sectionId: string
  updates: Partial<Section>
}

export interface UseChatOptions {
  /** Current sections - when provided, chat switches to refine mode */
  sections?: Section[]
  onSectionParsed?: (section: Section) => void
  onThemeSelected?: (theme: ThemeSelection) => void
  onNavbar?: (navbar: NavbarSection) => void
  onImages?: (images: ImageSelection[]) => void
  onPages?: (pages: PageInfo[]) => void
  onUsage?: (usage: Usage) => void
  /** Called when refine returns updates to apply */
  onRefine?: (updates: RefineUpdate[]) => void
}

export interface UseChat {
  messages: Message[]
  input: string
  setInput: (input: string) => void
  isLoading: boolean
  error: string | null
  send: () => Promise<void>
  sessionUsage: Usage
  lastUsage?: Usage
  agents: AgentState[]
}

const API_URL = "http://localhost:3001/api/chat";
const REFINE_URL = "http://localhost:3001/api/chat/refine";

const emptyUsage: Usage = { input: 0, output: 0, cost: 0, model: "" };

export function useChat(options: UseChatOptions = {}): UseChat {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionUsage, setSessionUsage] = useState<Usage>(emptyUsage);
  const [lastUsage, setLastUsage] = useState<Usage | undefined>();
  const [agents, setAgents] = useState<AgentState[]>([]);
  const parseStateRef = useRef<ParseState>({ sections: [], pages: [], agents: new Map(), images: [] });
  const usageProcessedRef = useRef(false);
  const themeProcessedRef = useRef(false);
  const navbarProcessedRef = useRef(false);
  const pagesProcessedRef = useRef(false);

  const send = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
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
      navbarProcessedRef.current = false;
      pagesProcessedRef.current = false;
    }

    if (isRefineMode) {
      try {
        const response = await fetch(REFINE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sections: options.sections,
            prompt: input,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();

        // Apply updates via callback
        if (result.toolCalls?.length && options.onRefine) {
          const updates: RefineUpdate[] = result.toolCalls
            .filter((tc: { name: string }) => tc.name === "edit_section")
            .map((tc: { input: { sectionId: string, updates: Partial<Section> } }) => ({
              sectionId: tc.input.sectionId,
              updates: tc.input.updates,
            }));
          options.onRefine(updates);
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

        setMessages([...newMessages, { role: "assistant", content: result.message || "Done" }]);
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
      let accumulated = "";

      setMessages([...newMessages, { role: "assistant", content: "" }]);

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

        // emit navbar (only once per response)
        if (result.navbar && !navbarProcessedRef.current) {
          navbarProcessedRef.current = true;
          options.onNavbar?.(result.navbar);
        }

        // emit pages FIRST (before images) so sections exist when images are injected
        if (result.newPages.length > 0 && !pagesProcessedRef.current) {
          pagesProcessedRef.current = true;
          options.onPages?.(result.newPages);
        }

        // emit images AFTER pages so handleImages finds sections in siteRef.current
        if (result.newImages.length > 0) {
          options.onImages?.(result.newImages);
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
  }, [input, messages, isLoading, options]);

  return { messages, input, setInput, isLoading, error, send, sessionUsage, lastUsage, agents };
}
