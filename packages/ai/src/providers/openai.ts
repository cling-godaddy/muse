import OpenAI from "openai";
import type { ChatRequest, ChatResponse, Provider } from "../types";
import { calculateCost } from "../pricing";

export function createOpenAIProvider(apiKey: string): Provider {
  const client = new OpenAI({ apiKey });

  return {
    name: "openai",

    async chat(request: ChatRequest): Promise<ChatResponse> {
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
        messages: request.messages,
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
