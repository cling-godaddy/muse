import type { TextBlock as TextBlockType } from "@muse/core";

interface Props {
  block: TextBlockType
  onUpdate: (data: Partial<TextBlockType>) => void
}

export function TextBlock({ block, onUpdate }: Props) {
  return (
    <div className="muse-block-text">
      <textarea
        className="muse-block-text-input"
        value={block.content}
        onChange={e => onUpdate({ content: e.target.value })}
        placeholder="Type something..."
        rows={3}
      />
    </div>
  );
}
