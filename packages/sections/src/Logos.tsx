import type { ReactNode } from "react";
import type { SectionSchema } from "./schema";
import styles from "./Logos.module.css";
import { wrapChildren } from "./utils";

export type LogosVariant = "grid" | "marquee";

export interface LogosProps {
  /** Headline slot */
  headline?: ReactNode
  /** Logo items - array of logo elements */
  logos: ReactNode
  /** Layout variant */
  variant?: LogosVariant
  /** Background color */
  backgroundColor?: string
  /** Additional class name */
  className?: string
}

/**
 * Logos/trust badges section - pure layout component
 */
export function Logos({
  headline,
  logos,
  variant = "grid",
  backgroundColor,
  className,
}: LogosProps) {
  if (variant === "marquee") {
    return (
      <section
        className={`${styles.section} ${styles.marquee} ${className ?? ""}`}
        style={{ backgroundColor }}
      >
        {headline && <div className={styles.headline}>{headline}</div>}
        <div className={styles.marqueeTrack}>
          <div className={styles.marqueeContent}>{wrapChildren(logos, styles.logo)}</div>
          <div className={styles.marqueeContent} aria-hidden="true">{wrapChildren(logos, styles.logo)}</div>
        </div>
      </section>
    );
  }

  // Grid variant (default)
  return (
    <section
      className={`${styles.section} ${className ?? ""}`}
      style={{ backgroundColor }}
    >
      {headline && <div className={styles.headline}>{headline}</div>}
      <div className={styles.grid}>{wrapChildren(logos, styles.logo)}</div>
    </section>
  );
}

Logos.schema = {
  headline: { type: "rich-text", slot: "headline", label: "Headline", optional: true },
  logos: { type: "list", slot: "logos", label: "Logos" },
} satisfies SectionSchema;

Logos.displayName = "Logos";
