import { type HeroSection as HeroSectionType, type RichContent } from "@muse/core";
import { EditableText, EditableLink, ImageLoader, Skeleton } from "../ux";
import styles from "./Hero.module.css";

interface Props {
  section: HeroSectionType
  onUpdate: (data: Partial<HeroSectionType>) => void
  isPending?: boolean
}

function HeroSkeleton() {
  return (
    <>
      <Skeleton variant="text" height="3em" width="80%" />
      <Skeleton variant="text" height="1.5em" width="60%" />
      <div className={styles.ctas}>
        <Skeleton variant="rect" height="48px" width="140px" />
        <Skeleton variant="rect" height="48px" width="140px" />
      </div>
    </>
  );
}

function HeroContent({ section, onUpdate, isPending }: Props) {
  if (isPending) {
    return <HeroSkeleton />;
  }

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
        rich
        value={section.subheadline ?? ""}
        onChange={(v: RichContent) => onUpdate({ subheadline: v.text ? v : undefined })}
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
      <div className={`${styles.section} ${styles.split} ${imageFirst ? styles.splitRight : ""}`} style={{ backgroundColor: section.backgroundColor }}>
        <div className={styles.splitContent}>
          <HeroContent section={section} onUpdate={onUpdate} isPending={isPending} />
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
        <HeroContent section={section} onUpdate={onUpdate} isPending={isPending} />
      </div>
    );
  }

  // Centered layout: default
  return (
    <div className={styles.section} style={{ backgroundColor: section.backgroundColor }}>
      <HeroContent section={section} onUpdate={onUpdate} isPending={isPending} />
    </div>
  );
}
