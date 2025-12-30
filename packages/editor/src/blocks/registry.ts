import type { Block } from "@muse/core";
import type { ComponentType } from "react";

export interface BlockComponentProps<T extends Block = Block> {
  block: T
  onUpdate: (data: Partial<T>) => void
  isPending?: boolean
  /** Select an item within the block (for list-based blocks) */
  selectItem?: (itemIndex?: number) => void
  /** Check if an item is currently selected */
  isItemSelected?: (itemIndex?: number) => boolean
}

export type BlockComponent<T extends Block = Block>
  = ComponentType<BlockComponentProps<T>>;

class ComponentRegistry {
  private components = new Map<string, BlockComponent>();

  register<T extends Block>(type: T["type"], component: BlockComponent<T>): void {
    this.components.set(type, component as unknown as BlockComponent);
  }

  get(type: string): BlockComponent | undefined {
    return this.components.get(type);
  }
}

export const componentRegistry = new ComponentRegistry();

export function getBlockComponent(type: string): BlockComponent | undefined {
  return componentRegistry.get(type);
}
