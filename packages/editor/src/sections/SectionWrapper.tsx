import { useMemo, useCallback } from "react";
import type { Block } from "@muse/core";
import { getBlockComponent, type BlockComponent } from "./registry";
import { PresetPicker } from "../controls/PresetPicker";
import { supportsPresets } from "../controls/presets";
import { useSelection } from "../context/Selection";

interface Props {
  block: Block
  onUpdate: (data: Partial<Block>) => void
  onDelete: () => void
  isPending?: boolean
}

function UnknownSection({ block }: { block: Block }) {
  return (
    <div className="muse-section muse-section--unknown">
      Unknown section type:
      {" "}
      {block.type}
    </div>
  );
}

export function SectionWrapper({ block, onUpdate, onDelete, isPending }: Props) {
  const Component = useMemo<BlockComponent>(
    () => getBlockComponent(block.type) ?? UnknownSection,
    [block.type],
  );

  const { select, isSelected } = useSelection();
  const showPresetPicker = supportsPresets(block.type);

  const selectItem = useCallback((itemIndex?: number) => {
    select(block.id, itemIndex);
  }, [select, block.id]);

  const isItemSelected = useCallback((itemIndex?: number) => {
    return isSelected(block.id, itemIndex);
  }, [isSelected, block.id]);

  return (
    <div className="muse-section" data-section-type={block.type}>
      <div className="muse-section-controls">
        {showPresetPicker && (
          <PresetPicker
            blockType={block.type}
            currentPreset={block.preset}
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
      {/* eslint-disable-next-line react-hooks/static-components -- registry lookup, not component creation */}
      <Component
        block={block}
        onUpdate={onUpdate}
        isPending={isPending}
        selectItem={selectItem}
        isItemSelected={isItemSelected}
      />
    </div>
  );
}
