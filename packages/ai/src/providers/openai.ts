import OpenAI from "openai";
import type { ChatRequest, ChatResponse, Provider, ToolCall } from "../types";
import { calculateCost } from "../pricing";

type OpenAIMessage = OpenAI.ChatCompletionMessageParam;

function buildMessages(request: ChatRequest): OpenAIMessage[] {
  const messages: OpenAIMessage[] = request.messages.map(m => ({
    role: m.role,
    content: m.content,
  }));

  // Append tool results as tool messages
  if (request.toolResults?.length) {
    for (const r of request.toolResults) {
      messages.push({
        role: "tool",
        tool_call_id: r.id,
        content: JSON.stringify(r.result),
      });
    }
  }

  return messages;
}

export function createOpenAIProvider(apiKey: string): Provider {
  const client = new OpenAI({ apiKey });

  return {
    name: "openai",

    async chat(request: ChatRequest): Promise<ChatResponse> {
      const messages = buildMessages(request);

      // Agentic tool use
      if (request.tools?.length) {
        const response = await client.chat.completions.create({
          model: request.model ?? "gpt-4o",
          messages,
          tools: request.tools.map(t => ({
            type: "function" as const,
            function: {
              name: t.name,
              description: t.description,
              parameters: t.schema,
            },
          })),
        });

        const choice = response.choices[0];
        const toolCalls: ToolCall[] = (choice?.message.tool_calls ?? [])
          .filter((tc): tc is OpenAI.ChatCompletionMessageToolCall & { type: "function" } =>
            tc.type === "function",
          )
          .map(tc => ({
            id: tc.id,
            name: tc.function.name,
            input: JSON.parse(tc.function.arguments),
          }));

        return {
          content: choice?.message.content ?? "",
          model: response.model,
          usage: response.usage
            ? {
              input: response.usage.prompt_tokens,
              output: response.usage.completion_tokens,
            }
            : undefined,
          toolCalls: toolCalls.length ? toolCalls : undefined,
        };
      }

      // Schema-based structured output takes precedence over jsonMode
      const responseFormat = request.responseSchema
        ? {
          type: "json_schema" as const,
          json_schema: {
            name: request.responseSchema.name,
            ...(request.responseSchema.description && { description: request.responseSchema.description }),
            schema: request.responseSchema.schema,
            strict: request.responseSchema.strict ?? true,
          },
        }
        : request.jsonMode
          ? { type: "json_object" as const }
          : undefined;

      const response = await client.chat.completions.create({
        model: request.model ?? "gpt-4o",
        messages,
        ...(responseFormat && { response_format: responseFormat }),
      });

      const choice = response.choices[0];
      if (!choice?.message.content) {
        throw new Error("no response from openai");
      }

      return {
        content: choice.message.content,
        model: response.model,
        usage: response.usage
          ? {
            input: response.usage.prompt_tokens,
            output: response.usage.completion_tokens,
          }
          : undefined,
      };
    },

    async* chatStream(request: ChatRequest): AsyncGenerator<string> {
      const model = request.model ?? "gpt-4o";
      const stream = await client.chat.completions.create({
        model,
        messages: request.messages,
        stream: true,
        stream_options: { include_usage: true },
      });

      let usage: { prompt_tokens: number, completion_tokens: number } | undefined;

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
        if (chunk.usage) {
          usage = chunk.usage;
        }
      }

      if (usage) {
        yield `\n[USAGE:${JSON.stringify({
          input: usage.prompt_tokens,
          output: usage.completion_tokens,
          cost: calculateCost(model, usage.prompt_tokens, usage.completion_tokens),
          model,
        })}]`;
      }
    },
  };
}
