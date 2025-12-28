import { useState, useMemo, useCallback, useEffect, useRef, useLayoutEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { groupBy } from "lodash-es";
import { BlockEditor } from "@muse/editor";
import type { Block } from "@muse/core";
import type { ImageSelection } from "@muse/media";
import { resolveThemeWithEffects, themeToCssVars, getTypography, loadFonts } from "@muse/themes";
import { Chat } from "./components/chat";
import { useBlocks } from "./hooks/useBlocks";
import { ReviewLayout, ReviewDashboard, ReviewEntry, ReviewSessionPage } from "./review";
import type { ThemeSelection } from "./utils/streamParser";

interface ThemeState {
  palette: string
  typography: string
  effects: string
}

const IMAGE_BLOCK_TYPES = new Set(["gallery", "features", "testimonials", "image"]);

function MainApp() {
  const { blocks, addBlock, updateBlock, setBlocks } = useBlocks();
  const blocksRef = useRef(blocks);
  const [theme, setTheme] = useState<ThemeState>({ palette: "slate", typography: "inter", effects: "neutral" });
  const [pendingImageBlocks, setPendingImageBlocks] = useState<Set<string>>(new Set());

  useLayoutEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  const { themeStyle, effectsId } = useMemo(() => {
    const { theme: resolved, effects } = resolveThemeWithEffects({
      palette: theme.palette,
      typography: theme.typography,
      effects: theme.effects,
    });
    return { themeStyle: themeToCssVars(resolved), effectsId: effects.id };
  }, [theme]);

  useEffect(() => {
    const typography = getTypography(theme.typography);
    if (typography) loadFonts(typography);
  }, [theme.typography]);

  const handleBlockParsed = useCallback((block: Block) => {
    addBlock(block);
    if (IMAGE_BLOCK_TYPES.has(block.type)) {
      setPendingImageBlocks(prev => new Set(prev).add(block.id));
    }
  }, [addBlock]);

  const handleThemeSelected = useCallback((selection: ThemeSelection) => {
    // auto-apply effects based on palette
    const effects = selection.effects
      ?? (selection.palette === "terminal"
        ? "crt"
        : selection.palette === "synthwave" ? "neon" : "neutral");
    setTheme({ palette: selection.palette, typography: selection.typography, effects });
  }, []);

  const handleImages = useCallback((images: ImageSelection[]) => {
    const currentBlocks = blocksRef.current;
    const byBlock = groupBy(images, img => img.blockId);
    const resolvedBlockIds: string[] = [];

    for (const [blockId, blockImages] of Object.entries(byBlock)) {
      const imgSources = blockImages.map(s => s.image);
      const block = currentBlocks.find(b => b.id === blockId);
      if (!block) continue;

      resolvedBlockIds.push(blockId);

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

    if (resolvedBlockIds.length > 0) {
      setPendingImageBlocks((prev) => {
        const next = new Set(prev);
        for (const id of resolvedBlockIds) next.delete(id);
        return next;
      });
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
          <div className="h-full overflow-y-auto" style={themeStyle} data-effects={effectsId}>
            <BlockEditor blocks={blocks} onChange={setBlocks} pendingImageBlocks={pendingImageBlocks} />
          </div>
        </div>
      </main>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/review" element={<ReviewLayout />}>
          <Route index element={<ReviewDashboard />} />
          <Route path="session" element={<ReviewSessionPage />} />
          <Route path="entries/:id" element={<ReviewEntry />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
