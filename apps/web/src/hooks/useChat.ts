import { useState, useCallback, useRef } from "react";
import type { Block } from "@muse/core";
import type { Usage } from "@muse/ai";
import { parseStream, type ParseState, type AgentState, type ThemeSelection } from "../utils/streamParser";

export interface Message {
  role: "user" | "assistant"
  content: string
}

export interface UseChatOptions {
  onBlockParsed?: (block: Block) => void
  onThemeSelected?: (theme: ThemeSelection) => void
  onUsage?: (usage: Usage) => void
}

export interface UseChat {
  messages: Message[]
  input: string
  setInput: (input: string) => void
  isLoading: boolean
  send: () => Promise<void>
  sessionUsage: Usage
  lastUsage?: Usage
  agents: AgentState[]
}

const API_URL = "http://localhost:3001/api/chat";

const emptyUsage: Usage = { input: 0, output: 0, cost: 0, model: "" };

export function useChat(options: UseChatOptions = {}): UseChat {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionUsage, setSessionUsage] = useState<Usage>(emptyUsage);
  const [lastUsage, setLastUsage] = useState<Usage | undefined>();
  const [agents, setAgents] = useState<AgentState[]>([]);
  const parseStateRef = useRef<ParseState>({ blockCount: 0, agents: new Map() });
  const usageProcessedRef = useRef(false);
  const themeProcessedRef = useRef(false);

  const send = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setAgents([]);
    parseStateRef.current = { blockCount: 0, agents: new Map() };
    usageProcessedRef.current = false;
    themeProcessedRef.current = false;

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

        // emit new blocks
        for (const block of result.newBlocks) {
          options.onBlockParsed?.(block);
        }

        // emit theme selection (only once per response)
        if (result.theme && !themeProcessedRef.current) {
          themeProcessedRef.current = true;
          options.onThemeSelected?.(result.theme);
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
    catch (error) {
      console.error("Chat error:", error);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Error: Failed to get response" },
      ]);
    }
    finally {
      setIsLoading(false);
    }
  }, [input, messages, isLoading, options]);

  return { messages, input, setInput, isLoading, send, sessionUsage, lastUsage, agents };
}
