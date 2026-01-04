import type { Section } from "@muse/core";
import type { Message, Provider, ToolCall, ToolResult } from "../types";
import { editSectionTool } from "../tools";

interface RefineInput {
  prompt: string
  sections: Section[]
}

interface RefineResult {
  message: string
  toolCalls: { name: string, input: Record<string, unknown> }[]
  usage: { input: number, output: number }
}

function buildSystemPrompt(sections: Section[]): string {
  return `You are helping refine a website. The user will ask you to make changes to sections.

CURRENT SECTIONS:
${JSON.stringify(sections, null, 2)}

You have access to the edit_section tool to make changes. Call it with:
- sectionId: The ID of the section to modify
- updates: An object with the fields to change (only include fields you want to update)

Make the requested changes, then briefly confirm what you did.`;
}

export async function refine(
  input: RefineInput,
  provider: Provider,
  executeTool: (call: ToolCall) => Promise<ToolResult>,
): Promise<RefineResult> {
  const messages: Message[] = [
    { role: "system", content: buildSystemPrompt(input.sections) },
    { role: "user", content: input.prompt },
  ];

  const response = await provider.chat({
    messages,
    tools: [editSectionTool],
  });

  const usage = response.usage ?? { input: 0, output: 0 };
  const toolCalls: { name: string, input: Record<string, unknown> }[] = [];

  // Execute any tool calls
  if (response.toolCalls?.length) {
    for (const call of response.toolCalls) {
      toolCalls.push({ name: call.name, input: call.input });
      await executeTool(call);
    }
  }

  return {
    message: response.content || "Done",
    toolCalls,
    usage,
  };
}
