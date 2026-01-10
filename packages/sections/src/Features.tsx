import type { ReactNode } from "react";
import type { SectionSchema } from "./schema";
import styles from "./Features.module.css";
import { wrapChildren } from "./utils";

export type FeaturesVariant = "grid" | "grid-images" | "bento" | "bento-spotlight" | "bento-split" | "numbered";

export interface FeaturesProps {
  /** Headline slot */
  headline?: ReactNode
  /** Feature items - array of feature card elements */
  items: ReactNode
  /** Layout variant */
  variant?: FeaturesVariant
  /** Number of columns for grid variants */
  columns?: 2 | 3 | 4
  /** Background color */
  backgroundColor?: string
  /** Additional class name */
  className?: string
}

/**
 * Features section - pure layout component
 */
export function Features({
  headline,
  items,
  variant = "grid",
  columns = 3,
  backgroundColor,
  className,
}: FeaturesProps) {
  const isBento = variant.startsWith("bento");
  const isNumbered = variant === "numbered";
  const variantClass = isBento
    ? styles.bento
    : isNumbered
      ? styles.numbered
      : styles.grid;

  return (
    <section
      className={`${styles.section} ${variantClass} ${className ?? ""}`}
      style={{ backgroundColor }}
    >
      {headline && <div className={styles.headline}>{headline}</div>}
      <div
        className={styles.items}
        style={{ "--columns": columns } as React.CSSProperties}
      >
        {wrapChildren(items, styles.item)}
      </div>
    </section>
  );
}

Features.schema = {
  headline: { type: "rich-text", slot: "headline", label: "Headline", optional: true },
  items: { type: "list", slot: "items", label: "Features" },
} satisfies SectionSchema;

Features.displayName = "Features";
