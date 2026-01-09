import type { ReactNode } from "react";
import type { SectionSchema } from "./schema";
import styles from "./Stats.module.css";

export type StatsVariant = "row" | "grid" | "counters";

export interface StatsProps {
  /** Headline slot */
  headline?: ReactNode
  /** Stat items - array of stat card elements */
  stats: ReactNode
  /** Layout variant */
  variant?: StatsVariant
  /** Background color */
  backgroundColor?: string
  /** Additional class name */
  className?: string
}

/**
 * Stats/metrics section - pure layout component
 */
export function Stats({
  headline,
  stats,
  variant = "row",
  backgroundColor,
  className,
}: StatsProps) {
  const variantClass = variant === "grid"
    ? styles.grid
    : variant === "counters"
      ? styles.counters
      : styles.row;

  return (
    <section
      className={`${styles.section} ${variantClass} ${className ?? ""}`}
      style={{ backgroundColor }}
    >
      {headline && <div className={styles.headline}>{headline}</div>}
      <div className={styles.stats}>{stats}</div>
    </section>
  );
}

Stats.schema = {
  headline: { type: "rich-text", slot: "headline", label: "Headline", optional: true },
  stats: { type: "list", slot: "stats", label: "Stats" },
} satisfies SectionSchema;

Stats.displayName = "Stats";
