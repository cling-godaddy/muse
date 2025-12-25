import type { BlockType } from "./types";

export interface BlockMeta {
  type: BlockType
  label: string
  icon: string
  category: "content" | "layout" | "media" | "cta"
  description: string
}

const registry = new Map<BlockType, BlockMeta>();

export function registerBlockMeta(meta: BlockMeta): void {
  registry.set(meta.type, meta);
}

export function getBlockMeta(type: BlockType): BlockMeta | undefined {
  return registry.get(type);
}

export function getAllBlockMeta(): BlockMeta[] {
  return Array.from(registry.values());
}

registerBlockMeta({
  type: "text",
  label: "Text",
  icon: "type",
  category: "content",
  description: "Text content block",
});
