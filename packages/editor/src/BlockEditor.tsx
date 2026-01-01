import type { Block } from "@muse/core";
import { SectionWrapper } from "./sections/SectionWrapper";
import { SelectionProvider } from "./context/Selection";

interface BlockEditorProps {
  blocks: Block[]
  onChange: (blocks: Block[]) => void
  pendingImageBlocks?: Set<string>
}

export function BlockEditor({ blocks, onChange, pendingImageBlocks }: BlockEditorProps) {
  const updateBlock = (id: string, data: Partial<Block>) => {
    onChange(blocks.map(b => (b.id === id ? { ...b, ...data } as Block : b)));
  };

  const deleteBlock = (id: string) => {
    onChange(blocks.filter(b => b.id !== id));
  };

  return (
    <SelectionProvider>
      <div className="muse-section-editor">
        {blocks.length === 0 && (
          <div className="muse-section-editor-empty">
            No sections yet. Use AI to generate content.
          </div>
        )}
        {blocks.map(block => (
          <SectionWrapper
            key={block.id}
            block={block}
            onUpdate={data => updateBlock(block.id, data)}
            onDelete={() => deleteBlock(block.id)}
            isPending={pendingImageBlocks?.has(block.id) ?? false}
          />
        ))}
      </div>
    </SelectionProvider>
  );
}
