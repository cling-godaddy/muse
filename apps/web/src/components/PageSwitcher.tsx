import { useMemo } from "react";
import type { Site } from "@muse/core";
import { getPagesFlattened } from "@muse/core";

interface PageSwitcherProps {
  site: Site
  currentPageId: string | null
  onSelectPage: (pageId: string) => void
  onAddPage?: () => void
  onDeletePage?: (pageId: string) => void
}

export function PageSwitcher({
  site,
  currentPageId,
  onSelectPage,
  onAddPage,
  onDeletePage,
}: PageSwitcherProps) {
  const flattenedPages = useMemo(() => getPagesFlattened(site), [site]);

  if (flattenedPages.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-0.5 px-4 border-b border-border overflow-x-auto">
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
