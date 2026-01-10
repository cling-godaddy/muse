import { type ReactNode, useCallback } from "react";
import type { FieldType } from "@muse/sections";
import type { TextOrRich, ImageSource, RichContent } from "@muse/core";
import { getPlainText } from "@muse/core";
import { SmartLink } from "../ux/SmartLink";
import { InlineTextEditor } from "../ux/InlineTextEditor";
import { useOptionalEditActivation } from "../context/EditActivation";

interface Props {
  schema: { type: FieldType }
  value: unknown
  className?: string
  /** Data path for edit detection (e.g., "headline", "items[0].title") */
  path?: string
  /** Section ID for edit detection */
  sectionId?: string
}

/**
 * Renders content based on field type.
 * For text/rich-text fields in editor context, renders inline Lexical editor.
 * When path and sectionId are provided, adds data attributes for click-to-edit.
 */
export function Field({
  schema,
  value,
  className,
  path,
  sectionId,
}: Props): ReactNode {
  const { type } = schema;
  const isEditorContext = !!(path && sectionId);

  // Get edit activation context (null if not in editor)
  const editContext = useOptionalEditActivation();

  const isEditing = editContext?.activeEdit?.sectionId === sectionId
    && editContext?.activeEdit?.path === path;

  const handleActivate = useCallback(() => {
    if (editContext && path && sectionId) {
      editContext.activate({
        sectionId,
        path,
        fieldType: type,
        element: document.body as HTMLElement, // Not used for inline editing
      });
    }
  }, [editContext, path, sectionId, type]);

  const handleTextChange = useCallback((richValue: RichContent) => {
    if (editContext && sectionId && path) {
      // For plain text fields, extract the text; for rich-text, keep the full value
      if (type === "text") {
        editContext.saveField(sectionId, path, getPlainText(richValue));
      }
      else {
        editContext.saveField(sectionId, path, richValue);
      }
    }
  }, [editContext, sectionId, path, type]);

  // Data attributes for edit detection (only when in editor context)
  const editAttrs = isEditorContext
    ? {
      "data-editable-path": path,
      "data-section-id": sectionId,
      "data-field-type": type,
    }
    : {};

  if (value === undefined || value === null) {
    return null;
  }

  // Derive element type from path for AI suggestions (e.g., "items[0].title" -> "title")
  const elementType = path?.split(".").pop()?.replace(/\[\d+\]$/, "");

  switch (type) {
    case "text": {
      // Handle object values like navbar logo {text?, image?}
      let text = "";
      if (typeof value === "string") {
        text = value;
      }
      else if (value && typeof value === "object" && "text" in value) {
        text = (value as { text?: string }).text ?? "";
      }
      if (!text) return null;

      // Use inline editor in editor context
      if (isEditorContext && editContext) {
        return (
          <InlineTextEditor
            value={text}
            onChange={handleTextChange}
            className={className}
            isEditing={isEditing}
            onActivate={handleActivate}
            hideLists
            path={path}
            sectionId={sectionId}
            fieldType={type}
            elementType={elementType}
          />
        );
      }
      return <span className={className} {...editAttrs}>{text}</span>;
    }

    case "rich-text": {
      const richValue = value as TextOrRich;
      const text = getPlainText(richValue);
      if (!text) return null;

      // Use inline editor in editor context
      if (isEditorContext && editContext) {
        return (
          <InlineTextEditor
            value={richValue}
            onChange={handleTextChange}
            className={className}
            isEditing={isEditing}
            onActivate={handleActivate}
            path={path}
            sectionId={sectionId}
            fieldType={type}
            elementType={elementType}
          />
        );
      }
      // Static: render plain text (TODO: properly render rich content)
      return <span className={className} {...editAttrs}>{text}</span>;
    }

    case "image": {
      const image = value as ImageSource;
      if (!image?.url) return null;
      return (
        <img
          src={image.url}
          alt={image.alt}
          className={className}
          {...editAttrs}
        />
      );
    }

    case "cta": {
      const cta = value as { text: string, href: string };
      if (!cta?.text) return null;
      return (
        <SmartLink href={cta.href} className={className} {...editAttrs}>
          {cta.text}
        </SmartLink>
      );
    }

    case "color":
      // Color fields don't render anything visible - they're config
      return null;

    case "list":
      // List fields need special handling - render children with Field
      console.warn("Field: list type not yet implemented");
      return null;

    default:
      console.warn(`Field: unknown type "${type}"`);
      return null;
  }
}
