import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import type { ImageSource } from "@muse/core";
import styles from "./Image.module.css";

interface Props {
  image: ImageSource | undefined
  onUpdate: (image: ImageSource) => void
  onReplace: () => void
  onRemove?: () => void
  className?: string
}

export function Image({ image, onUpdate, onReplace, onRemove, className }: Props) {
  const [open, setOpen] = useState(false);

  const handleAltChange = (value: string) => {
    if (!image) return;
    onUpdate({ ...image, alt: value });
  };

  const handleReplace = () => {
    setOpen(false);
    onReplace();
  };

  const handleRemove = () => {
    setOpen(false);
    onRemove?.();
  };

  if (!image) {
    return (
      <button
        type="button"
        className={`${styles.placeholder} ${className ?? ""}`}
        onClick={onReplace}
      >
        <PlusIcon />
        <span>Add image</span>
      </button>
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
          <div className={styles.actions}>
            <button type="button" className={styles.button} onClick={handleReplace}>
              Replace
            </button>
            {onRemove && (
              <button type="button" className={`${styles.button} ${styles.danger}`} onClick={handleRemove}>
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

function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
