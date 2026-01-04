import type { Section } from "@muse/core";
import { sectionFieldRegistry, getEditableFields } from "@muse/core";
import type { Message, Provider, ToolCall, ToolResult } from "../types";
import { editSectionTool } from "../tools";

interface RefineInput {
  messages: Message[] // Conversation history (user/assistant, no system)
  sections: Section[]
}

interface RefineResult {
  message: string
  toolCalls: { name: string, input: Record<string, unknown> }[]
  /** Tool calls that failed validation */
  failedCalls: { name: string, error: string }[]
  usage: { input: number, output: number }
}

function buildFieldReference(sections: Section[]): string {
  const sectionTypes = [...new Set(sections.map(s => s.type))];

  return sectionTypes
    .map((type) => {
      const fields = sectionFieldRegistry[type];
      if (!fields) return null;

      const editableFields = getEditableFields(fields);
      const fieldList = [...editableFields.entries()]
        .map(([name, aliases]) =>
          aliases.length > 0 ? `${name} (aliases: ${aliases.join(", ")})` : name,
        )
        .join(", ");

      return `- ${type}: ${fieldList}`;
    })
    .filter(Boolean)
    .join("\n");
}

function buildSystemPrompt(sections: Section[]): string {
  return `You are helping refine a website. The user will ask you to make changes to sections.

CURRENT SECTIONS:
${JSON.stringify(sections, null, 2)}

EDITABLE FIELDS (use exact field names when calling edit_section):
${buildFieldReference(sections)}

RULES:
1. Use the field names listed above. Aliases are shown in parentheses for reference.
2. If the user says "subheading", use the field name "subheadline".
3. If the request is ambiguous (could apply to multiple fields/sections), ask for clarification.

You have access to the edit_section tool. Call it with:
- sectionId: The ID of the section to modify
- field: The exact field name to update
- value: The new value

Make the requested changes, then briefly confirm what you did.`;
}

export async function refine(
  input: RefineInput,
  provider: Provider,
  executeTool: (call: ToolCall) => Promise<ToolResult>,
): Promise<RefineResult> {
  // Build messages: system prompt + conversation history
  const messages: Message[] = [
    { role: "system", content: buildSystemPrompt(input.sections) },
    ...input.messages.filter(m => m.role !== "system"),
  ];

  const response = await provider.chat({
    messages,
    tools: [editSectionTool],
  });

  const usage = response.usage ?? { input: 0, output: 0 };
  const toolCalls: { name: string, input: Record<string, unknown> }[] = [];
  const failedCalls: { name: string, error: string }[] = [];

  // Execute any tool calls, tracking successes and failures
  if (response.toolCalls?.length) {
    for (const call of response.toolCalls) {
      const result = await executeTool(call);
      if (result.result && typeof result.result === "object" && "error" in result.result) {
        failedCalls.push({ name: call.name, error: result.result.error as string });
      }
      else {
        toolCalls.push({ name: call.name, input: call.input });
      }
    }
  }

  return {
    message: response.content || "Done",
    toolCalls,
    failedCalls,
    usage,
  };
}
