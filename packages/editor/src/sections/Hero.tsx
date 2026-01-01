import type { HeroBlock as HeroBlockType } from "@muse/core";
import { EditableText, EditableLink, ImageLoader } from "../ux";
import styles from "./Hero.module.css";

interface Props {
  block: HeroBlockType
  onUpdate: (data: Partial<HeroBlockType>) => void
  isPending?: boolean
}

function HeroContent({ block, onUpdate }: Omit<Props, "isPending">) {
  return (
    <>
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
    </>
  );
}

export function Hero({ block, onUpdate, isPending }: Props) {
  const preset = block.preset ?? "hero-centered";
  const isSplit = preset === "hero-split-left" || preset === "hero-split-right";
  const isOverlay = preset === "hero-overlay";

  // Split layout: side-by-side text and image
  if (isSplit) {
    const imageFirst = preset === "hero-split-right";
    return (
      <div className={`${styles.section} ${styles.split} ${imageFirst ? styles.splitRight : ""}`}>
        <div className={styles.splitContent}>
          <HeroContent block={block} onUpdate={onUpdate} />
        </div>
        <div className={styles.splitImage}>
          <ImageLoader
            image={block.backgroundImage}
            isPending={!!isPending}
            className={styles.splitImg}
          />
        </div>
      </div>
    );
  }

  // Overlay layout: full-bleed background with text on top
  if (isOverlay && block.backgroundImage) {
    const overlayOpacity = (block.backgroundOverlay ?? 50) / 100;
    return (
      <div
        className={`${styles.section} ${styles.overlay}`}
        style={{
          backgroundImage: `url(${block.backgroundImage.url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className={styles.overlayBg}
          style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
        />
        <HeroContent block={block} onUpdate={onUpdate} />
      </div>
    );
  }

  // Centered layout: default
  return (
    <div className={styles.section}>
      <HeroContent block={block} onUpdate={onUpdate} />
    </div>
  );
}
