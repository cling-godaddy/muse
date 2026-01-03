import { useState, useMemo, useCallback, useEffect, useRef, useLayoutEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { groupBy } from "lodash-es";
import { SectionEditor, SiteProvider } from "@muse/editor";
import type { Section, SectionType, NavbarConfig } from "@muse/core";
import { sectionNeedsImages, getPresetImageInjection, getImageInjection, applyImageInjection } from "@muse/core";
import type { ImageSelection } from "@muse/media";
import { resolveThemeWithEffects, themeToCssVars, getTypography, loadFonts } from "@muse/themes";
import { Chat } from "./components/chat";
import { useSite } from "./hooks/useSite";
import { PageSwitcher } from "./components/PageSwitcher";
import { ReviewLayout, ReviewDashboard, ReviewEntry, ReviewSessionPage } from "./review";
import type { ThemeSelection, PageInfo } from "./utils/streamParser";

function hasNavbarContent(navbar?: NavbarConfig): boolean {
  if (!navbar) return false;
  return !!(navbar.logo?.text || navbar.logo?.image || navbar.items?.length || navbar.cta);
}

interface ThemeState {
  palette: string
  typography: string
  effects: string
}

function MainApp() {
  const {
    site,
    currentPageId,
    pageSlugs,
    setCurrentPage,
    sections,
    addSection,
    updateSectionById,
    setSections,
    addNewPage,
    deletePage,
    updatePageSections,
    setNavbar,
    clearSite,
  } = useSite();
  const siteRef = useRef(site);
  const [theme, setTheme] = useState<ThemeState>({ palette: "slate", typography: "inter", effects: "neutral" });
  const [pendingImageSections, setPendingImageSections] = useState<Set<string>>(new Set());

  useLayoutEffect(() => {
    siteRef.current = site;
  }, [site]);

  const handleGeneratePage = useCallback((slug: string) => {
    // For now, create an empty page - in a full implementation,
    // this would trigger the AI to generate the page content
    const title = slug === "/" ? "Home" : slug.split("/").pop() ?? "New Page";
    const pageId = addNewPage(slug, title);
    setCurrentPage(pageId);
  }, [addNewPage, setCurrentPage]);

  const handleAddPage = useCallback(() => {
    const slug = `/page-${Object.keys(site.pages).length + 1}`;
    handleGeneratePage(slug);
  }, [site.pages, handleGeneratePage]);

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

  const handleNavbar = useCallback((navbar: NavbarConfig) => {
    setNavbar(navbar);
  }, [setNavbar]);

  const handleImages = useCallback((images: ImageSelection[]) => {
    const currentSite = siteRef.current;
    const bySection = groupBy(images, img => img.blockId);
    const resolvedSectionIds: string[] = [];

    // Collect all sections from all pages
    const allSections: Section[] = [];
    for (const page of Object.values(currentSite.pages)) {
      allSections.push(...page.sections);
    }

    for (const [sectionId, sectionImages] of Object.entries(bySection)) {
      const imgSources = sectionImages.map(s => s.image);
      const section = allSections.find(s => s.id === sectionId);
      if (!section) continue;

      // Get injection config from preset or fallback to section type default
      const injection = section.preset
        ? getPresetImageInjection(section.preset)
        : getImageInjection(section.type as SectionType);

      if (injection) {
        const updates = applyImageInjection(section, imgSources, injection);
        if (Object.keys(updates).length > 0) {
          updateSectionById(sectionId, updates);
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
  }, [updateSectionById]);

  const handlePages = useCallback((pages: PageInfo[]) => {
    // Clear existing site and populate with generated pages
    clearSite();

    let firstPageId: string | null = null;
    for (const pageInfo of pages) {
      const pageId = addNewPage(pageInfo.slug, pageInfo.title);
      if (!firstPageId) firstPageId = pageId;
      // Update the page with its sections
      updatePageSections(pageId, pageInfo.sections);
      // Track pending images for sections
      for (const section of pageInfo.sections) {
        if (sectionNeedsImages(section.type as SectionType)) {
          setPendingImageSections(prev => new Set(prev).add(section.id));
        }
      }
    }

    // Select the first page
    if (firstPageId) {
      setCurrentPage(firstPageId);
    }
  }, [clearSite, addNewPage, updatePageSections, setCurrentPage]);

  return (
    <SiteProvider pageSlugs={pageSlugs} onGeneratePage={handleGeneratePage}>
      <div className="flex flex-col h-full font-sans text-text bg-bg">
        <header className="px-6 py-3 border-b border-border bg-bg flex items-center gap-4">
          <h1 className="m-0 text-xl font-semibold">Muse</h1>
          <span className="text-sm text-text-muted">
            {theme.palette}
            {" + "}
            {theme.typography}
          </span>
        </header>
        {(Object.values(site.pages).some(p => p.sections.length > 0) || hasNavbarContent(site.navbar)) && (
          <PageSwitcher
            site={site}
            currentPageId={currentPageId}
            onSelectPage={setCurrentPage}
            onAddPage={handleAddPage}
            onDeletePage={deletePage}
          />
        )}
        <main className="flex-1 flex gap-6 p-6 overflow-hidden">
          <div className="w-[400px] shrink-0">
            <Chat onSectionParsed={handleSectionParsed} onThemeSelected={handleThemeSelected} onNavbar={handleNavbar} onImages={handleImages} onPages={handlePages} />
          </div>
          <div className="flex-1 min-w-0 overflow-y-auto">
            <div className="h-full overflow-y-auto" style={themeStyle} data-effects={effectsId}>
              <SectionEditor sections={sections} onChange={setSections} pendingImageSections={pendingImageSections} navbar={site.navbar} onNavbarChange={setNavbar} />
            </div>
          </div>
        </main>
      </div>
    </SiteProvider>
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
