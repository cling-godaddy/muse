import type { ReactNode } from "react";
import type { SectionSchema } from "./schema";
import styles from "./Footer.module.css";

export interface FooterProps {
  /** Company name slot */
  companyName?: ReactNode
  /** Navigation links - array of link elements */
  links?: ReactNode
  /** Social icons - array of social link elements */
  socialLinks?: ReactNode
  /** Copyright text slot */
  copyright?: ReactNode
  /** Background color */
  backgroundColor?: string
  /** Additional class name */
  className?: string
}

/**
 * Footer section - pure layout component
 *
 * For lists (links, socialLinks), pass pre-rendered ReactNode arrays.
 * The editor layer handles rendering editable items.
 */
export function Footer({
  companyName,
  links,
  socialLinks,
  copyright,
  backgroundColor,
  className,
}: FooterProps) {
  return (
    <footer
      className={`${styles.footer} ${className ?? ""}`}
      style={{ backgroundColor }}
    >
      {companyName && (
        <div className={styles.companyName}>{companyName}</div>
      )}

      {links && (
        <nav className={styles.nav}>{links}</nav>
      )}

      {socialLinks && (
        <div className={styles.socials}>{socialLinks}</div>
      )}

      {copyright && (
        <div className={styles.copyright}>{copyright}</div>
      )}
    </footer>
  );
}

Footer.schema = {
  companyName: { type: "text", slot: "companyName", label: "Company Name", optional: true },
  links: { type: "list", slot: "links", label: "Links", optional: true },
  socialLinks: { type: "list", slot: "socialLinks", label: "Social Links", optional: true },
  copyright: { type: "text", slot: "copyright", label: "Copyright", optional: true },
} satisfies SectionSchema;

Footer.displayName = "Footer";
