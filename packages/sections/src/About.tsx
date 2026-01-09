import type { ReactNode } from "react";
import type { SectionSchema } from "./schema";
import styles from "./About.module.css";

export type AboutVariant = "story" | "team";

export interface AboutProps {
  /** Headline slot */
  headline?: ReactNode
  /** Body text slot */
  body?: ReactNode
  /** Image slot */
  image?: ReactNode
  /** Team members - for team variant */
  teamMembers?: ReactNode
  /** Layout variant */
  variant?: AboutVariant
  /** Background color */
  backgroundColor?: string
  /** Additional class name */
  className?: string
}

/**
 * About section - pure layout component
 */
export function About({
  headline,
  body,
  image,
  teamMembers,
  variant = "story",
  backgroundColor,
  className,
}: AboutProps) {
  if (variant === "team") {
    return (
      <section
        className={`${styles.section} ${styles.team} ${className ?? ""}`}
        style={{ backgroundColor }}
      >
        {headline && <div className={styles.headline}>{headline}</div>}
        {body && <div className={styles.body}>{body}</div>}
        {teamMembers && <div className={styles.teamGrid}>{teamMembers}</div>}
      </section>
    );
  }

  // Story variant (default)
  return (
    <section
      className={`${styles.section} ${styles.story} ${className ?? ""}`}
      style={{ backgroundColor }}
    >
      {headline && <div className={styles.headline}>{headline}</div>}
      {image && <div className={styles.image}>{image}</div>}
      {body && <div className={styles.body}>{body}</div>}
    </section>
  );
}

About.schema = {
  headline: { type: "rich-text", slot: "headline", label: "Headline", optional: true },
  body: { type: "rich-text", slot: "body", label: "Body", optional: true },
  image: { type: "image", slot: "image", label: "Image", optional: true },
  teamMembers: { type: "list", slot: "teamMembers", label: "Team Members", optional: true },
} satisfies SectionSchema;

About.displayName = "About";
