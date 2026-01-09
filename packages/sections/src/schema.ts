import type { ReactNode } from "react";

/**
 * Field types that sections can have
 */
export type FieldType
  = | "text" // plain text
    | "rich-text" // rich text (can have formatting)
    | "image" // image with src, alt
    | "cta" // call-to-action (text + href)
    | "color" // color picker
    | "list"; // repeatable items

/**
 * Schema for a single field
 */
export interface FieldSchema {
  type: FieldType
  slot: string // prop name on the layout component
  label?: string // human-readable label for editing UI
  optional?: boolean // whether the field can be empty
}

/**
 * Schema for a section - maps data fields to slots
 */
export type SectionSchema = Record<string, FieldSchema>;

/**
 * A section layout component with its schema attached
 */
export interface SectionComponent<P = Record<string, ReactNode>> {
  (props: P): ReactNode
  schema: SectionSchema
  displayName?: string
}
