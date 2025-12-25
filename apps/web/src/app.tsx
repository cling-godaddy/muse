import { useRef } from "react";
import { Editor, type EditorRef } from "@muse/editor";
import { Chat } from "./components/chat";

export function App() {
  const editorRef = useRef<EditorRef>(null);

  const handleInsert = (text: string) => {
    editorRef.current?.insertAtCursor(text);
  };

  return (
    <div className="flex flex-col h-full font-sans text-text bg-bg">
      <header className="px-6 py-3 border-b border-border bg-bg">
        <h1 className="m-0 text-xl font-semibold">Muse</h1>
      </header>
      <main className="flex-1 flex gap-6 p-6 overflow-hidden">
        <div className="w-[400px] shrink-0">
          <Chat onInsert={handleInsert} />
        </div>
        <div className="flex-1 min-w-0">
          <Editor
            ref={editorRef}
            className="h-full flex flex-col border border-border rounded bg-bg"
          />
        </div>
      </main>
    </div>
  );
}
