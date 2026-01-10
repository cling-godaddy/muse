import type { ReactNode } from "react";
import type { SectionSchema } from "./schema";
import styles from "./Subscribe.module.css";

export type SubscribeVariant = "card" | "inline" | "banner";

export interface SubscribeProps {
  /** Headline slot */
  headline?: ReactNode
  /** Subheadline slot */
  subheadline?: ReactNode
  /** Email input slot */
  emailInput?: ReactNode
  /** Submit button slot */
  button: ReactNode
  /** Disclaimer text slot */
  disclaimer?: ReactNode
  /** Layout variant */
  variant?: SubscribeVariant
  /** Background color */
  backgroundColor?: string
  /** Additional class name */
  className?: string
}

/**
 * Subscribe/newsletter section - pure layout component
 */
export function Subscribe({
  headline,
  subheadline,
  emailInput,
  button,
  disclaimer,
  variant = "card",
  backgroundColor,
  className,
}: SubscribeProps) {
  const variantClass = variant === "inline"
    ? styles.inline
    : variant === "banner"
      ? styles.banner
      : styles.card;

  return (
    <section
      className={`${styles.section} ${variantClass} ${className ?? ""}`}
      style={{ backgroundColor }}
    >
      <div className={styles.content}>
        {(headline || subheadline) && (
          <header className={styles.header}>
            {headline && <div className={styles.headline}>{headline}</div>}
            {subheadline && <div className={styles.subheadline}>{subheadline}</div>}
          </header>
        )}
        <div className={styles.form}>
          {emailInput && <div className={styles.emailInput}>{emailInput}</div>}
          <div className={styles.button}>{button}</div>
        </div>
        {disclaimer && <div className={styles.disclaimer}>{disclaimer}</div>}
      </div>
    </section>
  );
}

Subscribe.schema = {
  headline: { type: "rich-text", slot: "headline", label: "Headline", optional: true },
  subheadline: { type: "text", slot: "subheadline", label: "Subheadline", optional: true },
  buttonText: { type: "cta", slot: "button", label: "Button" },
  placeholderText: { type: "text", slot: "emailInput", label: "Placeholder", optional: true },
  disclaimer: { type: "text", slot: "disclaimer", label: "Disclaimer", optional: true },
} satisfies SectionSchema;

Subscribe.displayName = "Subscribe";
