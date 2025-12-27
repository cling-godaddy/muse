import type { HeroBlock as HeroBlockType } from "@muse/core";
import { useAutoResize } from "../hooks";
import styles from "./Hero.module.css";

interface Props {
  block: HeroBlockType
  onUpdate: (data: Partial<HeroBlockType>) => void
}

export function Hero({ block, onUpdate }: Props) {
  const alignment = block.alignment ?? "center";
  const headlineRef = useAutoResize(block.headline);
  const subheadlineRef = useAutoResize(block.subheadline ?? "");

  const hasBackground = !!block.backgroundImage;
  const overlayOpacity = (block.backgroundOverlay ?? 50) / 100;

  const containerStyle = block.backgroundImage
    ? {
      backgroundImage: `url(${block.backgroundImage.url})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }
    : undefined;

  const alignmentClass = alignment === "left" ? styles.left : alignment === "right" ? styles.right : "";
  const sectionClasses = [styles.section, alignmentClass, hasBackground ? styles.withBg : ""].filter(Boolean).join(" ");

  return (
    <div className={sectionClasses} style={containerStyle}>
      {hasBackground && (
        <div
          className={styles.overlay}
          style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
        />
      )}
      <textarea
        ref={headlineRef}
        className={styles.headline}
        rows={1}
        value={block.headline}
        onChange={e => onUpdate({ headline: e.target.value })}
        placeholder="Headline..."
      />
      <textarea
        ref={subheadlineRef}
        className={styles.subheadline}
        rows={1}
        value={block.subheadline ?? ""}
        onChange={e => onUpdate({ subheadline: e.target.value || undefined })}
        placeholder="Subheadline..."
      />
      <div className={styles.ctas}>
        <div className={styles.cta}>
          <input
            type="text"
            value={block.cta?.text ?? ""}
            onChange={e => onUpdate({
              cta: { text: e.target.value, href: block.cta?.href ?? "#" },
            })}
            placeholder="CTA text..."
          />
          <input
            type="text"
            value={block.cta?.href ?? ""}
            onChange={e => onUpdate({
              cta: { text: block.cta?.text ?? "", href: e.target.value },
            })}
            placeholder="CTA link..."
          />
        </div>
      </div>
    </div>
  );
}
