import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { BrowserRouter, Routes, Route, useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { UserButton, useAuth } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { groupBy } from "lodash-es";
import { SectionEditor, SiteProvider, EditorModeProvider } from "@muse/editor";
import type { Section, SectionType, PreviewDevice, Site } from "@muse/core";
import { sectionNeedsImages, getPresetImageInjection, getImageInjection, applyImageInjection } from "@muse/core";
import type { ImageSelection } from "@muse/media";
import type { Usage } from "@muse/ai";
import { resolveThemeWithEffects, themeToCssVars, getTypography, loadFonts } from "@muse/themes";
import { Chat } from "./components/chat";
import { useSiteStore } from "./stores/siteStore";
import { useSite, useSaveSite } from "./queries/siteQueries";
import type { RefineUpdate, MoveUpdate, Message, SiteContext } from "./hooks/useChat";
import { EditorToolbar } from "./components/EditorToolbar";
import { PreviewContainer } from "./components/PreviewContainer";
import { PreviewLinkInterceptor } from "./components/PreviewLinkInterceptor";
import { SiteTitleInput } from "./components/SiteTitleInput";
import { ReviewLayout, ReviewDashboard, ReviewEntry, ReviewSessionPage } from "./review";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SignInPage } from "./pages/sign-in";
import { SignUpPage } from "./pages/sign-up";
import { SitesDashboard } from "./components/SitesDashboard";
import type { ThemeSelection, PageInfo } from "./utils/streamParser";

const queryClient = new QueryClient();

function MainApp() {
  const { siteId: urlSiteId } = useParams<{ siteId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { autoGenerate?: boolean } | null;
  const { getToken } = useAuth();

  // Server state
  const { data: serverSite, isLoading } = useSite(urlSiteId);
  const { mutate: saveSite, isPending: isSaving } = useSaveSite();

  // Client state from store
  const draft = useSiteStore(state => state.draft);
  const currentPageId = useSiteStore(state => state.currentPageId);
  const theme = useSiteStore(state => state.theme);
  const dirty = useSiteStore(state => state.dirty);
  const hydrateDraft = useSiteStore(state => state.hydrateDraft);
  const markSaved = useSiteStore(state => state.markSaved);
  const updateSection = useSiteStore(state => state.updateSection);
  const addSection = useSiteStore(state => state.addSection);
  const deleteSection = useSiteStore(state => state.deleteSection);
  const setSections = useSiteStore(state => state.setSections);
  const setCurrentPage = useSiteStore(state => state.setCurrentPage);
  const setTheme = useSiteStore(state => state.setTheme);
  const updateNavbar = useSiteStore(state => state.updateNavbar);
  const setNavbar = useSiteStore(state => state.setNavbar);
  const clearSite = useSiteStore(state => state.clearSite);
  const updateSiteName = useSiteStore(state => state.updateSiteName);
  const addNewPage = useSiteStore(state => state.addNewPage);
  const deletePage = useSiteStore(state => state.deletePage);
  const updatePageSections = useSiteStore(state => state.updatePageSections);
  const undo = useSiteStore(state => state.undo);
  const redo = useSiteStore(state => state.redo);
  const canUndo = useSiteStore(state => state.canUndo);
  const canRedo = useSiteStore(state => state.canRedo);

  const [messages, setMessages] = useState<Message[]>([]);
  const trackUsageRef = useRef<((usage: Usage) => void) | null>(null);

  // Hydrate draft when server site loads (only if not dirty)
  useEffect(() => {
    if (serverSite && !dirty) {
      hydrateDraft(serverSite);
    }
  }, [serverSite, dirty, hydrateDraft]);

  // Derive computed values from draft
  const site = (draft ?? serverSite) as Site;
  const sections = currentPageId && site?.pages?.[currentPageId] ? site.pages[currentPageId].sections : [];
  const navbar = draft?.navbar ?? null;
  const pageSlugs = useMemo(() => site?.pages ? Object.values(site.pages).map(p => p.slug) : [], [site?.pages]);
  const currentPage = currentPageId && site?.pages?.[currentPageId] ? site.pages[currentPageId] : undefined;
  const isGenerationComplete = site?.pages ? Object.values(site.pages).some(p => p.sections.length > 0) : false;
  const hasUnsavedChanges = dirty;

  // Persist usage costs to site
  const handleUsage = useCallback((usage: Usage) => {
    if (!draft) return;
    // Update costs directly in draft via applyDraftOp
    useSiteStore.getState().applyDraftOp((d) => {
      d.costs = [...(d.costs ?? []), usage];
      d.updatedAt = new Date().toISOString();
    });
  }, [draft]);

  // Store trackUsage function from Chat
  const handleTrackUsageReady = useCallback((trackUsage: (usage: Usage) => void) => {
    trackUsageRef.current = trackUsage;
  }, []);

  // Handle 404 - redirect to dashboard if site not found
  useEffect(() => {
    if (urlSiteId && !isLoading && !serverSite) {
      navigate("/", { replace: true });
    }
  }, [urlSiteId, isLoading, serverSite, navigate]);

  // Update URL when generation completes
  useEffect(() => {
    if (isGenerationComplete && !urlSiteId) {
      navigate(`/sites/${site.id}`, { replace: true });
    }
  }, [isGenerationComplete, urlSiteId, site.id, navigate]);

  // Save handler
  const handleSave = useCallback(() => {
    if (!draft || !dirty) return;

    saveSite(
      { site: draft, messages },
      {
        onSuccess: (savedSite) => {
          markSaved(savedSite);
        },
      },
    );
  }, [draft, dirty, messages, saveSite, markSaved]);

  // Global keyboard shortcuts (undo/redo/save)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Cmd+S to save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (isGenerationComplete && hasUnsavedChanges && !isSaving) {
          handleSave();
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
  }, [undo, redo, isGenerationComplete, hasUnsavedChanges, isSaving, handleSave]);
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
      if (!section) {
        continue;
      }

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

  const handleAddSection = useCallback(async (section: Section, index: number, generateWithAI = false) => {
    addSection(section, index);

    // early return if AI disabled
    if (!generateWithAI) {
      return;
    }

    // mark pending for image sections (only when AI enabled)
    if (sectionNeedsImages(section.type as SectionType)) {
      setPendingImageSections(prev => new Set(prev).add(section.id));
    }

    try {
      const token = await getToken();
      const response = await fetch("/api/chat/generate-section", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          sectionType: section.type,
          preset: section.preset,
          siteContext: {
            name: site.name,
            description: site.description,
            location: site.location,
          },
          existingSections: sections,
        }),
      });

      if (!response.ok) throw new Error("Generation failed");

      const { section: populated, images, usage } = await response.json();

      // Track usage cost
      if (usage && trackUsageRef.current) {
        trackUsageRef.current(usage);
      }

      updateSection(section.id, populated);

      if (images.length > 0) {
        handleImages(images, [populated]);
      }

      setPendingImageSections((prev) => {
        const next = new Set(prev);
        next.delete(section.id);
        return next;
      });
    }
    catch (err) {
      console.error("Failed to generate content:", err);
      setPendingImageSections((prev) => {
        const next = new Set(prev);
        next.delete(section.id);
        return next;
      });
    }
  }, [addSection, getToken, site, sections, updateSection, handleImages]);

  const handlePages = useCallback((pages: PageInfo[], themeOverride?: ThemeSelection) => {
    // Use flushSync to ensure all state updates happen synchronously before React renders
    flushSync(() => {
      clearSite();

      // apply theme after clearSite (avoids stale closure issue)
      if (themeOverride) {
        setTheme(themeOverride.palette, themeOverride.typography, themeOverride.effects);
      }

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

      if (pages.length > 1) {
        setNavbar({
          id: crypto.randomUUID(),
          type: "navbar",
          logo: { text: site.name },
          items: pages.map(p => ({ label: p.title, href: p.slug })),
          sticky: true,
          preset: "navbar-minimal",
        });
      }

      if (firstPageId) {
        setCurrentPage(firstPageId);
      }
    });
  }, [clearSite, addNewPage, updatePageSections, setCurrentPage, setNavbar, site.name, setTheme]);

  const handleRefine = useCallback((updates: RefineUpdate[]) => {
    for (const { sectionId, updates: sectionUpdates } of updates) {
      updateSection(sectionId, sectionUpdates);
    }
  }, [updateSection]);

  const handleMove = useCallback((moves: MoveUpdate[]) => {
    const currentSections = [...sections];
    for (const { sectionId, direction } of moves) {
      const index = currentSections.findIndex(s => s.id === sectionId);
      if (index === -1) continue;
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= currentSections.length) continue;
      // skip if trying to move past footer
      if (direction === "down" && currentSections[newIndex]?.type === "footer") continue;
      const [moved] = currentSections.splice(index, 1);
      if (moved) currentSections.splice(newIndex, 0, moved);
    }
    setSections(currentSections);
  }, [sections, setSections]);

  const handleDelete = useCallback((sectionId: string) => {
    deleteSection(sectionId);
  }, [deleteSection]);

  const handleGenerationComplete = useCallback(() => {
    // No-op: history is always enabled with the new store
  }, []);

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

  const pageMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const [pageId, page] of Object.entries(site.pages)) {
      map.set(page.slug, pageId);
    }
    return map;
  }, [site.pages]);

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
            onSave={handleSave}
            isSaving={isSaving}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        )}
        <main className="flex-1 flex gap-6 p-6 overflow-hidden">
          <div className={`w-[400px] shrink-0 ${isPreview ? "hidden" : ""}`}>
            <Chat siteId={site.id} siteContext={siteContext} sections={sections} siteCosts={site.costs} autoSendPrompt={autoSendPrompt} intakeContext={intakeContext} onSectionParsed={handleSectionParsed} onThemeSelected={handleThemeSelected} onImages={handleImages} onPages={handlePages} onRefine={handleRefine} onMove={handleMove} onDelete={handleDelete} onGenerationComplete={handleGenerationComplete} onMessagesChange={setMessages} onUsage={handleUsage} onTrackUsageReady={handleTrackUsageReady} />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            {isPreview
              ? (
                <PreviewContainer device={previewDevice}>
                  <PreviewLinkInterceptor pageMap={pageMap} onNavigate={setCurrentPage}>
                    <div style={themeStyle} data-effects={effectsId} data-preview-device={previewDevice}>
                      <EditorModeProvider mode={editorMode}>
                        <SectionEditor sections={sections} onChange={setSections} pendingImageSections={pendingImageSections} navbar={navbar ?? void 0} onNavbarChange={updateNavbar} site={site} currentPage={currentPage} onAddSection={handleAddSection} getToken={getToken} trackUsage={trackUsageRef.current ?? undefined} />
                      </EditorModeProvider>
                    </div>
                  </PreviewLinkInterceptor>
                </PreviewContainer>
              )
              : (
                <div className="h-full overflow-y-auto" style={themeStyle} data-effects={effectsId}>
                  <EditorModeProvider mode={editorMode}>
                    <SectionEditor sections={sections} onChange={setSections} pendingImageSections={pendingImageSections} navbar={navbar ?? void 0} onNavbarChange={updateNavbar} site={site} currentPage={currentPage} onAddSection={handleAddSection} getToken={getToken} trackUsage={trackUsageRef.current ?? undefined} />
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
    <QueryClientProvider client={queryClient}>
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
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
