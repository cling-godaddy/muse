import type { LexicalEditor, SerializedEditorState } from "lexical";
import { $getRoot, $createParagraphNode, $createTextNode } from "lexical";
import { type RichContent, type TextOrRich, isRichContent } from "@muse/core";

export { isRichContent };

export function createRichContent(editor: LexicalEditor): RichContent {
  const json = editor.getEditorState().toJSON();
  let text = "";
  editor.getEditorState().read(() => {
    text = $getRoot().getTextContent();
  });
  return { _rich: true, json, text };
}

export function initializeFromValue(
  editor: LexicalEditor,
  value: TextOrRich,
): void {
  if (isRichContent(value)) {
    const state = editor.parseEditorState(value.json as SerializedEditorState);
    editor.setEditorState(state);
  }
  else {
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode(value));
      root.append(paragraph);
    });
  }
}
