import type { BlockType } from "./types";

export interface AIBlockSchema {
  type: BlockType
  description: string
  properties: Record<string, {
    type: "string" | "number" | "boolean" | "array" | "object"
    description: string
    required?: boolean
  }>
  required: string[]
}

const registry = new Map<BlockType, AIBlockSchema>();

export function registerAISchema(schema: AIBlockSchema): void {
  registry.set(schema.type, schema);
}

export function getAISchema(type: BlockType): AIBlockSchema | undefined {
  return registry.get(type);
}

export function getAllAISchemas(): AIBlockSchema[] {
  return Array.from(registry.values());
}

export function generateBlockSchemaPrompt(): string {
  return getAllAISchemas().map(s => `
Block: ${s.type}
Description: ${s.description}
Fields:
${Object.entries(s.properties).map(([k, v]) =>
  `  - ${k} (${v.type}${v.required ? ", required" : ""}): ${v.description}`,
).join("\n")}
`).join("\n");
}

registerAISchema({
  type: "text",
  description: "Text content block",
  properties: {
    content: { type: "string", description: "Text content", required: true },
  },
  required: ["content"],
});
