export interface BlockBase {
  id: string
  type: string
  version?: number
}

export interface TextBlock extends BlockBase {
  type: "text"
  content: string
}

export type Block = TextBlock;

export type BlockType = Block["type"];

export function isBlockType<T extends Block>(
  type: T["type"],
): (block: Block) => block is T {
  return (block): block is T => block.type === type;
}

export const isTextBlock = isBlockType<TextBlock>("text");
