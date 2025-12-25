import type { Block } from "@muse/core";
import type { ComponentType } from "react";

export interface BlockComponentProps<T extends Block = Block> {
  block: T
  onUpdate: (data: Partial<T>) => void
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
