import { useEffect, useRef } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { ListNode, ListItemNode } from "@lexical/list";
import { HeadingNode } from "@lexical/rich-text";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import type { EditorState } from "lexical";
import { $getRoot } from "lexical";
import { type RichContent, type TextOrRich, getPlainText } from "@muse/core";
import { theme } from "../theme";
import { FloatingToolbarPlugin } from "../plugins/FloatingToolbar";
import { LinkEditorPlugin } from "../plugins/LinkEditor";
import { initializeFromValue } from "../utils/richContent";
import styles from "./RichEditable.module.css";

interface RichEditableProps {
  value: TextOrRich
  onChange: (value: RichContent) => void
  className?: string
  placeholder?: string
}

function SyncPlugin({
  value,
}: {
  value: TextOrRich
}) {
  const [editor] = useLexicalComposerContext();
  const initializedRef = useRef(false);
  const lastValueRef = useRef<TextOrRich>(value);

  useEffect(() => {
    // First mount: initialize editor with initial value
    if (!initializedRef.current) {
      initializeFromValue(editor, value);
      initializedRef.current = true;
      lastValueRef.current = value;
      return;
    }

    // Subsequent updates: check if value changed externally
    // Compare by text content to avoid object reference issues
    const prevText = getPlainText(lastValueRef.current);
    const newText = getPlainText(value);

    if (prevText !== newText) {
      // Value changed - check if it differs from editor content
      let editorText = "";
      editor.getEditorState().read(() => {
        editorText = $getRoot().getTextContent();
      });

      // Only sync if external change (editor content doesn't match new value)
      if (editorText !== newText) {
        initializeFromValue(editor, value);
      }
      lastValueRef.current = value;
    }
  }, [editor, value]);

  return null;
}

export function RichEditable({
  value,
  onChange,
  className,
}: RichEditableProps) {
  const initialConfig = {
    namespace: "muse-rich-editable",
    theme,
    nodes: [LinkNode, AutoLinkNode, ListNode, ListItemNode, HeadingNode],
    onError: (error: Error) => {
      console.error("Lexical error:", error);
    },
  };

  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const json = editorState.toJSON();
      const text = $getRoot().getTextContent();
      onChange({ _rich: true, json, text });
    });
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={(
          <div>
            <ContentEditable
              className={`${styles.editor} ${className ?? ""}`}
            />
          </div>
        )}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <LinkPlugin />
      <ListPlugin />
      <FloatingToolbarPlugin />
      <LinkEditorPlugin />
      <SyncPlugin value={value} />
      <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
    </LexicalComposer>
  );
}
