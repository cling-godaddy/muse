import type { ReactNode } from "react";
import type { SectionSchema } from "./schema";
import styles from "./Contact.module.css";

export type ContactVariant = "form" | "split-map";

export interface ContactProps {
  /** Headline slot */
  headline?: ReactNode
  /** Subheadline slot */
  subheadline?: ReactNode
  /** Contact info (email, phone, address) slot */
  contactInfo?: ReactNode
  /** Contact form slot */
  form?: ReactNode
  /** Map slot - for split-map variant */
  map?: ReactNode
  /** Layout variant */
  variant?: ContactVariant
  /** Background color */
  backgroundColor?: string
  /** Additional class name */
  className?: string
}

/**
 * Contact section - pure layout component
 */
export function Contact({
  headline,
  subheadline,
  contactInfo,
  form,
  map,
  variant = "form",
  backgroundColor,
  className,
}: ContactProps) {
  if (variant === "split-map") {
    return (
      <section
        className={`${styles.section} ${styles.splitMap} ${className ?? ""}`}
        style={{ backgroundColor }}
      >
        <div className={styles.content}>
          {headline && <div className={styles.headline}>{headline}</div>}
          {subheadline && <div className={styles.subheadline}>{subheadline}</div>}
          {contactInfo && <div className={styles.contactInfo}>{contactInfo}</div>}
          {form && <div className={styles.form}>{form}</div>}
        </div>
        {map && <div className={styles.map}>{map}</div>}
      </section>
    );
  }

  // Form variant (default)
  return (
    <section
      className={`${styles.section} ${className ?? ""}`}
      style={{ backgroundColor }}
    >
      {headline && <div className={styles.headline}>{headline}</div>}
      {subheadline && <div className={styles.subheadline}>{subheadline}</div>}
      {contactInfo && <div className={styles.contactInfo}>{contactInfo}</div>}
      {form && <div className={styles.form}>{form}</div>}
    </section>
  );
}

Contact.schema = {
  headline: { type: "rich-text", slot: "headline", label: "Headline", optional: true },
  subheadline: { type: "text", slot: "subheadline", label: "Subheadline", optional: true },
  formFields: { type: "list", slot: "form", label: "Form Fields", optional: true },
} satisfies SectionSchema;

Contact.displayName = "Contact";
