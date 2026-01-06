import { useMemo, useCallback } from "react";
import type { Section as SectionType } from "@muse/core";
import { getSectionComponent, type SectionComponent } from "./registry";
import { PresetPicker } from "../controls/PresetPicker";
import { supportsPresets } from "../controls/presets";
import { useSelection } from "../context/Selection";
import { useIsEditable } from "../context/EditorMode";

interface Props {
  section: SectionType
  onUpdate: (data: Partial<SectionType>) => void
  onDelete: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  canMoveUp?: boolean
  canMoveDown?: boolean
  isPending?: boolean
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

export function Section({ section, onUpdate, onDelete, onMoveUp, onMoveDown, canMoveUp, canMoveDown, isPending }: Props) {
  const Component = useMemo<SectionComponent>(
    () => getSectionComponent(section.type) ?? UnknownSection,
    [section.type],
  );

  const isEditable = useIsEditable();
  const { select, isSelected } = useSelection();
  const showPresetPicker = supportsPresets(section.type);

  const selectItem = useCallback((itemIndex?: number) => {
    select(section.id, itemIndex);
  }, [select, section.id]);

  const isItemSelected = useCallback((itemIndex?: number) => {
    return isSelected(section.id, itemIndex);
  }, [isSelected, section.id]);

  return (
    <div className="muse-section" data-section-type={section.type}>
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
            onClick={onDelete}
            aria-label="Delete section"
          >
            ×
          </button>
        </div>
      )}
      {/* eslint-disable-next-line react-hooks/static-components -- registry lookup, not component creation */}
      <Component
        section={section}
        onUpdate={onUpdate}
        isPending={isPending}
        selectItem={selectItem}
        isItemSelected={isItemSelected}
      />
    </div>
  );
}
