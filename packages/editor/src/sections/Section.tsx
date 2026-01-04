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
  isPending?: boolean
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

export function Section({ section, onUpdate, onDelete, isPending }: Props) {
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
