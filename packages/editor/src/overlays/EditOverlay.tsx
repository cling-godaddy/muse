import { useCallback } from "react";
import type { RichContent, TextOrRich, ImageSource } from "@muse/core";
import { getPlainText } from "@muse/core";
import { useEditActivation } from "../context/EditActivation";
import { RichTextOverlay } from "./RichTextOverlay";
import { ImageOverlay } from "./ImageOverlay";
import { CtaOverlay } from "./CtaOverlay";

interface CtaValue {
  text: string
  href: string
}

/**
 * Main overlay dispatcher.
 * Renders the appropriate editor overlay based on the active edit's field type.
 */
export function EditOverlay() {
  const { activeEdit, deactivate, saveField, getFieldValue } = useEditActivation();

  // For plain text fields, extract text from RichContent
  const handleTextSave = useCallback((value: RichContent) => {
    if (!activeEdit) return;
    const plainText = getPlainText(value);
    saveField(activeEdit.sectionId, activeEdit.path, plainText);
    deactivate();
  }, [activeEdit, saveField, deactivate]);

  const handleRichSave = useCallback((value: RichContent) => {
    if (!activeEdit) return;
    saveField(activeEdit.sectionId, activeEdit.path, value);
    deactivate();
  }, [activeEdit, saveField, deactivate]);

  const handleImageSave = useCallback((value: ImageSource) => {
    if (!activeEdit) return;
    saveField(activeEdit.sectionId, activeEdit.path, value);
    deactivate();
  }, [activeEdit, saveField, deactivate]);

  const handleCtaSave = useCallback((value: CtaValue) => {
    if (!activeEdit) return;
    saveField(activeEdit.sectionId, activeEdit.path, value);
    deactivate();
  }, [activeEdit, saveField, deactivate]);

  const handleCancel = useCallback(() => {
    deactivate();
  }, [deactivate]);

  if (!activeEdit) return null;

  const { fieldType, element, sectionId, path } = activeEdit;

  switch (fieldType) {
    case "text": {
      // Plain text uses Lexical too, but saves as string
      const textValue = getFieldValue(sectionId, path) as string ?? "";
      return (
        <RichTextOverlay
          targetElement={element}
          value={textValue}
          onSave={handleTextSave}
          onCancel={handleCancel}
        />
      );
    }

    case "rich-text": {
      const richValue = getFieldValue(sectionId, path) as TextOrRich ?? "";
      return (
        <RichTextOverlay
          targetElement={element}
          value={richValue}
          onSave={handleRichSave}
          onCancel={handleCancel}
        />
      );
    }

    case "image": {
      const imageValue = getFieldValue(sectionId, path) as ImageSource | undefined;
      return (
        <ImageOverlay
          targetElement={element}
          value={imageValue}
          onSave={handleImageSave}
          onCancel={handleCancel}
        />
      );
    }

    case "cta": {
      const ctaValue = getFieldValue(sectionId, path) as CtaValue ?? { text: "", href: "" };
      return (
        <CtaOverlay
          targetElement={element}
          value={ctaValue}
          onSave={handleCtaSave}
          onCancel={handleCancel}
        />
      );
    }

    case "color":
      // Color fields are config, not content - handled by section controls
      return null;

    case "list":
      // List fields need special handling - Phase 5
      console.log("[EditOverlay] list editing not yet implemented");
      return null;

    default:
      console.warn(`[EditOverlay] unknown field type: ${fieldType}`);
      return null;
  }
}
