import type { Section, Site } from "@muse/core";
import type { ComponentType } from "react";

export interface SectionComponentProps<T extends Section = Section> {
  section: T
  onUpdate: (data: Partial<T>) => void
  isPending?: boolean
  /** Select an item within the section (for list-based sections) */
  selectItem?: (itemIndex?: number) => void
  /** Check if an item is currently selected */
  isItemSelected?: (itemIndex?: number) => boolean
  /** Site context for AI generation */
  site?: Site
  /** Get auth token for API calls */
  getToken?: () => Promise<string | null>
}

export type SectionComponent<T extends Section = Section>
  = ComponentType<SectionComponentProps<T>>;

class ComponentRegistry {
  private components = new Map<string, SectionComponent>();

  register<T extends Section>(type: T["type"], component: SectionComponent<T>): void {
    this.components.set(type, component as unknown as SectionComponent);
  }

  get(type: string): SectionComponent | undefined {
    return this.components.get(type);
  }
}

export const componentRegistry = new ComponentRegistry();

export function getSectionComponent(type: string): SectionComponent | undefined {
  return componentRegistry.get(type);
}
