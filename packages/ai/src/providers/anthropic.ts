import Anthropic from "@anthropic-ai/sdk";
import type { ChatRequest, ChatResponse, Provider, ToolCall } from "../types";
import { calculateCost } from "../pricing";

type AnthropicMessage = Anthropic.MessageParam;

function buildMessages(request: ChatRequest): AnthropicMessage[] {
  const messages: AnthropicMessage[] = [];

  for (const m of request.messages) {
    if (m.role === "system") continue;
    messages.push({ role: m.role as "user" | "assistant", content: m.content });
  }

  // Append tool results as a user message with tool_result blocks
  if (request.toolResults?.length) {
    messages.push({
      role: "user",
      content: request.toolResults.map(r => ({
        type: "tool_result" as const,
        tool_use_id: r.id,
        content: JSON.stringify(r.result),
      })),
    });
  }

  return messages;
}

export function createAnthropicProvider(apiKey: string): Provider {
  const client = new Anthropic({ apiKey });

  return {
    name: "anthropic",

    async chat(request: ChatRequest): Promise<ChatResponse> {
      const systemMessage = request.messages.find(m => m.role === "system");
      const messages = buildMessages(request);

      // Agentic tool use: model chooses whether to call tools
      if (request.tools?.length) {
        const response = await client.messages.create({
          model: request.model ?? "claude-sonnet-4-20250514",
          max_tokens: 4096,
          system: systemMessage?.content,
          messages,
          tools: request.tools.map(t => ({
            name: t.name,
            description: t.description,
            input_schema: t.schema as Anthropic.Tool.InputSchema,
          })),
        });

        // Extract tool calls
        const toolCalls: ToolCall[] = response.content
          .filter((block): block is Anthropic.ToolUseBlock => block.type === "tool_use")
          .map(block => ({
            id: block.id,
            name: block.name,
            input: block.input as Record<string, unknown>,
          }));

        // Extract text content
        const textBlock = response.content.find(block => block.type === "text");
        const content = textBlock?.type === "text" ? textBlock.text : "";

        return {
          content,
          model: response.model,
          usage: {
            input: response.usage.input_tokens,
            output: response.usage.output_tokens,
          },
          toolCalls: toolCalls.length ? toolCalls : undefined,
        };
      }

      // Use tool use for schema-based structured output (forced tool choice)
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

      // Plain text response
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
      const messages = buildMessages(request);

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
