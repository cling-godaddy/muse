import { useMemo } from "react";
import type { Block } from "@muse/core";
import { getBlockComponent, type BlockComponent } from "../registry";

interface Props {
  block: Block
  onUpdate: (data: Partial<Block>) => void
  onDelete: () => void
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

export function BlockWrapper({ block, onUpdate, onDelete }: Props) {
  const Component = useMemo<BlockComponent>(
    () => getBlockComponent(block.type) ?? UnknownBlock,
    [block.type],
  );

  return (
    <div className="muse-block" data-block-type={block.type}>
      <div className="muse-block-controls">
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
      <Component block={block} onUpdate={onUpdate} />
    </div>
  );
}
