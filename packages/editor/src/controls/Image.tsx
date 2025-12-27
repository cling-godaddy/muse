import { useState, useRef } from "react";
import * as Popover from "@radix-ui/react-popover";
import type { ImageSource } from "@muse/core";
import styles from "./Image.module.css";

interface Props {
  image: ImageSource | undefined
  onUpdate: (image: ImageSource) => void
  onRemove?: () => void
  className?: string
  uploadUrl?: string
}

const DEFAULT_UPLOAD_URL = "/api/upload/image";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function Image({ image, onUpdate, onRemove, className, uploadUrl = DEFAULT_UPLOAD_URL }: Props) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
                <UploadIcon />
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

function UploadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
