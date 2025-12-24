import { forwardRef, useImperativeHandle } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $getSelection, $isRangeSelection } from "lexical";
import { theme } from "./theme";
import { Toolbar } from "./plugins/toolbar";

export interface EditorRef {
  getContent: () => string
  insertAtCursor: (text: string) => void
}

export interface EditorProps {
  className?: string
}

interface EditorCoreProps {
  editorRef: React.RefObject<EditorRef | null>
}

function EditorCore({ editorRef }: EditorCoreProps) {
  const [editor] = useLexicalComposerContext();

  useImperativeHandle(editorRef, () => ({
    getContent: () => {
      let content = "";
      editor.getEditorState().read(() => {
        content = $getRoot().getTextContent();
      });
      return content;
    },
    insertAtCursor: (text: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertText(text);
        }
        else {
          const root = $getRoot();
          const lastChild = root.getLastChild();
          if (lastChild) {
            lastChild.selectEnd();
            const newSelection = $getSelection();
            if ($isRangeSelection(newSelection)) {
              newSelection.insertText(text);
            }
          }
        }
      });
    },
  }), [editor]);

  return null;
}

export const Editor = forwardRef<EditorRef, EditorProps>(
  function Editor({ className }, ref) {
    const initialConfig = {
      namespace: "muse-editor",
      theme,
      onError: (error: Error) => {
        console.error("Lexical error:", error);
      },
    };

    const editorRef = ref as React.RefObject<EditorRef | null>;

    return (
      <LexicalComposer initialConfig={initialConfig}>
        <div className={className}>
          <Toolbar />
          <RichTextPlugin
            contentEditable={<ContentEditable className="muse-content" />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <EditorCore editorRef={editorRef} />
        </div>
      </LexicalComposer>
    );
  },
);
