import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { theme } from "./theme";
import { Toolbar } from "./plugins/toolbar";

export interface EditorProps {
  className?: string
}

export function Editor({ className }: EditorProps) {
  const initialConfig = {
    namespace: "muse-editor",
    theme,
    onError: (error: Error) => {
      console.error("Lexical error:", error);
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className={className}>
        <Toolbar />
        <RichTextPlugin
          contentEditable={<ContentEditable className="muse-content" />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
      </div>
    </LexicalComposer>
  );
}
