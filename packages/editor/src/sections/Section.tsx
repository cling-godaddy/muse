import { useMemo, useCallback, useState } from "react";
import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import type { Section as SectionType, Site } from "@muse/core";
import { getSectionComponent, type SectionComponent } from "./registry";
import { PresetPicker } from "../controls/PresetPicker";
import { supportsPresets } from "../controls/presets";
import { useSelection } from "../context/Selection";
import { useIsEditable } from "../context/EditorMode";
import { Dialog } from "../ux/Dialog";
import dialogStyles from "../ux/Dialog.module.css";

interface Props {
  section: SectionType
  onUpdate: (data: Partial<SectionType>) => void
  onDelete: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  canMoveUp?: boolean
  canMoveDown?: boolean
  isPending?: boolean
  site?: Site
  getToken?: () => Promise<string | null>
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

function UnknownSection({ section }: { section: SectionType }) {
  return (
    <div className="muse-section muse-section--unknown">
      Unknown section type:
      {" "}
      {section.type}
    </div>
  );
}

export function Section({ section, onUpdate, onDelete, onMoveUp, onMoveDown, canMoveUp, canMoveDown, isPending, site, getToken }: Props) {
  const Component = useMemo<SectionComponent>(
    () => getSectionComponent(section.type) ?? UnknownSection,
    [section.type],
  );

  const isEditable = useIsEditable();
  const { select, isSelected } = useSelection();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const showPresetPicker = supportsPresets(section.type);

  const selectItem = useCallback((itemIndex?: number) => {
    select(section.id, itemIndex);
  }, [select, section.id]);

  const isItemSelected = useCallback((itemIndex?: number) => {
    return isSelected(section.id, itemIndex);
  }, [isSelected, section.id]);

  return (
    <motion.div layout className="muse-section" data-section-type={section.type} data-section-id={section.id}>
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
          <div className={dialogStyles.actions}>
            <button type="button" className={dialogStyles.button} onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </button>
            <button
              type="button"
              className={dialogStyles.buttonDanger}
              onClick={() => {
                onDelete();
                setShowDeleteConfirm(false);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </Dialog>
      {/* eslint-disable-next-line react-hooks/static-components -- registry lookup, not component creation */}
      <Component
        section={section}
        onUpdate={onUpdate}
        isPending={isPending}
        selectItem={selectItem}
        isItemSelected={isItemSelected}
        site={site}
        getToken={getToken}
      />
    </motion.div>
  );
}
