import type { HeroSection as HeroSectionType } from "@muse/core";
import { EditableText, EditableLink, ImageLoader } from "../ux";
import styles from "./Hero.module.css";

interface Props {
  section: HeroSectionType
  onUpdate: (data: Partial<HeroSectionType>) => void
  isPending?: boolean
}

function HeroContent({ section, onUpdate }: Omit<Props, "isPending">) {
  return (
    <>
      <EditableText
        value={section.headline}
        onChange={v => onUpdate({ headline: v })}
        as="h1"
        className={styles.headline}
        placeholder="Headline..."
      />
      <EditableText
        value={section.subheadline ?? ""}
        onChange={v => onUpdate({ subheadline: v || undefined })}
        as="p"
        className={styles.subheadline}
        placeholder="Subheadline..."
      />
      <div className={styles.ctas}>
        {section.cta && (
          <EditableLink
            text={section.cta.text}
            href={section.cta.href}
            onTextChange={v => onUpdate({ cta: { text: v, href: section.cta?.href ?? "#" } })}
            className={styles.cta}
            placeholder="Primary CTA..."
          />
        )}
        {section.secondaryCta && (
          <EditableLink
            text={section.secondaryCta.text}
            href={section.secondaryCta.href}
            onTextChange={v => onUpdate({ secondaryCta: { text: v, href: section.secondaryCta?.href ?? "#" } })}
            className={styles.ctaSecondary}
            placeholder="Secondary CTA..."
          />
        )}
      </div>
    </>
  );
}

export function Hero({ section, onUpdate, isPending }: Props) {
  const preset = section.preset ?? "hero-centered";
  const isSplit = preset === "hero-split-left" || preset === "hero-split-right";
  const isOverlay = preset === "hero-overlay";

  // Split layout: side-by-side text and image
  if (isSplit) {
    const imageFirst = preset === "hero-split-right";
    return (
      <div className={`${styles.section} ${styles.split} ${imageFirst ? styles.splitRight : ""}`}>
        <div className={styles.splitContent}>
          <HeroContent section={section} onUpdate={onUpdate} />
        </div>
        <div className={styles.splitImage}>
          <ImageLoader
            image={section.backgroundImage}
            isPending={!!isPending}
            className={styles.splitImg}
          />
        </div>
      </div>
    );
  }

  // Overlay layout: full-bleed background with text on top
  if (isOverlay && section.backgroundImage) {
    const overlayOpacity = (section.backgroundOverlay ?? 50) / 100;
    return (
      <div
        className={`${styles.section} ${styles.overlay}`}
        style={{
          backgroundImage: `url(${section.backgroundImage.url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className={styles.overlayBg}
          style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
        />
        <HeroContent section={section} onUpdate={onUpdate} />
      </div>
    );
  }

  // Centered layout: default
  return (
    <div className={styles.section}>
      <HeroContent section={section} onUpdate={onUpdate} />
    </div>
  );
}
