import type { Block } from "./types";

type BlockData<T extends Block> = Omit<T, "id" | "type">;

export function createBlock<T extends Block>(
  type: T["type"],
  data: BlockData<T>,
): T {
  return { id: crypto.randomUUID(), type, ...data } as T;
}
