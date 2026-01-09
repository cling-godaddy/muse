import { useState, type ReactNode } from "react";
import type { SectionSchema } from "./schema";
import styles from "./Navbar.module.css";

export interface NavbarProps {
  /** Logo slot - text or image */
  logo?: ReactNode
  /** Navigation items - array of link/dropdown elements */
  items: ReactNode
  /** CTA button slot */
  cta?: ReactNode
  /** Whether navbar is sticky */
  sticky?: boolean
  /** Additional class name */
  className?: string
}

/**
 * Navbar section - pure layout component
 *
 * Includes mobile drawer behavior as it's presentation logic.
 */
export function Navbar({
  logo,
  items,
  cta,
  sticky,
  className,
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav
      className={`${styles.navbar} ${className ?? ""}`}
      data-sticky={sticky}
    >
      <div className={styles.container}>
        {/* Logo */}
        {logo && <div className={styles.logo}>{logo}</div>}

        {/* Nav Items */}
        <div className={styles.nav}>{items}</div>

        {/* CTA */}
        {cta && <div className={styles.cta}>{cta}</div>}

        {/* Mobile hamburger */}
        <button
          type="button"
          className={styles.hamburger}
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      <div
        className={styles.drawerOverlay}
        data-open={isMenuOpen}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile drawer */}
      <div className={styles.drawer} data-open={isMenuOpen}>
        <div className={styles.drawerHeader}>
          {logo && <div className={styles.logo}>{logo}</div>}
          <button
            type="button"
            className={styles.drawerClose}
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        <nav className={styles.drawerNav}>
          {items}
        </nav>
        {cta && <div className={styles.drawerCta}>{cta}</div>}
      </div>
    </nav>
  );
}

Navbar.schema = {
  logo: { type: "text", slot: "logo", label: "Logo", optional: true },
  items: { type: "list", slot: "items", label: "Nav Items" },
  cta: { type: "cta", slot: "cta", label: "CTA Button", optional: true },
} satisfies SectionSchema;

Navbar.displayName = "Navbar";
