import type { Section } from "./types";

type SectionData<T extends Section> = Omit<T, "id" | "type">;

export function createSection<T extends Section>(
  type: T["type"],
  data: SectionData<T>,
): T {
  return { id: crypto.randomUUID(), type, ...data } as T;
}
