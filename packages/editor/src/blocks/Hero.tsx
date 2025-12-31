import type { HeroBlock as HeroBlockType } from "@muse/core";
import { EditableText, EditableLink } from "../ux";
import styles from "./Hero.module.css";

interface Props {
  block: HeroBlockType
  onUpdate: (data: Partial<HeroBlockType>) => void
}

export function Hero({ block, onUpdate }: Props) {
  const alignment = block.alignment ?? "center";

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
      <EditableText
        value={block.headline}
        onChange={v => onUpdate({ headline: v })}
        as="h1"
        className={styles.headline}
        placeholder="Headline..."
      />
      <EditableText
        value={block.subheadline ?? ""}
        onChange={v => onUpdate({ subheadline: v || undefined })}
        as="p"
        className={styles.subheadline}
        placeholder="Subheadline..."
      />
      <div className={styles.ctas}>
        {block.cta && (
          <EditableLink
            text={block.cta.text}
            href={block.cta.href}
            onTextChange={v => onUpdate({ cta: { text: v, href: block.cta?.href ?? "#" } })}
            className={styles.cta}
            placeholder="Primary CTA..."
          />
        )}
        {block.secondaryCta && (
          <EditableLink
            text={block.secondaryCta.text}
            href={block.secondaryCta.href}
            onTextChange={v => onUpdate({ secondaryCta: { text: v, href: block.secondaryCta?.href ?? "#" } })}
            className={styles.ctaSecondary}
            placeholder="Secondary CTA..."
          />
        )}
      </div>
    </div>
  );
}
