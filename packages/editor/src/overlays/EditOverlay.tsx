import { useCallback } from "react";
import { useEditActivation } from "../context/EditActivation";
import { PlainTextOverlay } from "./PlainTextOverlay";

/**
 * Main overlay dispatcher.
 * Renders the appropriate editor overlay based on the active edit's field type.
 */
export function EditOverlay() {
  const { activeEdit, deactivate, saveField } = useEditActivation();

  const handleSave = useCallback((value: string) => {
    if (!activeEdit) return;
    saveField(activeEdit.sectionId, activeEdit.path, value);
    deactivate();
  }, [activeEdit, saveField, deactivate]);

  const handleCancel = useCallback(() => {
    deactivate();
  }, [deactivate]);

  if (!activeEdit) return null;

  const { fieldType, element } = activeEdit;

  switch (fieldType) {
    case "text":
      return (
        <PlainTextOverlay
          targetElement={element}
          value={element.textContent ?? ""}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      );

    case "rich-text":
      // TODO: Phase 3 - implement RichTextOverlay
      console.log("[EditOverlay] rich-text editing not yet implemented");
      return null;

    case "image":
      // TODO: Phase 4 - implement ImagePickerOverlay
      console.log("[EditOverlay] image editing not yet implemented");
      return null;

    case "cta":
      // TODO: Phase 4 - implement CtaOverlay
      console.log("[EditOverlay] cta editing not yet implemented");
      return null;

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
