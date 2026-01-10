import type { ReactNode } from "react";
import type { SectionSchema } from "./schema";
import styles from "./Hero.module.css";

export type HeroVariant = "centered" | "split-left" | "split-right" | "overlay";

export interface HeroProps {
  /** Main headline slot */
  headline: ReactNode
  /** Subheadline slot */
  subheadline?: ReactNode
  /** Primary CTA slot */
  cta?: ReactNode
  /** Secondary CTA slot */
  secondaryCta?: ReactNode
  /** Background image slot (for split/overlay variants) */
  image?: ReactNode
  /** Background color */
  backgroundColor?: string
  /** Overlay opacity for overlay variant (0-100) */
  overlayOpacity?: number
  /** Background image URL for overlay variant */
  backgroundImageUrl?: string
  /** Layout variant */
  variant?: HeroVariant
  /** Additional class name */
  className?: string
}

/**
 * Hero section - pure layout component
 *
 * Accepts content as slots (ReactNode), has no editing logic.
 * The editor layer is responsible for passing editable components as slots.
 */
export function Hero({
  headline,
  subheadline,
  cta,
  secondaryCta,
  image,
  backgroundColor,
  backgroundImageUrl,
  overlayOpacity = 50,
  variant = "centered",
  className,
}: HeroProps) {
  const isSplit = variant === "split-left" || variant === "split-right";
  const isOverlay = variant === "overlay";

  // Split layout: side-by-side text and image
  if (isSplit) {
    const imageFirst = variant === "split-right";
    return (
      <section
        className={`${styles.section} ${styles.split} ${imageFirst ? styles.splitRight : ""} ${className ?? ""}`}
        style={{ backgroundColor }}
      >
        <div className={styles.splitContent}>
          <div className={styles.headline}>{headline}</div>
          {subheadline && <div className={styles.subheadline}>{subheadline}</div>}
          {(cta || secondaryCta) && (
            <div className={styles.ctas}>
              {cta && <div className={styles.cta}>{cta}</div>}
              {secondaryCta && <div className={styles.ctaSecondary}>{secondaryCta}</div>}
            </div>
          )}
        </div>
        <div className={styles.splitImage}>
          {image}
        </div>
      </section>
    );
  }

  // Overlay layout: full-bleed background with text on top
  if (isOverlay && backgroundImageUrl) {
    return (
      <section
        className={`${styles.section} ${styles.overlay} ${className ?? ""}`}
        style={{
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className={styles.overlayBg}
          style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity / 100})` }}
        />
        <div className={styles.overlayContent}>
          <div className={styles.headline}>{headline}</div>
          {subheadline && <div className={styles.subheadline}>{subheadline}</div>}
          {(cta || secondaryCta) && (
            <div className={styles.ctas}>
              {cta && <div className={styles.cta}>{cta}</div>}
              {secondaryCta && <div className={styles.ctaSecondary}>{secondaryCta}</div>}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Centered layout: default
  return (
    <section
      className={`${styles.section} ${className ?? ""}`}
      style={{ backgroundColor }}
    >
      <header className={styles.header}>
        <div className={styles.headline}>{headline}</div>
        {subheadline && <div className={styles.subheadline}>{subheadline}</div>}
      </header>
      {(cta || secondaryCta) && (
        <div className={styles.ctas}>
          {cta && <div className={styles.cta}>{cta}</div>}
          {secondaryCta && <div className={styles.ctaSecondary}>{secondaryCta}</div>}
        </div>
      )}
    </section>
  );
}

/**
 * Schema describing Hero's editable fields
 */
Hero.schema = {
  headline: { type: "rich-text", slot: "headline", label: "Headline" },
  subheadline: { type: "rich-text", slot: "subheadline", label: "Subheadline", optional: true },
  cta: { type: "cta", slot: "cta", label: "Primary CTA", optional: true },
  secondaryCta: { type: "cta", slot: "secondaryCta", label: "Secondary CTA", optional: true },
  backgroundImage: { type: "image", slot: "image", label: "Background Image", optional: true },
  backgroundColor: { type: "color", slot: "backgroundColor", label: "Background Color", optional: true },
} satisfies SectionSchema;

Hero.displayName = "Hero";
