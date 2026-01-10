import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Search, Loader2, Trash2 } from "lucide-react";
import type { ImageSource, Usage } from "@muse/core";
import { useSiteContext } from "../context/Site";
import styles from "../controls/Image.module.css";

interface SearchResult {
  id: string
  title: string
  previewUrl: string
  displayUrl: string
  provider: string
}

interface Props {
  /** The element we're editing over */
  targetElement: HTMLElement
  /** Current image value */
  value: ImageSource | undefined
  /** Called when image is selected/updated */
  onSave: (value: ImageSource) => void
  /** Called when image is removed */
  onRemove?: () => void
  /** Called when editing is cancelled */
  onCancel: () => void
  /** Usage tracking callback */
  onUsage?: (usage: Usage) => void
}

const DEFAULT_SEARCH_URL = "/api/search/images";

/**
 * Image picker overlay positioned relative to the target element.
 * Reuses the Image control's popover content.
 */
export function ImageOverlay({
  targetElement,
  value,
  onSave,
  onRemove,
  onCancel,
  onUsage,
}: Props) {
  const { siteId } = useSiteContext();
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Position state
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const updatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [targetElement]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const overlay = document.querySelector("[data-image-overlay]");
      if (overlay && !overlay.contains(target) && !targetElement.contains(target)) {
        onCancel();
      }
    };
    // Delay to avoid immediate close from the click that opened this
    setTimeout(() => {
      document.addEventListener("click", handleClick);
    }, 0);
    return () => document.removeEventListener("click", handleClick);
  }, [targetElement, onCancel]);

  const handleAltChange = (newAlt: string) => {
    if (!value) return;
    onSave({ ...value, alt: newAlt });
  };

  const handleRemove = () => {
    onRemove?.();
    onCancel();
  };

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
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
      const res = await fetch(`${DEFAULT_SEARCH_URL}?${params}`);
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
    onSave({
      url: result.displayUrl,
      alt: result.title,
      provider: result.provider,
      providerId: result.id,
    });
    onCancel();
  };

  return createPortal(
    <div
      data-image-overlay=""
      className={styles.content}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        transform: "translateX(-50%)",
        zIndex: 9999,
      }}
    >
      <form className={styles.searchForm} onSubmit={handleSearch}>
        <div className={styles.searchInputWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            placeholder="Search images..."
            autoFocus
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

      {value && (
        <div className={styles.footer}>
          <label className={styles.footerLabel} htmlFor="image-alt">
            Alt
          </label>
          <input
            id="image-alt"
            type="text"
            className={styles.footerInput}
            value={value.alt}
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
    </div>,
    document.body,
  );
}
