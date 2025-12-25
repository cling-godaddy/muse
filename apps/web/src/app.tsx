import { useState, useMemo } from "react";
import { BlockEditor } from "@muse/editor";
import type { Block } from "@muse/core";
import { getTheme, themeToCssVars, modern } from "@muse/themes";
import { Chat } from "./components/chat";
import { useBlocks } from "./hooks/useBlocks";

export function App() {
  const { blocks, setBlocks } = useBlocks();
  const [themeId, setThemeId] = useState("modern");

  const themeStyle = useMemo(() => {
    const theme = getTheme(themeId) ?? modern;
    return themeToCssVars(theme);
  }, [themeId]);

  const handleInsertBlocks = (newBlocks: Block[], newThemeId?: string) => {
    if (newThemeId) setThemeId(newThemeId);
    setBlocks([...blocks, ...newBlocks]);
  };

  return (
    <div className="flex flex-col h-full font-sans text-text bg-bg">
      <header className="px-6 py-3 border-b border-border bg-bg flex items-center gap-4">
        <h1 className="m-0 text-xl font-semibold">Muse</h1>
        <span className="text-sm text-text-muted">
          Theme:
          {" "}
          {themeId}
        </span>
      </header>
      <main className="flex-1 flex gap-6 p-6 overflow-hidden">
        <div className="w-[400px] shrink-0">
          <Chat onInsertBlocks={handleInsertBlocks} />
        </div>
        <div className="flex-1 min-w-0 overflow-y-auto">
          <div className="h-full border border-border rounded bg-bg p-4" style={themeStyle}>
            <BlockEditor blocks={blocks} onChange={setBlocks} />
          </div>
        </div>
      </main>
    </div>
  );
}
