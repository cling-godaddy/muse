import type { LogosBlock as LogosBlockType, LogoItem } from "@muse/core";
import { useAutoResize } from "../hooks";
import { ImageLoader } from "../ux";
import styles from "./Logos.module.css";

interface Props {
  block: LogosBlockType
  onUpdate: (data: Partial<LogosBlockType>) => void
  isPending?: boolean
}

export function Logos({ block, onUpdate, isPending }: Props) {
  const headlineRef = useAutoResize(block.headline ?? "");

  const updateLogo = (index: number, data: Partial<LogoItem>) => {
    const logos = block.logos.map((logo, i) =>
      i === index ? { ...logo, ...data } : logo,
    );
    onUpdate({ logos });
  };

  const removeLogo = (index: number) => {
    onUpdate({ logos: block.logos.filter((_, i) => i !== index) });
  };

  return (
    <div className={styles.section}>
      <textarea
        ref={headlineRef}
        className={styles.headline}
        rows={1}
        value={block.headline ?? ""}
        onChange={e => onUpdate({ headline: e.target.value || undefined })}
        placeholder="Trusted by"
      />

      <div className={styles.grid}>
        {block.logos.map((logo, i) => (
          <div key={i} className={styles.logo}>
            <ImageLoader
              image={logo.image}
              isPending={!!isPending}
              className={styles.logoImage}
            />
            <input
              type="text"
              value={logo.href ?? ""}
              onChange={e => updateLogo(i, { href: e.target.value || undefined })}
              placeholder="Link (optional)"
              className={styles.logoLink}
            />
            <button
              type="button"
              onClick={() => removeLogo(i)}
              className={styles.removeButton}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
