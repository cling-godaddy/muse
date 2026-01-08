import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Search, Loader2, Trash2 } from "lucide-react";
import type { ImageSource, Usage } from "@muse/core";
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
}

const DEFAULT_SEARCH_URL = "/api/search/images";

export function Image({
  image,
  onUpdate,
  onRemove,
  onUsage,
  className,
  searchUrl = DEFAULT_SEARCH_URL,
}: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const handleAltChange = (value: string) => {
    if (!image) return;
    onUpdate({ ...image, alt: value });
  };

  const handleRemove = () => {
    setOpen(false);
    onRemove?.();
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setError(null);
    setSearching(true);

    try {
      const res = await fetch(`${searchUrl}?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json() as { results: SearchResult[], usage?: Usage };
      setResults(data.results);

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
    setOpen(false);
    setQuery("");
    setResults([]);
  };

  if (!image) {
    return null;
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <img
          key={image.url}
          src={image.url}
          alt={image.alt}
          className={`${styles.image} ${className ?? ""}`}
          data-state={open ? "open" : "closed"}
        />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content className={styles.content} side="bottom" align="center" sideOffset={8}>
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <input
              type="text"
              className={styles.input}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search images..."
            />
            <button type="submit" className={styles.searchButton} disabled={searching}>
              <Search size={16} />
            </button>
          </form>

          {searching && (
            <div className={styles.loading}>
              <Loader2 size={20} className={styles.spinner} />
              <span>Searching...</span>
            </div>
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

          <Popover.Arrow className={styles.arrow} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
