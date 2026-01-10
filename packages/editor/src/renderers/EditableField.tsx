import type { ReactNode } from "react";
import type { FieldSchema } from "@muse/sections";
import type { RichContent, TextOrRich, ImageSource, Usage } from "@muse/core";
import { EditablePlainText } from "./fields/EditablePlainText";
import { EditableRichText } from "./fields/EditableRichText";
import { EditableImage } from "./fields/EditableImage";
import { EditableCta } from "./fields/EditableCta";
import { EditableColor } from "./fields/EditableColor";

interface Props {
  schema: FieldSchema
  value: unknown
  onChange: (value: unknown) => void
  onUsage?: (usage: Usage) => void
  className?: string
  placeholder?: string
}

/**
 * Renders the appropriate editable component based on field type.
 * This is the bridge between section schemas and editing primitives.
 */
export function EditableField({
  schema,
  value,
  onChange,
  onUsage,
  className,
  placeholder,
}: Props): ReactNode {
  const { type, label } = schema;
  const fieldPlaceholder = placeholder ?? label ?? "";

  switch (type) {
    case "text": {
      // Handle object values like navbar logo {text?, image?}
      let textValue = "";
      if (typeof value === "string") {
        textValue = value;
      }
      else if (value && typeof value === "object" && "text" in value) {
        textValue = (value as { text?: string }).text ?? "";
      }
      return (
        <EditablePlainText
          value={textValue}
          onChange={(v) => {
            // If original value was object, preserve structure
            if (value && typeof value === "object") {
              onChange({ ...value, text: v });
            }
            else {
              onChange(v);
            }
          }}
          className={className}
          placeholder={fieldPlaceholder}
        />
      );
    }

    case "rich-text":
      return (
        <EditableRichText
          value={value as TextOrRich ?? ""}
          onChange={onChange as (v: RichContent) => void}
          className={className}
          placeholder={fieldPlaceholder}
          elementType={schema.slot}
        />
      );

    case "image":
      return (
        <EditableImage
          value={value as ImageSource | undefined}
          onChange={onChange as (v: ImageSource) => void}
          onUsage={onUsage}
          className={className}
        />
      );

    case "cta":
      return (
        <EditableCta
          value={value as { text: string, href: string }}
          onChange={onChange as (v: { text: string, href: string }) => void}
          className={className}
          placeholder={fieldPlaceholder}
        />
      );

    case "color":
      return (
        <EditableColor
          value={value as string | undefined}
          onChange={onChange as (v: string) => void}
        />
      );

    case "list":
      // List fields need special handling - render children with EditableField
      // For now, return null - we'll implement this when we have a concrete use case
      console.warn("EditableField: list type not yet implemented");
      return null;

    default:
      console.warn(`EditableField: unknown type "${type}"`);
      return null;
  }
}
