import Anthropic from "@anthropic-ai/sdk";
import type { ChatRequest, ChatResponse, Provider } from "../types";

export function createAnthropicProvider(apiKey: string): Provider {
  const client = new Anthropic({ apiKey });

  return {
    name: "anthropic",

    async chat(request: ChatRequest): Promise<ChatResponse> {
      const systemMessage = request.messages.find(m => m.role === "system");
      const messages = request.messages
        .filter(m => m.role !== "system")
        .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

      const response = await client.messages.create({
        model: request.model ?? "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemMessage?.content,
        messages,
      });

      const textBlock = response.content.find(block => block.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("no text response from anthropic");
      }

      return {
        content: textBlock.text,
        model: response.model,
        usage: {
          input: response.usage.input_tokens,
          output: response.usage.output_tokens,
        },
      };
    },

    async* chatStream(request: ChatRequest): AsyncGenerator<string> {
      const systemMessage = request.messages.find(m => m.role === "system");
      const messages = request.messages
        .filter(m => m.role !== "system")
        .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

      const stream = client.messages.stream({
        model: request.model ?? "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemMessage?.content,
        messages,
      });

      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          yield event.delta.text;
        }
      }
    },
  };
}
