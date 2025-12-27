import { useState, useMemo, useCallback, useEffect, useRef, useLayoutEffect } from "react";
import { groupBy } from "lodash-es";
import { BlockEditor } from "@muse/editor";
import type { Block } from "@muse/core";
import type { ImageSelection } from "@muse/media";
import { resolveThemeFromSelection, themeToCssVars, getTypography, loadFonts } from "@muse/themes";
import { Chat } from "./components/chat";
import { useBlocks } from "./hooks/useBlocks";
import type { ThemeSelection } from "./utils/streamParser";

interface ThemeState {
  palette: string
  typography: string
}

export function App() {
  const { blocks, addBlock, updateBlock, setBlocks } = useBlocks();
  const blocksRef = useRef(blocks);
  const [theme, setTheme] = useState<ThemeState>({ palette: "slate", typography: "inter" });

  useLayoutEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  const themeStyle = useMemo(() => {
    const resolved = resolveThemeFromSelection(theme.palette, theme.typography);
    return themeToCssVars(resolved);
  }, [theme]);

  useEffect(() => {
    const typography = getTypography(theme.typography);
    if (typography) loadFonts(typography);
  }, [theme.typography]);

  const handleBlockParsed = useCallback((block: Block) => {
    addBlock(block);
  }, [addBlock]);

  const handleThemeSelected = useCallback((selection: ThemeSelection) => {
    setTheme({ palette: selection.palette, typography: selection.typography });
  }, []);

  const handleImages = useCallback((images: ImageSelection[]) => {
    const currentBlocks = blocksRef.current;
    const byBlock = groupBy(images, img => img.blockId);
    for (const [blockId, blockImages] of Object.entries(byBlock)) {
      const imgSources = blockImages.map(s => s.image);
      const block = currentBlocks.find(b => b.id === blockId);
      if (!block) continue;

      if (block.type === "hero") {
        const img = blockImages.find(i => i.category === "ambient" || i.category === "subject");
        if (img) updateBlock(blockId, { backgroundImage: img.image });
      }
      else if (block.type === "gallery") {
        updateBlock(blockId, { images: imgSources });
      }
      else if (block.type === "features") {
        const featuresBlock = block as Block & { items?: unknown[] };
        if (featuresBlock.items) {
          const items = featuresBlock.items.map((item, idx) => ({
            ...(item as object),
            image: imgSources[idx] ?? (item as { image?: unknown }).image,
          }));
          updateBlock(blockId, { items } as Partial<Block>);
        }
      }
      else if (block.type === "testimonials") {
        const testimonialsBlock = block as Block & { quotes?: unknown[] };
        if (testimonialsBlock.quotes) {
          const quotes = testimonialsBlock.quotes.map((q, idx) => ({
            ...(q as object),
            avatar: imgSources[idx] ?? (q as { avatar?: unknown }).avatar,
          }));
          updateBlock(blockId, { quotes } as Partial<Block>);
        }
      }
    }
  }, [updateBlock]);

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
          <Chat onBlockParsed={handleBlockParsed} onThemeSelected={handleThemeSelected} onImages={handleImages} />
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
