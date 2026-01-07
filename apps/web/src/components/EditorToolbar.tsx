import { useMemo } from "react";
import { Undo2, Redo2, Eye, PenLine, Smartphone, Tablet, Monitor, RotateCcw, Save, Loader2, Check } from "lucide-react";
import type { Site, PreviewDevice } from "@muse/core";
import { getPagesFlattened } from "@muse/core";

type EditorMode = "edit" | "preview";

type DeviceCategory = "mobile" | "tablet" | "desktop";

function getDeviceCategory(device: PreviewDevice): DeviceCategory {
  if (device === "mobile" || device === "mobile-landscape") return "mobile";
  if (device === "tablet" || device === "tablet-landscape") return "tablet";
  return "desktop";
}

function isLandscape(device: PreviewDevice): boolean {
  return device === "mobile-landscape" || device === "tablet-landscape";
}

function toggleOrientation(device: PreviewDevice): PreviewDevice {
  switch (device) {
    case "mobile": return "mobile-landscape";
    case "mobile-landscape": return "mobile";
    case "tablet": return "tablet-landscape";
    case "tablet-landscape": return "tablet";
    default: return device;
  }
}

interface EditorToolbarProps {
  site: Site
  currentPageId: string | null
  onSelectPage: (pageId: string) => void
  onAddPage?: () => void
  onDeletePage?: (pageId: string) => void
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
  editorMode?: EditorMode
  onEditorModeChange?: (mode: EditorMode) => void
  isGenerationComplete?: boolean
  previewDevice?: PreviewDevice
  onPreviewDeviceChange?: (device: PreviewDevice) => void
  onSave?: () => void
  isSaving?: boolean
  isSyncing?: boolean
  hasUnsavedChanges?: boolean
}

export function EditorToolbar({
  site,
  currentPageId,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  editorMode = "edit",
  onEditorModeChange,
  isGenerationComplete = true,
  previewDevice = "desktop",
  onPreviewDeviceChange,
  onSave,
  isSaving,
  isSyncing,
  hasUnsavedChanges,
}: EditorToolbarProps) {
  const isPreview = editorMode === "preview";
  const canPreview = isGenerationComplete;
  const flattenedPages = useMemo(() => getPagesFlattened(site), [site]);

  const deviceCategory = getDeviceCategory(previewDevice);
  const canRotate = deviceCategory !== "desktop";

  const handleDeviceSelect = (category: DeviceCategory) => {
    if (!onPreviewDeviceChange) return;
    if (category === "desktop") {
      onPreviewDeviceChange("desktop");
    }
    else if (category === "mobile") {
      onPreviewDeviceChange(isLandscape(previewDevice) && deviceCategory === "mobile" ? "mobile-landscape" : "mobile");
    }
    else {
      onPreviewDeviceChange(isLandscape(previewDevice) && deviceCategory === "tablet" ? "tablet-landscape" : "tablet");
    }
  };

  const handleRotate = () => {
    if (onPreviewDeviceChange && canRotate) {
      onPreviewDeviceChange(toggleOrientation(previewDevice));
    }
  };

  if (flattenedPages.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-0.5 px-4 border-b border-border overflow-hidden">
      {flattenedPages.map(({ page, path, depth }) => {
        const isActive = page.id === currentPageId;
        return (
          <button
            key={page.id}
            onClick={() => onSelectPage(page.id)}
            className={`
              group flex items-center gap-1.5 px-2.5 py-2 text-xs whitespace-nowrap transition-colors border-b-2 -mb-px
              ${isActive
            ? "border-text text-text"
            : "border-transparent text-text-muted hover:text-text"
          }
            `}
            style={{ marginLeft: depth > 0 ? `${depth * 8}px` : undefined }}
          >
            <span>{page.meta.title || path}</span>
            {onDeletePage && flattenedPages.length > 1 && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeletePage(page.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    onDeletePage(page.id);
                  }
                }}
                className="opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:text-red-500"
              >
                <CloseIcon />
              </span>
            )}
          </button>
        );
      })}
      {onAddPage && (
        <button
          onClick={onAddPage}
          className="flex items-center justify-center w-6 h-6 ml-1 text-text-muted hover:text-text rounded transition-colors"
          title="Add page"
        >
          <PlusIcon />
        </button>
      )}

      {/* Device selector (preview mode only) */}
      {isPreview && onPreviewDeviceChange && (
        <div className="ml-auto flex items-center gap-1 border-r border-border pr-2 mr-2">
          <button
            onClick={() => handleDeviceSelect("mobile")}
            className={`flex items-center justify-center w-7 h-7 rounded transition-colors ${deviceCategory === "mobile" ? "text-text bg-border" : "text-text-muted hover:text-text hover:bg-border"}`}
            title="Mobile"
          >
            <Smartphone size={16} />
          </button>
          <button
            onClick={() => handleDeviceSelect("tablet")}
            className={`flex items-center justify-center w-7 h-7 rounded transition-colors ${deviceCategory === "tablet" ? "text-text bg-border" : "text-text-muted hover:text-text hover:bg-border"}`}
            title="Tablet"
          >
            <Tablet size={16} />
          </button>
          <button
            onClick={() => handleDeviceSelect("desktop")}
            className={`flex items-center justify-center w-7 h-7 rounded transition-colors ${deviceCategory === "desktop" ? "text-text bg-border" : "text-text-muted hover:text-text hover:bg-border"}`}
            title="Desktop"
          >
            <Monitor size={16} />
          </button>
          <button
            onClick={handleRotate}
            disabled={!canRotate}
            className="flex items-center justify-center w-7 h-7 text-text-muted hover:text-text hover:bg-border rounded transition-colors disabled:opacity-30 disabled:pointer-events-none"
            title="Rotate"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      )}

      {/* Undo/Redo actions and Preview toggle */}
      <div className={`flex items-center gap-1 ${!isPreview ? "ml-auto" : ""}`}>
        {onUndo && (
          <button
            onClick={onUndo}
            disabled={!canUndo || isPreview}
            className="flex items-center justify-center w-7 h-7 text-text-muted hover:text-text hover:bg-border rounded transition-colors disabled:opacity-30 disabled:pointer-events-none"
            title="Undo (⌘Z)"
          >
            <Undo2 size={16} />
          </button>
        )}
        {onRedo && (
          <button
            onClick={onRedo}
            disabled={!canRedo || isPreview}
            className="flex items-center justify-center w-7 h-7 text-text-muted hover:text-text hover:bg-border rounded transition-colors disabled:opacity-30 disabled:pointer-events-none"
            title="Redo (⌘⇧Z)"
          >
            <Redo2 size={16} />
          </button>
        )}
        {onEditorModeChange && (
          <button
            onClick={() => onEditorModeChange(isPreview ? "edit" : "preview")}
            disabled={!canPreview && !isPreview}
            className="flex items-center justify-center w-7 h-7 text-text-muted hover:text-text hover:bg-border rounded transition-colors disabled:opacity-30 disabled:pointer-events-none"
            title={isPreview ? "Exit Preview" : "Preview"}
          >
            {isPreview ? <PenLine size={16} /> : <Eye size={16} />}
          </button>
        )}
        {onSave && isGenerationComplete && (
          <div className="flex items-center gap-3 ml-2">
            {/* Status indicator */}
            <div className="flex items-center gap-1.5 text-xs min-w-[70px]">
              {(isSyncing || isSaving)
                ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-blue-500" />
                    <span className="text-text-muted">Saving...</span>
                  </>
                )
                : !hasUnsavedChanges
                  ? (
                    <>
                      <Check size={14} className="text-green-500" />
                      <span className="text-text-muted">Saved</span>
                    </>
                  )
                  : null}
            </div>

            {/* Save button */}
            <button
              onClick={onSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="flex items-center justify-center gap-1 px-2 h-7 text-xs text-text-muted hover:text-text hover:bg-border rounded transition-colors disabled:opacity-30 disabled:pointer-events-none"
              title={hasUnsavedChanges ? "Save (⌘S)" : "Saved"}
            >
              <Save size={14} />
              <span>Save</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M3 3L9 9M3 9L9 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 2V12M2 7H12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
