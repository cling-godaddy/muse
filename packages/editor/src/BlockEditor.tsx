import type { Block } from "@muse/core";
import { BlockWrapper } from "./blocks/BlockWrapper";

interface BlockEditorProps {
  blocks: Block[]
  onChange: (blocks: Block[]) => void
}

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const updateBlock = (id: string, data: Partial<Block>) => {
    onChange(blocks.map(b => (b.id === id ? { ...b, ...data } as Block : b)));
  };

  const deleteBlock = (id: string) => {
    onChange(blocks.filter(b => b.id !== id));
  };

  return (
    <div className="muse-block-editor">
      {blocks.length === 0 && (
        <div className="muse-block-editor-empty">
          No blocks yet. Use AI to generate content.
        </div>
      )}
      {blocks.map(block => (
        <BlockWrapper
          key={block.id}
          block={block}
          onUpdate={data => updateBlock(block.id, data)}
          onDelete={() => deleteBlock(block.id)}
        />
      ))}
    </div>
  );
}
