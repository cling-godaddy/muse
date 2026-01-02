import { useState, useMemo, useCallback, useEffect, useRef, useLayoutEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { groupBy } from "lodash-es";
import { SectionEditor } from "@muse/editor";
import type { Section, SectionType } from "@muse/core";
import { sectionNeedsImages, getPresetImageInjection, getImageInjection, applyImageInjection } from "@muse/core";
import type { ImageSelection } from "@muse/media";
import { resolveThemeWithEffects, themeToCssVars, getTypography, loadFonts } from "@muse/themes";
import { Chat } from "./components/chat";
import { useSections } from "./hooks/useSections";
import { ReviewLayout, ReviewDashboard, ReviewEntry, ReviewSessionPage } from "./review";
import type { ThemeSelection } from "./utils/streamParser";

interface ThemeState {
  palette: string
  typography: string
  effects: string
}

function MainApp() {
  const { sections, addSection, updateSection, setSections } = useSections();
  const sectionsRef = useRef(sections);
  const [theme, setTheme] = useState<ThemeState>({ palette: "slate", typography: "inter", effects: "neutral" });
  const [pendingImageSections, setPendingImageSections] = useState<Set<string>>(new Set());

  useLayoutEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

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

  const handleSectionParsed = useCallback((section: Section) => {
    addSection(section);
    if (sectionNeedsImages(section.type as SectionType)) {
      setPendingImageSections(prev => new Set(prev).add(section.id));
    }
  }, [addSection]);

  const handleThemeSelected = useCallback((selection: ThemeSelection) => {
    // auto-apply effects based on palette
    const effects = selection.effects
      ?? (selection.palette === "terminal"
        ? "crt"
        : selection.palette === "synthwave" ? "neon" : "neutral");
    setTheme({ palette: selection.palette, typography: selection.typography, effects });
  }, []);

  const handleImages = useCallback((images: ImageSelection[]) => {
    const currentSections = sectionsRef.current;
    const bySection = groupBy(images, img => img.blockId);
    const resolvedSectionIds: string[] = [];

    for (const [sectionId, sectionImages] of Object.entries(bySection)) {
      const imgSources = sectionImages.map(s => s.image);
      const section = currentSections.find(s => s.id === sectionId);
      if (!section) continue;

      // Get injection config from preset or fallback to section type default
      const injection = section.preset
        ? getPresetImageInjection(section.preset)
        : getImageInjection(section.type as SectionType);

      if (injection) {
        const updates = applyImageInjection(section, imgSources, injection);
        if (Object.keys(updates).length > 0) {
          updateSection(sectionId, updates);
          resolvedSectionIds.push(sectionId);
        }
      }
    }

    if (resolvedSectionIds.length > 0) {
      setPendingImageSections((prev) => {
        const next = new Set(prev);
        for (const id of resolvedSectionIds) next.delete(id);
        return next;
      });
    }
  }, [updateSection]);

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
          <Chat onSectionParsed={handleSectionParsed} onThemeSelected={handleThemeSelected} onImages={handleImages} />
        </div>
        <div className="flex-1 min-w-0 overflow-y-auto">
          <div className="h-full overflow-y-auto" style={themeStyle} data-effects={effectsId}>
            <SectionEditor sections={sections} onChange={setSections} pendingImageSections={pendingImageSections} />
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
