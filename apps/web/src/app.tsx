import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { groupBy } from "lodash-es";
import { SectionEditor, SiteProvider, EditorModeProvider } from "@muse/editor";
import type { Section, SectionType, PreviewDevice } from "@muse/core";
import { sectionNeedsImages, getPresetImageInjection, getImageInjection, applyImageInjection } from "@muse/core";
import type { ImageSelection } from "@muse/media";
import { resolveThemeWithEffects, themeToCssVars, getTypography, loadFonts } from "@muse/themes";
import { Chat } from "./components/chat";
import { useSiteWithHistory } from "./hooks/useSiteWithHistory";
import { useSitePersistence } from "./hooks/useSitePersistence";
import type { RefineUpdate, Message, SiteContext } from "./hooks/useChat";
import { EditorToolbar } from "./components/EditorToolbar";
import { PreviewContainer } from "./components/PreviewContainer";
import { SiteTitleInput } from "./components/SiteTitleInput";
import { ReviewLayout, ReviewDashboard, ReviewEntry, ReviewSessionPage } from "./review";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SignInPage } from "./pages/sign-in";
import { SignUpPage } from "./pages/sign-up";
import { SitesDashboard } from "./components/SitesDashboard";
import type { ThemeSelection, PageInfo } from "./utils/streamParser";

function MainApp() {
  const { siteId: urlSiteId } = useParams<{ siteId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { autoGenerate?: boolean } | null;

  const {
    site,
    setSite,
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
    clearSite,
    updateSiteName,
    theme,
    setTheme,
    undo,
    redo,
    canUndo,
    canRedo,
    beginTransaction,
    commitTransaction,
    enableHistory,
    isGenerationComplete,
  } = useSiteWithHistory();

  const [messages, setMessages] = useState<Message[]>([]);
  const persistence = useSitePersistence({ site, setSite, messages });

  // Load site from URL on mount (only if URL id differs from current site)
  const loadedRef = useRef<string | null>(null);
  useEffect(() => {
    if (urlSiteId && urlSiteId !== site.id && urlSiteId !== loadedRef.current) {
      loadedRef.current = urlSiteId;
      persistence.load(urlSiteId).then((found) => {
        if (found) {
          enableHistory();
        }
        else {
          navigate("/", { replace: true });
        }
      });
    }
  }, [urlSiteId, site.id, persistence, navigate, enableHistory]);

  // Update URL when generation completes
  useEffect(() => {
    if (isGenerationComplete && !urlSiteId) {
      navigate(`/sites/${site.id}`, { replace: true });
    }
  }, [isGenerationComplete, urlSiteId, site.id, navigate]);

  // Global keyboard shortcuts (undo/redo/save)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Cmd+S to save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (isGenerationComplete && persistence.hasUnsavedChanges && !persistence.isSaving) {
          persistence.save();
        }
        return;
      }

      // Skip undo/redo if inside Lexical editor - it handles its own undo
      if (document.activeElement?.closest("[data-lexical-editor]")) return;

      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        }
        else {
          undo();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo, isGenerationComplete, persistence]);
  const [pendingImageSections, setPendingImageSections] = useState<Set<string>>(new Set());
  const [editorMode, setEditorMode] = useState<"edit" | "preview">("edit");
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const isPreview = editorMode === "preview";

  const handleEditorModeChange = useCallback((mode: "edit" | "preview") => {
    setEditorMode(mode);
    if (mode === "edit") {
      setPreviewDevice("desktop");
    }
  }, []);

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
    setTheme(selection.palette, selection.typography, selection.effects);
  }, [setTheme]);

  const handleImages = useCallback((images: ImageSelection[], sections: Section[]) => {
    const bySection = groupBy(images, img => img.blockId);
    const resolvedSectionIds: string[] = [];

    for (const [sectionId, sectionImages] of Object.entries(bySection)) {
      const imgSources = sectionImages.map(s => s.image);
      const section = sections.find(s => s.id === sectionId);
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
    beginTransaction();
    clearSite();

    let firstPageId: string | null = null;
    for (const pageInfo of pages) {
      const pageId = addNewPage(pageInfo.slug, pageInfo.title);
      if (!firstPageId) firstPageId = pageId;
      updatePageSections(pageId, pageInfo.sections);
      for (const section of pageInfo.sections) {
        if (sectionNeedsImages(section.type as SectionType)) {
          setPendingImageSections(prev => new Set(prev).add(section.id));
        }
      }
    }

    if (firstPageId) {
      setCurrentPage(firstPageId);
    }
    commitTransaction();
  }, [clearSite, addNewPage, updatePageSections, setCurrentPage, beginTransaction, commitTransaction]);

  const handleRefine = useCallback((updates: RefineUpdate[]) => {
    beginTransaction();
    for (const { sectionId, updates: sectionUpdates } of updates) {
      updateSectionById(sectionId, sectionUpdates);
    }
    commitTransaction();
  }, [updateSectionById, beginTransaction, commitTransaction]);

  const handleGenerationComplete = useCallback(() => {
    enableHistory();
  }, [enableHistory]);

  const siteContext: SiteContext = useMemo(() => ({
    name: site.name,
    description: site.description,
    location: site.location,
    siteType: site.siteType,
  }), [site.name, site.description, site.location, site.siteType]);

  // generate auto-send prompt if navigated with autoGenerate flag (wait for site to load)
  const autoSendPrompt = useMemo(() => {
    if (!locationState?.autoGenerate) return void 0;
    if (urlSiteId && site.id !== urlSiteId) return void 0;
    const typeLabel = site.siteType === "full" ? "a full website" : "a landing page";
    const subject = site.name && site.name !== "Untitled Site" ? site.name : "this business";
    return `Create ${typeLabel} for ${subject}.`;
  }, [locationState?.autoGenerate, site.siteType, urlSiteId, site.id, site.name]);

  // intake context for display in chat (whenever site has description/location)
  const intakeContext = useMemo(() => {
    if (!site.description && !site.location) return void 0;
    return { name: site.name, description: site.description, location: site.location };
  }, [site.name, site.description, site.location]);

  return (
    <SiteProvider pageSlugs={pageSlugs} onGeneratePage={handleGeneratePage}>
      <div className="flex flex-col h-full font-sans text-text bg-bg">
        <header className="px-6 py-3 border-b border-border bg-bg flex items-center gap-4">
          <Link to="/" className="text-xl font-semibold hover:text-primary transition-colors">
            Muse
          </Link>
          {isGenerationComplete && (
            <SiteTitleInput value={site.name} onChange={updateSiteName} />
          )}
          <div className="ml-auto">
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </header>
        {(Object.values(site.pages).some(p => p.sections.length > 0) || canUndo || canRedo) && (
          <EditorToolbar
            site={site}
            currentPageId={currentPageId}
            onSelectPage={setCurrentPage}
            onAddPage={handleAddPage}
            onDeletePage={deletePage}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            editorMode={editorMode}
            onEditorModeChange={handleEditorModeChange}
            isGenerationComplete={isGenerationComplete}
            previewDevice={previewDevice}
            onPreviewDeviceChange={setPreviewDevice}
            onSave={persistence.save}
            isSaving={persistence.isSaving}
            hasUnsavedChanges={persistence.hasUnsavedChanges}
          />
        )}
        <main className="flex-1 flex gap-6 p-6 overflow-hidden">
          <div className={`w-[400px] shrink-0 ${isPreview ? "hidden" : ""}`}>
            <Chat siteId={site.id} siteContext={siteContext} sections={sections} autoSendPrompt={autoSendPrompt} intakeContext={intakeContext} onSectionParsed={handleSectionParsed} onThemeSelected={handleThemeSelected} onImages={handleImages} onPages={handlePages} onRefine={handleRefine} onGenerationComplete={handleGenerationComplete} onMessagesChange={setMessages} />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            {isPreview
              ? (
                <PreviewContainer device={previewDevice}>
                  <div style={themeStyle} data-effects={effectsId}>
                    <EditorModeProvider mode={editorMode}>
                      <SectionEditor sections={sections} onChange={setSections} pendingImageSections={pendingImageSections} />
                    </EditorModeProvider>
                  </div>
                </PreviewContainer>
              )
              : (
                <div className="h-full overflow-y-auto" style={themeStyle} data-effects={effectsId}>
                  <EditorModeProvider mode={editorMode}>
                    <SectionEditor sections={sections} onChange={setSections} pendingImageSections={pendingImageSections} />
                  </EditorModeProvider>
                </div>
              )}
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
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/" element={<ProtectedRoute><SitesDashboard /></ProtectedRoute>} />
        <Route path="/sites/:siteId" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
        <Route path="/review" element={<ProtectedRoute><ReviewLayout /></ProtectedRoute>}>
          <Route index element={<ReviewDashboard />} />
          <Route path="session" element={<ReviewSessionPage />} />
          <Route path="entries/:id" element={<ReviewEntry />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
