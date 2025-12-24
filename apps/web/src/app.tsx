import { useRef } from "react";
import { Editor, type EditorRef } from "@muse/editor";
import { Chat } from "./components/chat";
import "./styles/editor.css";
import "./styles/chat.css";
import "./styles/layout.css";

export function App() {
  const editorRef = useRef<EditorRef>(null);

  const handleInsert = (text: string) => {
    editorRef.current?.insertAtCursor(text);
  };

  return (
    <div className="muse-app">
      <header className="muse-header">
        <h1>Muse</h1>
      </header>
      <main className="muse-main">
        <div className="muse-chat-container">
          <Chat onInsert={handleInsert} />
        </div>
        <div className="muse-editor-container">
          <Editor ref={editorRef} className="muse-editor" />
        </div>
      </main>
    </div>
  );
}
