import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { FORMAT_TEXT_COMMAND, UNDO_COMMAND, REDO_COMMAND } from "lexical";

interface ToolbarProps {
  className?: string
}

export function Toolbar({ className }: ToolbarProps) {
  const [editor] = useLexicalComposerContext();

  const format = (type: "bold" | "italic") => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, type);
  };

  const undo = () => editor.dispatchCommand(UNDO_COMMAND, undefined);
  const redo = () => editor.dispatchCommand(REDO_COMMAND, undefined);

  return (
    <div className={className ?? "muse-toolbar"}>
      <button type="button" onClick={() => format("bold")} aria-label="Bold">
        B
      </button>
      <button type="button" onClick={() => format("italic")} aria-label="Italic">
        I
      </button>
      <span className="muse-toolbar-divider" />
      <button type="button" onClick={undo} aria-label="Undo">
        ↩
      </button>
      <button type="button" onClick={redo} aria-label="Redo">
        ↪
      </button>
    </div>
  );
}
