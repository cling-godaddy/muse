import type { TextBlock as TextBlockType } from "@muse/core";
import { EditableText } from "../ux";

interface Props {
  block: TextBlockType
  onUpdate: (data: Partial<TextBlockType>) => void
}

export function Text({ block, onUpdate }: Props) {
  return (
    <div className="muse-block-text">
      <EditableText
        value={block.content}
        onChange={v => onUpdate({ content: v })}
        as="p"
        className="muse-block-text-content"
        placeholder="Type something..."
      />
    </div>
  );
}
