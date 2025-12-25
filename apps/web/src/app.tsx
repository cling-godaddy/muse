import { useState, useMemo, useCallback } from "react";
import { BlockEditor } from "@muse/editor";
import type { Block } from "@muse/core";
import { resolveThemeFromSelection, themeToCssVars } from "@muse/themes";
import { Chat } from "./components/chat";
import { useBlocks } from "./hooks/useBlocks";
import type { ThemeSelection } from "./utils/streamParser";

interface ThemeState {
  palette: string
  typography: string
}

export function App() {
  const { blocks, addBlock, setBlocks } = useBlocks();
  const [theme, setTheme] = useState<ThemeState>({ palette: "slate", typography: "inter" });

  const themeStyle = useMemo(() => {
    const resolved = resolveThemeFromSelection(theme.palette, theme.typography);
    return themeToCssVars(resolved);
  }, [theme]);

  const handleBlockParsed = useCallback((block: Block) => {
    addBlock(block);
  }, [addBlock]);

  const handleThemeSelected = useCallback((selection: ThemeSelection) => {
    setTheme({ palette: selection.palette, typography: selection.typography });
  }, []);

  return (
    <div className="flex flex-col h-full font-sans text-text bg-bg">
      <header className="px-6 py-3 border-b border-border bg-bg flex items-center gap-4">
        <h1 className="m-0 text-xl font-semibold">Muse</h1>
        <span className="text-sm text-text-muted">
          {theme.palette}
          {" + "}
          {theme.typography}
        </span>
      </header>
      <main className="flex-1 flex gap-6 p-6 overflow-hidden">
        <div className="w-[400px] shrink-0">
          <Chat onBlockParsed={handleBlockParsed} onThemeSelected={handleThemeSelected} />
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
