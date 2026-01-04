import type { z } from "zod";

export interface FieldDef<T extends z.ZodType = z.ZodType> {
  schema: T
  editable: boolean
  aliases: string[]
}

export function field<T extends z.ZodType>(
  schema: T,
  opts: { editable?: boolean, aliases?: string[] } = {},
): FieldDef<T> {
  return {
    schema,
    editable: opts.editable ?? true,
    aliases: opts.aliases ?? [],
  };
}

type FieldDefs = Record<string, FieldDef>;

// Extract Zod shape from field definitions
export function toZodShape<T extends FieldDefs>(fields: T) {
  return Object.fromEntries(
    Object.entries(fields).map(([k, v]) => [k, v.schema]),
  ) as { [K in keyof T]: T[K]["schema"] };
}

// Extract editable fields with their aliases
export function getEditableFields(fields: FieldDefs): Map<string, string[]> {
  const result = new Map<string, string[]>();
  for (const [name, def] of Object.entries(fields)) {
    if (def.editable) {
      result.set(name, def.aliases);
    }
  }
  return result;
}

// Resolve user input to actual field name using aliases
export function resolveField(fields: FieldDefs, input: string): string | null {
  const normalized = input.toLowerCase().trim();

  for (const [fieldName, def] of Object.entries(fields)) {
    if (!def.editable) continue;
    if (fieldName.toLowerCase() === normalized) return fieldName;
    if (def.aliases.some(a => a.toLowerCase() === normalized)) return fieldName;
  }

  return null;
}
