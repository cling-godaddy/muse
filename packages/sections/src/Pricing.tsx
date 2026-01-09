import type { ReactNode } from "react";
import type { SectionSchema } from "./schema";
import styles from "./Pricing.module.css";

export interface PricingProps {
  /** Headline slot */
  headline?: ReactNode
  /** Subheadline slot */
  subheadline?: ReactNode
  /** Pricing plan cards - array of plan elements */
  plans: ReactNode
  /** Background color */
  backgroundColor?: string
  /** Additional class name */
  className?: string
}

/**
 * Pricing section - pure layout component
 */
export function Pricing({
  headline,
  subheadline,
  plans,
  backgroundColor,
  className,
}: PricingProps) {
  return (
    <section
      className={`${styles.section} ${className ?? ""}`}
      style={{ backgroundColor }}
    >
      {headline && <div className={styles.headline}>{headline}</div>}
      {subheadline && <div className={styles.subheadline}>{subheadline}</div>}
      <div className={styles.plans}>{plans}</div>
    </section>
  );
}

Pricing.schema = {
  headline: { type: "rich-text", slot: "headline", label: "Headline", optional: true },
  subheadline: { type: "text", slot: "subheadline", label: "Subheadline", optional: true },
  plans: { type: "list", slot: "plans", label: "Plans" },
} satisfies SectionSchema;

Pricing.displayName = "Pricing";
