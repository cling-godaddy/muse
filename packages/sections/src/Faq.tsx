import type { ReactNode } from "react";
import type { SectionSchema } from "./schema";
import styles from "./Faq.module.css";

export type FaqVariant = "accordion" | "two-column";

export interface FaqProps {
  /** Headline slot */
  headline?: ReactNode
  /** Subheadline slot */
  subheadline?: ReactNode
  /** FAQ items - array of question/answer elements */
  items: ReactNode
  /** Layout variant */
  variant?: FaqVariant
  /** Background color */
  backgroundColor?: string
  /** Additional class name */
  className?: string
}

/**
 * FAQ section - pure layout component
 *
 * Note: Accordion interactivity is handled at the layout level since it's
 * presentation logic, not editing logic.
 */
export function Faq({
  headline,
  subheadline,
  items,
  variant = "accordion",
  backgroundColor,
  className,
}: FaqProps) {
  const variantClass = variant === "two-column" ? styles.twoColumn : styles.accordion;

  return (
    <section
      className={`${styles.section} ${variantClass} ${className ?? ""}`}
      style={{ backgroundColor }}
    >
      {headline && <div className={styles.headline}>{headline}</div>}
      {subheadline && <div className={styles.subheadline}>{subheadline}</div>}
      <div className={styles.items}>{items}</div>
    </section>
  );
}

Faq.schema = {
  headline: { type: "rich-text", slot: "headline", label: "Headline", optional: true },
  subheadline: { type: "text", slot: "subheadline", label: "Subheadline", optional: true },
  items: { type: "list", slot: "items", label: "FAQ Items" },
} satisfies SectionSchema;

Faq.displayName = "Faq";
