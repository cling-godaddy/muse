import { useState, useMemo, useCallback, useEffect } from "react";
import { BrowserRouter, Routes, Route, useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SectionEditor, SiteProvider, EditorModeProvider, createSectionFromPreset } from "@muse/editor";
import type { PreviewDevice } from "@muse/core";
import { resolveThemeWithEffects, themeToCssVars, getTypography, loadFonts } from "@muse/themes";
import { getPreset } from "@muse/core";
import { Chat } from "./components/chat";
import { useSiteEditor } from "./hooks/useSiteEditor";
import type { SiteContext } from "./hooks/useChat";
import { EditorToolbar } from "./components/EditorToolbar";
import { PreviewContainer } from "./components/PreviewContainer";
import { PreviewLinkInterceptor } from "./components/PreviewLinkInterceptor";
import { SiteTitleInput } from "./components/SiteTitleInput";
import { ReviewLayout, ReviewDashboard, ReviewEntry, ReviewSessionPage } from "./review";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SignInPage } from "./pages/sign-in";
import { SignUpPage } from "./pages/sign-up";
import { SitesDashboard } from "./components/SitesDashboard";

const queryClient = new QueryClient();

function MainApp() {
  const { siteId: urlSiteId } = useParams<{ siteId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { autoGenerate?: boolean } | null;

  const {
    site,
    sections,
    navbar,
    currentPage,
    currentPageId,
    pageSlugs,
    theme,
    isGenerationComplete,
    hasUnsavedChanges,
    isSaving,
    isSyncing,
    isLoading,
    pendingImageSections,
    canUndo,
    canRedo,
    setCurrentPage,
    setSections,
    updateSiteName,
    addNewPage,
    deletePage,
    updateNavbar,
    undo,
    redo,
    handleSave,
    setMessages,
    handleUsage,
    handleTrackUsageReady,
    handleSectionParsed,
    handleThemeSelected,
    handleImages,
    handleAddSection,
    handlePages,
    handleRefine,
    handleSectionsUpdated,
    handleMove,
    handleMoveSection,
    handleDelete,
    handleGenerationComplete,
    getToken,
    trackUsage,
  } = useSiteEditor(urlSiteId);

  // Handle 404 - redirect to dashboard if site not found
  useEffect(() => {
    if (urlSiteId && !isLoading && !site) {
      navigate("/", { replace: true });
    }
  }, [urlSiteId, isLoading, site, navigate]);

  // Update URL when generation completes
  useEffect(() => {
    if (isGenerationComplete && !urlSiteId && site?.id) {
      navigate(`/sites/${site.id}`, { replace: true });
    }
  }, [isGenerationComplete, urlSiteId, site?.id, navigate]);

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

  // Adapter for AI-initiated "add section" - converts (sectionType, preset, index) to (section, index, generateWithAI)
  const handleAddSectionFromAI = useCallback((sectionType: string, presetId: string, index?: number) => {
    const preset = getPreset(presetId);
    if (!preset) {
      console.error(`Preset not found: ${presetId}`);
      return;
    }

    const section = createSectionFromPreset(preset);
    const targetIndex = index ?? sections.length; // Default to end if not specified
    handleAddSection(section, targetIndex, true); // generateWithAI = true for AI-initiated adds
  }, [sections.length, handleAddSection]);

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
            isSyncing={isSyncing}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        )}
        <main className="flex-1 flex gap-6 p-6 overflow-hidden">
          <div className={`w-[400px] shrink-0 ${isPreview ? "hidden" : ""}`}>
            <Chat siteId={site.id} siteContext={siteContext} sections={sections} siteCosts={site.costs} autoSendPrompt={autoSendPrompt} intakeContext={intakeContext} onSectionParsed={handleSectionParsed} onThemeSelected={handleThemeSelected} onImages={handleImages} onPages={handlePages} onRefine={handleRefine} onSectionsUpdated={handleSectionsUpdated} onMove={handleMove} onDelete={handleDelete} onAddSection={handleAddSectionFromAI} onGenerationComplete={handleGenerationComplete} onMessagesChange={setMessages} onUsage={handleUsage} onTrackUsageReady={handleTrackUsageReady} />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            {isPreview
              ? (
                <PreviewContainer device={previewDevice}>
                  <PreviewLinkInterceptor pageMap={pageMap} onNavigate={setCurrentPage}>
                    <div style={themeStyle} data-effects={effectsId} data-preview-device={previewDevice}>
                      <EditorModeProvider mode={editorMode}>
                        <SectionEditor sections={sections} onChange={setSections} pendingImageSections={pendingImageSections} navbar={navbar ?? void 0} onNavbarChange={updateNavbar} site={site} currentPage={currentPage} onAddSection={handleAddSection} onMoveSection={handleMoveSection} onDeleteSection={handleDelete} getToken={getToken} trackUsage={trackUsage ?? undefined} />
                      </EditorModeProvider>
                    </div>
                  </PreviewLinkInterceptor>
                </PreviewContainer>
              )
              : (
                <div className="h-full overflow-y-auto" style={themeStyle} data-effects={effectsId}>
                  <EditorModeProvider mode={editorMode}>
                    <SectionEditor sections={sections} onChange={setSections} pendingImageSections={pendingImageSections} navbar={navbar ?? void 0} onNavbarChange={updateNavbar} site={site} currentPage={currentPage} onAddSection={handleAddSection} onMoveSection={handleMoveSection} onDeleteSection={handleDelete} getToken={getToken} trackUsage={trackUsage ?? undefined} />
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
