import Anthropic from "@anthropic-ai/sdk";
import type { ChatRequest, ChatResponse, Provider } from "../types";
import { calculateCost } from "../pricing";

export function createAnthropicProvider(apiKey: string): Provider {
  const client = new Anthropic({ apiKey });

  return {
    name: "anthropic",

    async chat(request: ChatRequest): Promise<ChatResponse> {
      const systemMessage = request.messages.find(m => m.role === "system");
      const messages = request.messages
        .filter(m => m.role !== "system")
        .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

      // Use tool use for schema-based structured output
      if (request.responseSchema) {
        const response = await client.messages.create({
          model: request.model ?? "claude-sonnet-4-20250514",
          max_tokens: 4096,
          system: systemMessage?.content,
          messages,
          tools: [{
            name: request.responseSchema.name,
            description: request.responseSchema.description ?? "Generate structured output",
            input_schema: request.responseSchema.schema as Anthropic.Tool.InputSchema,
          }],
          tool_choice: { type: "tool", name: request.responseSchema.name },
        });

        const toolBlock = response.content.find(block => block.type === "tool_use");
        if (!toolBlock || toolBlock.type !== "tool_use") {
          throw new Error("no tool use response from anthropic");
        }

        return {
          content: JSON.stringify(toolBlock.input),
          model: response.model,
          usage: {
            input: response.usage.input_tokens,
            output: response.usage.output_tokens,
          },
        };
      }

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
      const model = request.model ?? "claude-sonnet-4-20250514";
      const systemMessage = request.messages.find(m => m.role === "system");
      const messages = request.messages
        .filter(m => m.role !== "system")
        .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

      const stream = client.messages.stream({
        model,
        max_tokens: 4096,
        system: systemMessage?.content,
        messages,
      });

      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          yield event.delta.text;
        }
      }

      const finalMessage = await stream.finalMessage();
      yield `\n[USAGE:${JSON.stringify({
        input: finalMessage.usage.input_tokens,
        output: finalMessage.usage.output_tokens,
        cost: calculateCost(model, finalMessage.usage.input_tokens, finalMessage.usage.output_tokens),
        model,
      })}]`;
    },
  };
}
