import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import { Trash2, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import type { Section as SectionType, Usage, ImageSource } from "@muse/core";
import { getLayoutComponent, EditableSection } from "../renderers";
import { PresetPicker } from "../controls/PresetPicker";
import { ColorPicker } from "../controls/ColorPicker";
import { Image } from "../controls/Image";
import { supportsPresets } from "../controls/presets";
import { useIsEditable } from "../context/EditorMode";
import { Dialog } from "../ux";

interface Props {
  section: SectionType
  onUpdate: (data: Partial<SectionType>) => void
  onDelete: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  canMoveUp?: boolean
  canMoveDown?: boolean
  trackUsage?: (usage: Usage) => void
}

function ChevronUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M9 7.5L6 4.5L3 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Section({ section, onUpdate, onDelete, onMoveUp, onMoveDown, canMoveUp, canMoveDown, trackUsage }: Props) {
  const LayoutComponent = useMemo(
    () => getLayoutComponent(section.type),
    [section.type],
  );

  const isEditable = useIsEditable();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const showPresetPicker = supportsPresets(section.type);

  // Local pending color for immediate UI feedback, debounced to store
  const [pendingColor, setPendingColor] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Hide color picker for sections with background images
  const hasBackgroundImage = "backgroundImage" in section && section.backgroundImage != null;
  const backgroundImage = hasBackgroundImage ? (section as { backgroundImage: ImageSource }).backgroundImage : undefined;
  const colorPickerValue = pendingColor ?? section.backgroundColor ?? "#ffffff";

  const handleBackgroundImageUpdate = useCallback((image: ImageSource) => {
    onUpdate({ backgroundImage: image } as Partial<SectionType>);
  }, [onUpdate]);

  const handleBackgroundImageRemove = useCallback(() => {
    onUpdate({ backgroundImage: undefined } as Partial<SectionType>);
  }, [onUpdate]);

  const handleColorChange = useCallback((color: string) => {
    setPendingColor(color);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onUpdate({ backgroundColor: color });
      setPendingColor(null);
    }, 300);
  }, [onUpdate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  return (
    <motion.div
      layout
      className="muse-section"
      data-section-type={section.type}
      id={section.id}
    >
      {isEditable && (
        <div className="muse-section-controls">
          {onMoveUp !== void 0 && (
            <>
              <button
                type="button"
                className="muse-section-move"
                onClick={onMoveUp}
                disabled={!canMoveUp}
                aria-label="Move section up"
              >
                <ChevronUpIcon />
              </button>
              <button
                type="button"
                className="muse-section-move"
                onClick={onMoveDown}
                disabled={!canMoveDown}
                aria-label="Move section down"
              >
                <ChevronDownIcon />
              </button>
            </>
          )}
          {showPresetPicker && (
            <PresetPicker
              sectionType={section.type}
              currentPreset={section.preset}
              onChange={preset => onUpdate({ preset })}
            />
          )}
          {hasBackgroundImage
            ? (
              <Image
                image={backgroundImage}
                onUpdate={handleBackgroundImageUpdate}
                onRemove={handleBackgroundImageRemove}
                onUsage={trackUsage}
                trigger={(
                  <button type="button" className="muse-section-image" aria-label="Edit background image">
                    <ImageIcon size={12} />
                  </button>
                )}
              />
            )
            : (
              <ColorPicker
                value={colorPickerValue}
                onChange={handleColorChange}
                ariaLabel="Section background color"
                compact
              />
            )}
          <button
            type="button"
            className="muse-section-delete"
            onClick={() => setShowDeleteConfirm(true)}
            aria-label="Delete section"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
      <Dialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Section"
      >
        <div style={{ padding: "1.25rem 1.5rem 1.5rem" }}>
          <p style={{ color: "var(--muse-text-muted)", margin: 0 }}>
            Are you sure you want to delete this
            {" "}
            <strong>{section.type}</strong>
            {" "}
            section? This cannot be undone.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.25rem" }}>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--muse-border)",
                background: "var(--muse-bg, #fff)",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onDelete();
                setShowDeleteConfirm(false);
              }}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "none",
                background: "#ef4444",
                color: "white",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </Dialog>
      {LayoutComponent
        ? (
          <EditableSection
            Component={LayoutComponent}
            section={section}
            onUpdate={onUpdate}
            onUsage={trackUsage}
          />
        )
        : (
          <div className="muse-section muse-section--unknown">
            Unknown section type:
            {" "}
            {section.type}
          </div>
        )}
    </motion.div>
  );
}
