import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Search, Loader2, Trash2 } from "lucide-react";
import type { ImageSource, Usage } from "@muse/core";
import { useSiteContext } from "../context/Site";
import styles from "./Image.module.css";

// TODO: Upload is disabled until we switch auth patterns and integrate a proper
// image hosting service. For now, users can only search Getty or remove images.

interface SearchResult {
  id: string
  title: string
  previewUrl: string
  displayUrl: string
  provider: string
}

interface Props {
  image: ImageSource | undefined
  onUpdate: (image: ImageSource) => void
  onRemove?: () => void
  onUsage?: (usage: Usage) => void
  className?: string
  searchUrl?: string
  /** Custom trigger element. If provided, renders this instead of the image. */
  trigger?: React.ReactNode
}

const DEFAULT_SEARCH_URL = "/api/search/images";

export function Image({
  image,
  onUpdate,
  onRemove,
  onUsage,
  className,
  searchUrl = DEFAULT_SEARCH_URL,
  trigger,
}: Props) {
  const { siteId } = useSiteContext();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    // Reset search state when closing
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setHasSearched(false);
      setError(null);
    }
  };

  const handleAltChange = (value: string) => {
    if (!image) return;
    onUpdate({ ...image, alt: value });
  };

  const handleRemove = () => {
    handleOpenChange(false);
    onRemove?.();
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    // Clear previous results when typing new query
    if (results.length > 0 || hasSearched) {
      setResults([]);
      setHasSearched(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setError(null);
    setSearching(true);

    try {
      const params = new URLSearchParams({ q: query });
      if (siteId) params.set("siteId", siteId);
      const res = await fetch(`${searchUrl}?${params}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json() as { results: SearchResult[], usage?: Usage };
      setResults(data.results);
      setHasSearched(true);

      if (data.usage && onUsage) {
        onUsage(data.usage);
      }
    }
    catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    }
    finally {
      setSearching(false);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    onUpdate({
      url: result.displayUrl,
      alt: result.title,
      provider: result.provider,
      providerId: result.id,
    });
    handleOpenChange(false);
  };

  // When using custom trigger, allow rendering even without image (for adding new images)
  if (!image && !trigger) {
    return null;
  }

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        {trigger ?? (
          <img
            key={image?.url}
            src={image?.url}
            alt={image?.alt}
            className={`${styles.image} ${className ?? ""}`}
            data-state={open ? "open" : "closed"}
          />
        )}
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content className={styles.content} side="bottom" align="center" sideOffset={8}>
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <div className={styles.searchInputWrapper}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                value={query}
                onChange={e => handleQueryChange(e.target.value)}
                placeholder="Search images..."
              />
              {searching && <Loader2 size={16} className={styles.spinner} />}
            </div>
          </form>

          {!searching && hasSearched && results.length === 0 && (
            <div className={styles.empty}>No images found</div>
          )}

          {!searching && results.length > 0 && (
            <div className={styles.results}>
              {results.map(result => (
                <button
                  key={result.id}
                  type="button"
                  className={styles.resultItem}
                  onClick={() => handleSelectResult(result)}
                >
                  <img src={result.previewUrl} alt={result.title} />
                </button>
              ))}
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          {image && (
            <div className={styles.footer}>
              <label className={styles.footerLabel} htmlFor="image-alt">
                Alt
              </label>
              <input
                id="image-alt"
                type="text"
                className={styles.footerInput}
                value={image.alt}
                onChange={e => handleAltChange(e.target.value)}
                placeholder="Describe image..."
              />
              {onRemove && (
                <button
                  type="button"
                  className={styles.trashButton}
                  onClick={handleRemove}
                  aria-label="Remove image"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )}

          <Popover.Arrow className={styles.arrow} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
