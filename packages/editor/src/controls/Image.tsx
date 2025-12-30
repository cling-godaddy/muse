import { useState, useRef } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Upload, Search } from "lucide-react";
import type { ImageSource } from "@muse/core";
import styles from "./Image.module.css";

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
  className?: string
  uploadUrl?: string
  searchUrl?: string
}

const DEFAULT_UPLOAD_URL = "/api/upload/image";
const DEFAULT_SEARCH_URL = "/api/search/images";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function Image({
  image,
  onUpdate,
  onRemove,
  className,
  uploadUrl = DEFAULT_UPLOAD_URL,
  searchUrl = DEFAULT_SEARCH_URL,
}: Props) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Invalid file type. Use jpg, png, webp, or gif.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }

      const imageSource: ImageSource = await res.json();
      onUpdate(imageSource);
      setOpen(false);
    }
    catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
    finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setError(null);
    setSearching(true);

    try {
      const res = await fetch(`${searchUrl}?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Search failed");
      const data: SearchResult[] = await res.json();
      setResults(data);
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

  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept={ALLOWED_TYPES.join(",")}
      onChange={handleFileSelect}
      className={styles.fileInput}
    />
  );

  if (!image) {
    return (
      <div className={`${styles.placeholder} ${className ?? ""}`}>
        {fileInput}
        <button
          type="button"
          className={styles.placeholderButton}
          onClick={triggerUpload}
          disabled={uploading}
        >
          {uploading
            ? (
              <span>Uploading...</span>
            )
            : (
              <>
                <Upload size={24} />
                <span>Upload image</span>
              </>
            )}
        </button>
        {error && <span className={styles.error}>{error}</span>}
      </div>
    );
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <img
          src={image.url}
          alt={image.alt}
          className={`${styles.image} ${className ?? ""}`}
          data-state={open ? "open" : "closed"}
        />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content className={styles.content} side="bottom" align="center" sideOffset={8}>
          {fileInput}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="image-alt">
              Alt text
            </label>
            <input
              id="image-alt"
              type="text"
              className={styles.input}
              value={image.alt}
              onChange={e => handleAltChange(e.target.value)}
              placeholder="Describe this image..."
            />
          </div>

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

          {results.length > 0 && (
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

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.button}
              onClick={triggerUpload}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
            {onRemove && (
              <button
                type="button"
                className={`${styles.button} ${styles.danger}`}
                onClick={handleRemove}
                disabled={uploading}
              >
                Remove
              </button>
            )}
          </div>
          <Popover.Arrow className={styles.arrow} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
