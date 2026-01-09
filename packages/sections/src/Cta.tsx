import type { ReactNode } from "react";
import type { SectionSchema } from "./schema";
import styles from "./Cta.module.css";

export type CtaVariant = "primary" | "secondary";

export interface CtaProps {
  /** Main headline slot */
  headline: ReactNode
  /** Description slot */
  description?: ReactNode
  /** Button/CTA slot */
  button: ReactNode
  /** Visual variant */
  variant?: CtaVariant
  /** Background color */
  backgroundColor?: string
  /** Additional class name */
  className?: string
}

/**
 * Call-to-action section - pure layout component
 */
export function Cta({
  headline,
  description,
  button,
  variant = "primary",
  backgroundColor,
  className,
}: CtaProps) {
  const variantClass = variant === "primary" ? styles.primary : styles.secondary;

  return (
    <section
      className={`${styles.section} ${variantClass} ${className ?? ""}`}
      style={{ backgroundColor }}
    >
      <div className={styles.headline}>{headline}</div>
      {description && <div className={styles.description}>{description}</div>}
      <div className={styles.buttonWrapper}>{button}</div>
    </section>
  );
}

Cta.schema = {
  headline: { type: "rich-text", slot: "headline", label: "Headline" },
  description: { type: "rich-text", slot: "description", label: "Description", optional: true },
  buttonText: { type: "cta", slot: "button", label: "Button" },
} satisfies SectionSchema;

Cta.displayName = "Cta";
