import type { ReactNode } from "react";
import type { Section } from "@muse/core";
import type { LayoutComponent } from "./sectionRegistry";
import { StaticField } from "./StaticField";

interface Props {
  /** The section component to render */
  Component: LayoutComponent
  /** Section data */
  section: Section
  /** Additional class name */
  className?: string
}

/**
 * Renders a section in static (non-editable) mode.
 * Used for preview and published pages.
 *
 * For each field defined in the section's schema:
 * 1. Creates a StaticField with the current value
 * 2. Passes it to the section component via the slot prop
 */
export function StaticSection({
  Component,
  section,
  className,
}: Props) {
  const schema = Component.schema;
  const slots: Record<string, ReactNode> = {};

  // Build slot props from schema
  for (const [fieldName, fieldSchema] of Object.entries(schema)) {
    const value = (section as unknown as Record<string, unknown>)[fieldName];

    // Skip optional fields with no value
    if (fieldSchema.optional && (value === undefined || value === null)) {
      continue;
    }

    slots[fieldSchema.slot] = (
      <StaticField
        key={fieldName}
        schema={fieldSchema}
        value={value}
      />
    );
  }

  // Pass non-schema props (variant, className, etc.) directly
  const directProps: Record<string, unknown> = {
    className,
  };

  // Common props that sections might need but aren't in schema
  if ("variant" in section) directProps.variant = section.variant;
  if ("preset" in section) directProps.variant = (section.preset as string)?.replace(/^[^-]+-/, "");
  if ("backgroundColor" in section) directProps.backgroundColor = section.backgroundColor;
  if ("backgroundOverlay" in section) directProps.overlayOpacity = section.backgroundOverlay;
  if ("backgroundImage" in section && "backgroundImage" in (schema as Record<string, unknown>) === false) {
    const bg = (section as { backgroundImage?: { url: string } }).backgroundImage;
    if (bg?.url) directProps.backgroundImageUrl = bg.url;
  }

  return <Component {...slots} {...directProps} />;
}
