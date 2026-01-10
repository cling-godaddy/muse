import { useCallback } from "react";
import type { ImageSource } from "@muse/core";
import { useEditActivation } from "../context/EditActivation";
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
    case "text":
    case "rich-text":
      // Text fields are handled by inline InlineTextEditor in StaticField
      return null;

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
