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

function UnknownBlock({ block }: { block: Block }) {
  return (
    <div className="muse-block muse-block--unknown">
      Unknown block type:
      {" "}
      {block.type}
    </div>
  );
}

export function BlockWrapper({ block, onUpdate, onDelete, isPending }: Props) {
  const Component = useMemo<BlockComponent>(
    () => getBlockComponent(block.type) ?? UnknownBlock,
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
    <div className="muse-block" data-block-type={block.type}>
      <div className="muse-block-controls">
        {showPresetPicker && (
          <PresetPicker
            blockType={block.type}
            currentPreset={block.preset}
            onChange={preset => onUpdate({ preset })}
          />
        )}
        <button
          type="button"
          className="muse-block-delete"
          onClick={onDelete}
          aria-label="Delete block"
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
