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
import { type RichContent, type TextOrRich } from "@muse/core";
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

function InitializePlugin({
  value,
  initializedRef,
}: {
  value: TextOrRich
  initializedRef: React.MutableRefObject<boolean>
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!initializedRef.current) {
      initializeFromValue(editor, value);
      initializedRef.current = true;
    }
  }, [editor, value, initializedRef]);

  return null;
}

export function RichEditable({
  value,
  onChange,
  className,
}: RichEditableProps) {
  const initializedRef = useRef(false);

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
      <InitializePlugin value={value} initializedRef={initializedRef} />
      <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
    </LexicalComposer>
  );
}
