import type { ReactNode } from "react";
import type { SectionSchema } from "./schema";
import styles from "./Testimonials.module.css";

export type TestimonialsVariant = "grid" | "single" | "carousel";

export interface TestimonialsProps {
  /** Headline slot */
  headline?: ReactNode
  /** Quote items - array of testimonial card elements */
  quotes: ReactNode
  /** Layout variant */
  variant?: TestimonialsVariant
  /** Background color */
  backgroundColor?: string
  /** Additional class name */
  className?: string
}

/**
 * Testimonials section - pure layout component
 */
export function Testimonials({
  headline,
  quotes,
  variant = "grid",
  backgroundColor,
  className,
}: TestimonialsProps) {
  const variantClass = variant === "single"
    ? styles.single
    : variant === "carousel"
      ? styles.carousel
      : styles.grid;

  return (
    <section
      className={`${styles.section} ${variantClass} ${className ?? ""}`}
      style={{ backgroundColor }}
    >
      {headline && <div className={styles.headline}>{headline}</div>}
      <div className={styles.quotes}>{quotes}</div>
    </section>
  );
}

Testimonials.schema = {
  headline: { type: "rich-text", slot: "headline", label: "Headline", optional: true },
  quotes: { type: "list", slot: "quotes", label: "Testimonials" },
} satisfies SectionSchema;

Testimonials.displayName = "Testimonials";
