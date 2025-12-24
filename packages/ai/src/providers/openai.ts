import OpenAI from "openai";
import type { ChatRequest, ChatResponse, Provider } from "../types";

export function createOpenAIProvider(apiKey: string): Provider {
  const client = new OpenAI({ apiKey });

  return {
    name: "openai",

    async chat(request: ChatRequest): Promise<ChatResponse> {
      const response = await client.chat.completions.create({
        model: request.model ?? "gpt-4o",
        messages: request.messages,
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
      const stream = await client.chat.completions.create({
        model: request.model ?? "gpt-4o",
        messages: request.messages,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    },
  };
}
