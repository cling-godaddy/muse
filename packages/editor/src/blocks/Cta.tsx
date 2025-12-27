import type { CtaBlock as CtaBlockType } from "@muse/core";
import { useAutoResize } from "../hooks";
import styles from "./Cta.module.css";

interface Props {
  block: CtaBlockType
  onUpdate: (data: Partial<CtaBlockType>) => void
}

export function Cta({ block, onUpdate }: Props) {
  const variant = block.variant ?? "primary";
  const headlineRef = useAutoResize(block.headline);
  const variantClass = variant === "primary" ? styles.primary : styles.secondary;

  return (
    <div className={`${styles.section} ${variantClass}`}>
      <textarea
        ref={headlineRef}
        className={styles.headline}
        rows={1}
        value={block.headline}
        onChange={e => onUpdate({ headline: e.target.value })}
        placeholder="CTA headline..."
      />
      <textarea
        className={styles.description}
        value={block.description ?? ""}
        onChange={e => onUpdate({ description: e.target.value || undefined })}
        placeholder="Description..."
        rows={2}
      />
      <div className={styles.button}>
        <input
          type="text"
          value={block.buttonText}
          onChange={e => onUpdate({ buttonText: e.target.value })}
          placeholder="Button text..."
        />
        <input
          type="text"
          value={block.buttonHref}
          onChange={e => onUpdate({ buttonHref: e.target.value })}
          placeholder="Button link..."
        />
      </div>
      <select
        value={variant}
        onChange={e => onUpdate({ variant: e.target.value as "primary" | "secondary" })}
        className={styles.variantSelect}
      >
        <option value="primary">Primary</option>
        <option value="secondary">Secondary</option>
      </select>
    </div>
  );
}
