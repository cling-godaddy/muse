import { Editor } from "@muse/editor";
import "./styles/editor.css";

export function App() {
  return (
    <div style={{ padding: "32px" }}>
      <h1>Muse</h1>
      <Editor className="muse-editor" />
    </div>
  );
}
